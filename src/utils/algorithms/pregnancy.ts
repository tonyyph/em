import type { PregnancyWeekInfo } from "@/domain/entities/pregnancy";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";

export const calculateEddFromLastPeriod = (lastPeriodStart: string) =>
  toIsoDate(dayjs(lastPeriodStart).add(280, "day"));

export const calculatePregnancyWeek = (lastPeriodStart: string, today = toIsoDate(new Date())) => {
  const totalDays = Math.max(0, dayjs(today).diff(dayjs(lastPeriodStart), "day"));

  return {
    week: Math.floor(totalDays / 7) + 1,
    dayOfWeek: totalDays % 7
  };
};

export const getPregnancyWeekInfo = (
  lastPeriodStart: string,
  today = toIsoDate(new Date())
): PregnancyWeekInfo => {
  const { week, dayOfWeek } = calculatePregnancyWeek(lastPeriodStart, today);
  const trimester = week <= 13 ? 1 : week <= 27 ? 2 : 3;

  return {
    week,
    dayOfWeek,
    edd: calculateEddFromLastPeriod(lastPeriodStart),
    trimester,
    headline:
      week < 13
        ? "Early foundations are forming."
        : week < 28
          ? "Growth and movement become easier to notice."
          : "The final trimester focuses on growth and preparation.",
    checklist: [
      "Track symptoms and questions for the next appointment",
      "Review nutrition, hydration, and gentle movement",
      week >= 24 ? "Discuss screening and birth planning with your clinician" : "Confirm upcoming prenatal visits"
    ]
  };
};
