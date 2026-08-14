import { accessibilityFor, describeDay, getDayState, type DayState } from "@/components/calendar/dayState";
import { lightColors } from "@/design/palettes";
import type { Theme } from "@/design/theme";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import type { SymptomLog } from "@/domain/entities/symptom";

const theme = {
  scheme: "light",
  isDark: false,
  colors: lightColors,
  elevation: { none: {}, raised: {}, lifted: {}, sheet: {} },
  reduceMotion: false
} as Theme;

const prediction: CyclePrediction = {
  nextPeriodStart: "2026-09-01",
  nextPeriodEnd: "2026-09-05",
  ovulationDay: "2026-08-18",
  fertileWindowStart: "2026-08-13",
  fertileWindowEnd: "2026-08-19",
  averageCycleLength: 28,
  averagePeriodLength: 5,
  confidence: "medium",
  irregularityDays: 3,
  nextPeriodRange: { earliest: "2026-08-29", latest: "2026-09-03" }
};

const cycle = (startDate: string, endDate?: string): Cycle => ({
  id: startDate,
  startDate,
  endDate,
  createdAt: startDate,
  updatedAt: startDate
});

const symptom = (date: string): SymptomLog => ({
  id: date,
  date,
  type: "cramps",
  category: "physical",
  severity: "moderate",
  createdAt: date,
  updatedAt: date
});

const blank: DayState = {
  loggedPeriod: false,
  predictedPeriod: false,
  predictedRange: false,
  fertile: false,
  ovulation: false,
  symptom: false
};

describe("getDayState", () => {
  it("marks a day inside a logged period", () => {
    const state = getDayState("2026-08-03", [cycle("2026-08-01", "2026-08-05")], [], prediction);
    expect(state.loggedPeriod).toBe(true);
  });

  /**
   * A cycle logged without an end date is the common case — someone records the
   * first day and never comes back. Falling back to a fixed five days would
   * mis-draw anyone whose periods run longer or shorter than average.
   */
  it("closes an open-ended cycle with the predicted period length", () => {
    const cycles = [cycle("2026-08-01")];
    expect(getDayState("2026-08-05", cycles, [], prediction).loggedPeriod).toBe(true);
    expect(getDayState("2026-08-06", cycles, [], prediction).loggedPeriod).toBe(false);
  });

  it("treats period bounds as inclusive at both ends", () => {
    const cycles = [cycle("2026-08-01", "2026-08-05")];
    expect(getDayState("2026-08-01", cycles, [], prediction).loggedPeriod).toBe(true);
    expect(getDayState("2026-08-05", cycles, [], prediction).loggedPeriod).toBe(true);
    expect(getDayState("2026-07-31", cycles, [], prediction).loggedPeriod).toBe(false);
  });

  it("finds the fertile window, ovulation day and logged symptoms", () => {
    const state = getDayState("2026-08-18", [], [symptom("2026-08-18")], prediction);
    expect(state.ovulation).toBe(true);
    expect(state.fertile).toBe(true);
    expect(state.symptom).toBe(true);
  });

  it("reports no widened range when the prediction has none", () => {
    const { nextPeriodRange, ...certain } = prediction;
    expect(nextPeriodRange).toBeDefined();
    expect(getDayState("2026-08-30", [], [], certain).predictedRange).toBe(false);
  });
});

/**
 * The priority order in `describeDay` is the app's honesty guarantee, not a
 * styling preference: if an estimate ever outranked a record, the calendar
 * would be drawing a guess on top of a fact.
 */
describe("describeDay priority", () => {
  it("draws a logged period over every estimate that overlaps it", () => {
    const tone = describeDay(
      { ...blank, loggedPeriod: true, predictedPeriod: true, fertile: true, ovulation: true },
      theme
    );
    expect(tone.ground).toBe(lightColors.phases.menstrual);
    expect(tone.dashed).toBe(false);
  });

  it("draws ovulation over the fertile window it sits inside", () => {
    const tone = describeDay({ ...blank, ovulation: true, fertile: true }, theme);
    expect(tone.ground).toBe(lightColors.phaseSoft.ovulation);
  });

  it("draws a predicted period as a dashed ring, never a fill", () => {
    const tone = describeDay({ ...blank, predictedPeriod: true, predictedRange: true }, theme);
    expect(tone.ground).toBe("transparent");
    expect(tone.dashed).toBe(true);
  });

  it("leaves the widened range as the weakest mark", () => {
    const tone = describeDay({ ...blank, predictedRange: true }, theme);
    expect(tone.ground).toBe(lightColors.phaseSoft.menstrual);
    expect(tone.dashed).toBe(false);
  });

  it("leaves an ordinary day unmarked", () => {
    const tone = describeDay(blank, theme);
    expect(tone.ground).toBe("transparent");
    expect(tone.text).toBeNull();
  });
});

describe("accessibilityFor", () => {
  it("names the date alone when nothing is marked", () => {
    expect(accessibilityFor("2026-08-14", blank)).toBe("Friday, August 14");
  });

  it("prefers the firmer claim when a range and a prediction overlap", () => {
    const label = accessibilityFor("2026-09-01", {
      ...blank,
      predictedPeriod: true,
      predictedRange: true
    });
    expect(label).toContain("predicted period");
    expect(label).not.toContain("possible period");
  });

  it("announces every mark a day carries", () => {
    const label = accessibilityFor("2026-08-18", {
      ...blank,
      loggedPeriod: true,
      ovulation: true,
      symptom: true
    });
    expect(label).toContain("period logged");
    expect(label).toContain("estimated ovulation");
    expect(label).toContain("symptom logged");
  });
});
