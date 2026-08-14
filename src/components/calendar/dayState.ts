import type { Theme } from "@/design/theme";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import type { SymptomLog } from "@/domain/entities/symptom";
import { dayjs } from "@/utils/date/dayjs";

export type DayState = {
  loggedPeriod: boolean;
  predictedPeriod: boolean;
  /** Inside the widened range shown when cycles are irregular. */
  predictedRange: boolean;
  fertile: boolean;
  ovulation: boolean;
  symptom: boolean;
};

export const getDayState = (
  date: string,
  cycles: Cycle[],
  symptoms: SymptomLog[],
  prediction: CyclePrediction
): DayState => {
  const day = dayjs(date);

  const loggedPeriod = cycles.some((cycle) => {
    // Fall back to the predicted period length rather than a fixed 5 days, so
    // a cycle logged without an end date is not silently mis-drawn.
    const end =
      cycle.endDate ??
      dayjs(cycle.startDate)
        .add(Math.max(prediction.averagePeriodLength - 1, 0), "day")
        .format("YYYY-MM-DD");
    return day.isBetween(cycle.startDate, end, "day", "[]");
  });

  const range = prediction.nextPeriodRange;

  return {
    loggedPeriod,
    predictedPeriod: day.isBetween(
      prediction.nextPeriodStart,
      prediction.nextPeriodEnd,
      "day",
      "[]"
    ),
    predictedRange: range ? day.isBetween(range.earliest, range.latest, "day", "[]") : false,
    fertile: day.isBetween(
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd,
      "day",
      "[]"
    ),
    ovulation: date === prediction.ovulationDay,
    symptom: symptoms.some((symptom) => symptom.date === date)
  };
};

export type DayTone = {
  ground: string;
  text: string | null;
  dashed: boolean;
};

/**
 * Marker grammar, in priority order. Recorded facts always outrank estimates:
 * a logged period is a solid fill, everything predicted is softer, and the
 * irregularity range is only a tint — it is the weakest claim the app makes.
 *
 * The order is the honesty guarantee, not a styling preference: if a predicted
 * marker ever outranked a logged one, the calendar would be showing a guess on
 * top of a fact.
 */
export const describeDay = (state: DayState, theme: Theme): DayTone => {
  const { colors } = theme;
  if (state.loggedPeriod) {
    return { ground: colors.phases.menstrual, text: colors.textOnAction, dashed: false };
  }
  if (state.ovulation) {
    return { ground: colors.phaseSoft.ovulation, text: colors.phases.ovulation, dashed: false };
  }
  if (state.predictedPeriod) {
    // Android ignores `borderStyle: dashed` once a border radius is set, so the
    // dash is treated as an iOS enhancement and the lighter `phasePredicted`
    // ring carries the "estimated, not recorded" meaning on both platforms.
    return { ground: "transparent", text: colors.phases.menstrual, dashed: true };
  }
  if (state.fertile) {
    return { ground: colors.phaseSoft.fertile, text: colors.phases.fertile, dashed: false };
  }
  if (state.predictedRange) {
    return { ground: colors.phaseSoft.menstrual, text: colors.textSecondary, dashed: false };
  }
  return { ground: "transparent", text: null, dashed: false };
};

export const accessibilityFor = (date: string, state: DayState) => {
  const notes: string[] = [];
  if (state.loggedPeriod) notes.push("period logged");
  if (state.predictedPeriod) notes.push("predicted period");
  else if (state.predictedRange) notes.push("possible period, cycle is irregular");
  if (state.ovulation) notes.push("estimated ovulation");
  else if (state.fertile) notes.push("fertile window");
  if (state.symptom) notes.push("symptom logged");
  return `${dayjs(date).format("dddd, MMMM D")}${notes.length ? `. ${notes.join(", ")}` : ""}`;
};
