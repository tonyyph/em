import { getCycleLengths, getCycleLengthSeries, predictCycle } from "@/utils/algorithms/cyclePrediction";
import type { Cycle } from "@/domain/entities/cycle";

const cycle = (id: string, startDate: string, endDate?: string): Cycle => ({
  id,
  startDate,
  endDate,
  createdAt: `${startDate}T00:00:00.000Z`,
  updatedAt: `${startDate}T00:00:00.000Z`
});

describe("predictCycle", () => {
  it("predicts next period, ovulation, and fertile window from recent cycles", () => {
    const prediction = predictCycle([
      cycle("1", "2026-01-01", "2026-01-05"),
      cycle("2", "2026-01-29", "2026-02-02"),
      cycle("3", "2026-02-26", "2026-03-02"),
      cycle("4", "2026-03-26", "2026-03-30")
    ], {}, "2026-04-01");

    expect(prediction.averageCycleLength).toBe(28);
    expect(prediction.nextPeriodStart).toBe("2026-04-23");
    expect(prediction.ovulationDay).toBe("2026-04-09");
    expect(prediction.fertileWindowStart).toBe("2026-04-04");
    expect(prediction.fertileWindowEnd).toBe("2026-04-10");
  });

  it("returns a range and lower confidence for irregular cycles", () => {
    const prediction = predictCycle([
      cycle("1", "2026-01-01"),
      cycle("2", "2026-01-25"),
      cycle("3", "2026-03-01"),
      cycle("4", "2026-03-24")
    ], {}, "2026-04-01");

    expect(prediction.confidence).toBe("medium");
    expect(prediction.irregularityDays).toBeGreaterThanOrEqual(5);
    expect(prediction.nextPeriodRange).toBeDefined();
  });

  it("falls back to setup config when history is missing", () => {
    const prediction = predictCycle([], { averageCycleLength: 30, averagePeriodLength: 6 }, "2026-08-10");

    expect(prediction.averageCycleLength).toBe(30);
    expect(prediction.averagePeriodLength).toBe(6);
    expect(prediction.nextPeriodStart).toBe("2026-09-09");
    expect(prediction.confidence).toBe("low");
  });
});

describe("predictCycle when logging has lapsed", () => {
  // Anchoring on the last recorded start and adding one cycle length reports a
  // date in the past as "next", which every countdown, phase and calendar tint
  // downstream then treats as current.
  const lapsed = [
    cycle("1", "2026-01-05", "2026-01-09"),
    cycle("2", "2026-02-02", "2026-02-06"),
    cycle("3", "2026-03-02", "2026-03-06")
  ];

  it("never predicts a next period that has already finished", () => {
    const prediction = predictCycle(lapsed, {}, "2026-08-19");

    expect(prediction.nextPeriodEnd >= "2026-08-19").toBe(true);
  });

  it("rolls forward in whole cycle lengths from the last recorded start", () => {
    const prediction = predictCycle(lapsed, {}, "2026-08-19");

    // 2026-03-02 plus five whole 28-day cycles, not one.
    expect(prediction.nextPeriodStart).toBe("2026-08-17");
    expect(prediction.ovulationDay).toBe("2026-08-03");
  });

  it("keeps a period that is under way rather than skipping to the next one", () => {
    // 2026-08-20 sits inside the 2026-08-17 → 2026-08-21 predicted window.
    const prediction = predictCycle(lapsed, {}, "2026-08-20");

    expect(prediction.nextPeriodStart).toBe("2026-08-17");
  });

  it("moves on once the predicted window has passed", () => {
    const prediction = predictCycle(lapsed, {}, "2026-08-22");

    expect(prediction.nextPeriodStart).toBe("2026-09-14");
  });
});

describe("getCycleLengthSeries", () => {
  it("labels each gap with the cycle start that closed it", () => {
    const starts = [
      "2025-12-01",
      "2025-12-29",
      "2026-01-26",
      "2026-02-23",
      "2026-03-23",
      "2026-04-20",
      "2026-05-18",
      "2026-06-15"
    ];
    const series = getCycleLengthSeries(starts.map((start, index) => cycle(`${index}`, start)));

    // Seven gaps, trimmed to the most recent six: the first one kept is the
    // gap that ends on 2025-12-29 having been dropped, so it ends on 2026-01-26.
    expect(series).toHaveLength(6);
    expect(series[0]).toEqual({ value: 28, startDate: "2026-01-26" });
    expect(series.at(-1)).toEqual({ value: 28, startDate: "2026-06-15" });
  });

  it("skips implausible gaps without shifting the labels of the rest", () => {
    const series = getCycleLengthSeries([
      cycle("1", "2026-01-01"),
      cycle("2", "2026-01-03"), // 2 days — not a cycle, filtered out
      cycle("3", "2026-01-31"),
      cycle("4", "2026-02-28")
    ]);

    expect(series).toEqual([
      { value: 28, startDate: "2026-01-31" },
      { value: 28, startDate: "2026-02-28" }
    ]);
  });

  it("stays in step with getCycleLengths", () => {
    const cycles = [
      cycle("1", "2026-01-01"),
      cycle("2", "2026-01-29"),
      cycle("3", "2026-02-26")
    ];

    expect(getCycleLengthSeries(cycles).map((entry) => entry.value)).toEqual(
      getCycleLengths(cycles)
    );
  });
});
