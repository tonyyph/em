import type { Cycle, CycleConfig, CyclePrediction } from "@/domain/entities/cycle";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";

const DEFAULT_CONFIG: CycleConfig = {
  averageCycleLength: 28,
  averagePeriodLength: 5,
  goal: "tracking"
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const weightedAverage = (values: number[]) => {
  const totalWeight = values.reduce((sum, _value, index) => sum + (index + 1), 0);
  const weightedSum = values.reduce((sum, value, index) => sum + value * (index + 1), 0);
  return weightedSum / totalWeight;
};

const standardDeviation = (values: number[]) => {
  if (values.length < 2) {
    return 0;
  }

  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
};

export const sortCyclesByStartDate = (cycles: Cycle[]) =>
  [...cycles].sort((a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf());

/** One measured cycle: its length, and the period start that closed it. */
export type CycleLength = {
  value: number;
  /** Start date of the later of the two cycles the gap was measured between. */
  startDate: string;
};

/**
 * Cycle lengths with the start each one was measured to.
 *
 * Callers that plot these need to label them, and the index of a length cannot
 * be used to index back into the cycles: implausible gaps are dropped and the
 * result is trimmed to the most recent `sampleSize`, so position `i` here is
 * not position `i + 1` there. Carrying the date alongside the number is the
 * only way a chart can stay honest about which cycle a point belongs to.
 */
export const getCycleLengthSeries = (cycles: Cycle[], sampleSize = 6): CycleLength[] => {
  const sorted = sortCyclesByStartDate(cycles);
  const lengths: CycleLength[] = [];

  for (let index = 1; index < sorted.length; index += 1) {
    const length = dayjs(sorted[index].startDate).diff(dayjs(sorted[index - 1].startDate), "day");
    if (length >= 15 && length <= 60) {
      lengths.push({ value: length, startDate: sorted[index].startDate });
    }
  }

  return lengths.slice(-sampleSize);
};

export const getCycleLengths = (cycles: Cycle[], sampleSize = 6) =>
  getCycleLengthSeries(cycles, sampleSize).map((entry) => entry.value);

export const getPeriodLengths = (cycles: Cycle[], fallback: number) => {
  const lengths = cycles
    .filter((cycle) => cycle.endDate)
    .map((cycle) => dayjs(cycle.endDate).diff(dayjs(cycle.startDate), "day") + 1)
    .filter((length) => length >= 1 && length <= 12)
    .slice(-6);

  return lengths.length > 0 ? Math.round(clamp(weightedAverage(lengths), 2, 10)) : fallback;
};

export const predictCycle = (
  cycles: Cycle[],
  config: Partial<CycleConfig> = {},
  today = toIsoDate(new Date())
): CyclePrediction => {
  const resolvedConfig = { ...DEFAULT_CONFIG, ...config };
  const sorted = sortCyclesByStartDate(cycles);
  const latestCycle = sorted.at(-1);
  const cycleLengths = getCycleLengths(sorted);
  const irregularityDays = Math.round(standardDeviation(cycleLengths));
  const averageCycleLength =
    cycleLengths.length > 0
      ? Math.round(clamp(weightedAverage(cycleLengths), 21, 45))
      : resolvedConfig.averageCycleLength;
  const averagePeriodLength = getPeriodLengths(sorted, resolvedConfig.averagePeriodLength);
  const anchorDate = latestCycle?.startDate ?? today;

  /**
   * The next period, rolled forward past any cycles that were never logged.
   *
   * One cycle length past the last recorded start is only "next" for someone
   * who logged their last period. Stop logging for a few months and that date
   * falls into the past, and because nothing downstream re-checks it, the app
   * goes on presenting it as upcoming: the countdown floors at zero and reads
   * "today", the calendar tints a week in March, and every phase is derived
   * from a window that closed months ago.
   *
   * Advancing in whole cycle lengths keeps the estimate honest arithmetic on
   * the user's own history — it is the same prediction, projected forward
   * rather than frozen. A window still under way is kept rather than skipped,
   * so someone bleeding today is not told their period is due in a month.
   */
  const rollForward = (start: dayjs.Dayjs): dayjs.Dayjs => {
    const periodEnd = start.add(averagePeriodLength - 1, "day");
    return periodEnd.isBefore(dayjs(today), "day")
      ? rollForward(start.add(averageCycleLength, "day"))
      : start;
  };

  const nextPeriodStart = rollForward(dayjs(anchorDate).add(averageCycleLength, "day"));
  const nextPeriodEnd = nextPeriodStart.add(averagePeriodLength - 1, "day");
  const ovulationDay = nextPeriodStart.subtract(14, "day");
  const fertileWindowStart = ovulationDay.subtract(5, "day");
  const fertileWindowEnd = ovulationDay.add(1, "day");
  const confidence: CyclePrediction["confidence"] =
    cycleLengths.length >= 4 && irregularityDays <= 4 ? "high" : cycleLengths.length >= 2 ? "medium" : "low";

  return {
    nextPeriodStart: toIsoDate(nextPeriodStart),
    nextPeriodEnd: toIsoDate(nextPeriodEnd),
    ovulationDay: toIsoDate(ovulationDay),
    fertileWindowStart: toIsoDate(fertileWindowStart),
    fertileWindowEnd: toIsoDate(fertileWindowEnd),
    averageCycleLength,
    averagePeriodLength,
    confidence,
    irregularityDays,
    nextPeriodRange:
      irregularityDays >= 5
        ? {
            earliest: toIsoDate(nextPeriodStart.subtract(irregularityDays, "day")),
            latest: toIsoDate(nextPeriodStart.add(irregularityDays, "day"))
          }
        : undefined
  };
};

export const getCycleDay = (date: string, cycles: Cycle[]) => {
  const sorted = sortCyclesByStartDate(cycles);
  const current = [...sorted].reverse().find((cycle) => !dayjs(cycle.startDate).isAfter(dayjs(date), "day"));

  return current ? dayjs(date).diff(dayjs(current.startDate), "day") + 1 : undefined;
};
