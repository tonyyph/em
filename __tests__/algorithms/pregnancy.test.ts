import { calculateEddFromLastPeriod, calculatePregnancyWeek } from "@/utils/algorithms/pregnancy";

describe("pregnancy algorithms", () => {
  it("calculates EDD from last period start", () => {
    expect(calculateEddFromLastPeriod("2026-01-01")).toBe("2026-10-08");
  });

  it("calculates week and day from last period start", () => {
    expect(calculatePregnancyWeek("2026-01-01", "2026-02-01")).toEqual({ week: 5, dayOfWeek: 3 });
  });
});
