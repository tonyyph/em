import type { Cycle } from "@/domain/entities/cycle";
import { getCycleLengths } from "@/utils/algorithms/cyclePrediction";
import { applyPeriodDay, flowOn, isPeriodDay, removePeriodDay } from "@/utils/algorithms/periodLog";

const cycle = (id: string, startDate: string, endDate?: string): Cycle => ({
  id,
  startDate,
  endDate,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z"
});

describe("applyPeriodDay", () => {
  it("starts a new cycle when the day stands alone", () => {
    const result = applyPeriodDay([], "2026-03-01", "medium");

    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2026-03-01");
    expect(result[0].endDate).toBe("2026-03-01");
    expect(result[0].flow).toBe("medium");
  });

  it("extends the cycle it directly follows instead of creating another", () => {
    const result = applyPeriodDay(
      [cycle("a", "2026-03-01", "2026-03-03")],
      "2026-03-04",
      "light"
    );

    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2026-03-01");
    expect(result[0].endDate).toBe("2026-03-04");
  });

  it("moves the start back when the day directly precedes a cycle", () => {
    const result = applyPeriodDay(
      [cycle("a", "2026-03-02", "2026-03-05")],
      "2026-03-01",
      "spotting"
    );

    expect(result).toHaveLength(1);
    expect(result[0].startDate).toBe("2026-03-01");
    expect(result[0].endDate).toBe("2026-03-05");
  });

  it("only updates flow for a day already inside a cycle", () => {
    const result = applyPeriodDay(
      [cycle("a", "2026-03-01", "2026-03-05")],
      "2026-03-03",
      "heavy"
    );

    expect(result).toHaveLength(1);
    expect(result[0].flow).toBe("heavy");
    expect(result[0].startDate).toBe("2026-03-01");
  });

  /**
   * Regression: logging consecutive days used to write one cycle per day, which
   * made `getCycleLengths` see one-day gaps, discard them all as implausible,
   * and quietly destroy the prediction the more carefully someone logged.
   */
  it("keeps cycle-length history intact across a week of daily logging", () => {
    let cycles: Cycle[] = [cycle("jan", "2026-01-01", "2026-01-05")];
    cycles = applyPeriodDay(cycles, "2026-01-29", "medium");
    for (const day of ["2026-01-30", "2026-01-31", "2026-02-01", "2026-02-02"]) {
      cycles = applyPeriodDay(cycles, day, "medium");
    }

    expect(cycles).toHaveLength(2);
    expect(getCycleLengths(cycles)).toEqual([28]);
  });
});

describe("removePeriodDay", () => {
  it("drops a single-day cycle entirely", () => {
    expect(removePeriodDay([cycle("a", "2026-03-01", "2026-03-01")], "2026-03-01")).toEqual([]);
  });

  it("trims the leading day", () => {
    const result = removePeriodDay([cycle("a", "2026-03-01", "2026-03-04")], "2026-03-01");
    expect(result[0].startDate).toBe("2026-03-02");
  });

  it("trims the trailing day", () => {
    const result = removePeriodDay([cycle("a", "2026-03-01", "2026-03-04")], "2026-03-04");
    expect(result[0].endDate).toBe("2026-03-03");
  });

  it("splits a cycle when a middle day is removed", () => {
    const result = removePeriodDay([cycle("a", "2026-03-01", "2026-03-05")], "2026-03-03");

    expect(result).toHaveLength(2);
    expect(result[0].endDate).toBe("2026-03-02");
    expect(result[1].startDate).toBe("2026-03-04");
    expect(result[1].endDate).toBe("2026-03-05");
  });
});

describe("day lookups", () => {
  const cycles = [cycle("a", "2026-03-01", "2026-03-04")];

  it("recognises days inside a cycle", () => {
    expect(isPeriodDay(cycles, "2026-03-02")).toBe(true);
    expect(isPeriodDay(cycles, "2026-03-09")).toBe(false);
  });

  it("reads back the recorded flow", () => {
    const withFlow = applyPeriodDay(cycles, "2026-03-02", "heavy");
    expect(flowOn(withFlow, "2026-03-02")).toBe("heavy");
  });
});
