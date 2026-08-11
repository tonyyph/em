import type { CyclePrediction } from "@/domain/entities/cycle";
import { dayjs } from "@/utils/date/dayjs";

export type PredictedDate = {
  /** What to show as the headline value. */
  value: string;
  /** The uncertainty attached to it, or undefined when there is none worth saying. */
  qualifier?: string;
};

/**
 * The next period as a date or as a span.
 *
 * `predictCycle` only produces `nextPeriodRange` once recent cycles vary by
 * five days or more. When it does, showing a single confident date would be a
 * lie the underlying maths does not support, so the range wins.
 */
export const describeNextPeriod = (prediction: CyclePrediction): PredictedDate => {
  const range = prediction.nextPeriodRange;

  if (!range) {
    return {
      value: dayjs(prediction.nextPeriodStart).format("MMM D"),
      qualifier: `~${prediction.averagePeriodLength} day period`
    };
  }

  const earliest = dayjs(range.earliest);
  const latest = dayjs(range.latest);
  const sameMonth = earliest.month() === latest.month();

  return {
    value: sameMonth
      ? `${earliest.format("MMM D")}–${latest.format("D")}`
      : `${earliest.format("MMM D")} – ${latest.format("MMM D")}`,
    qualifier: `±${prediction.irregularityDays} days`
  };
};

/** Days from today until a predicted date, floored at zero. */
export const daysUntil = (isoDate: string, from = new Date()) =>
  Math.max(0, dayjs(isoDate).startOf("day").diff(dayjs(from).startOf("day"), "day"));

export const describeCountdown = (isoDate: string) => {
  const days = daysUntil(isoDate);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  return `in ${days} days`;
};
