import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import { dayjs } from "@/utils/date/dayjs";
import type { PhaseName } from "./tokens";

export const getCurrentPhase = (
  date: string,
  cycles: Cycle[],
  prediction: CyclePrediction,
  averagePeriodLength: number
): PhaseName => {
  const inLoggedPeriod = cycles.some((cycle) => {
    const end = cycle.endDate ?? dayjs(cycle.startDate).add(averagePeriodLength - 1, "day").format("YYYY-MM-DD");
    return dayjs(date).isBetween(cycle.startDate, end, "day", "[]");
  });

  if (inLoggedPeriod || dayjs(date).isBetween(prediction.nextPeriodStart, prediction.nextPeriodEnd, "day", "[]")) {
    return "menstrual";
  }

  if (date === prediction.ovulationDay) {
    return "ovulation";
  }

  if (dayjs(date).isBetween(prediction.fertileWindowStart, prediction.fertileWindowEnd, "day", "[]")) {
    return "fertile";
  }

  if (dayjs(date).isBefore(prediction.fertileWindowStart, "day")) {
    return "follicular";
  }

  return "luteal";
};

export const getConfidenceLabel = (confidence: CyclePrediction["confidence"]) => {
  if (confidence === "high") return "Strong signal";
  if (confidence === "medium") return "Moderate signal";
  return "Needs more history";
};
