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

export const getCycleLengths = (cycles: Cycle[], sampleSize = 6) => {
  const sorted = sortCyclesByStartDate(cycles);
  const lengths: number[] = [];

  for (let index = 1; index < sorted.length; index += 1) {
    const length = dayjs(sorted[index].startDate).diff(dayjs(sorted[index - 1].startDate), "day");
    if (length >= 15 && length <= 60) {
      lengths.push(length);
    }
  }

  return lengths.slice(-sampleSize);
};

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
  const nextPeriodStart = dayjs(anchorDate).add(averageCycleLength, "day");
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
