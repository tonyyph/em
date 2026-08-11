import { predictCycle } from "@/utils/algorithms/cyclePrediction";
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
    ]);

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
    ]);

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
