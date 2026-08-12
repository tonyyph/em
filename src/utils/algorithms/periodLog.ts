import type { Cycle, FlowIntensity } from "@/domain/entities/cycle";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";
import { sortCyclesByStartDate } from "./cyclePrediction";

/**
 * Records a single bleeding day into the cycle history.
 *
 * The naive version of this — writing one cycle per logged day with
 * `startDate === endDate` — silently destroys every prediction downstream,
 * because `getCycleLengths` measures the gap between consecutive cycle starts
 * and a run of one-day cycles reports gaps of one day. Those get filtered out
 * as implausible, so the app quietly loses its history the more diligently
 * someone logs.
 *
 * So a day either extends the cycle it belongs to or starts a new one:
 * - inside an existing cycle → nothing to add, only the flow is updated;
 * - the day after one ends → extend that cycle's `endDate`;
 * - the day before one starts → move that cycle's `startDate` back;
 * - otherwise → a genuinely new cycle begins.
 */
export const applyPeriodDay = (
  cycles: Cycle[],
  date: string,
  flow: FlowIntensity,
  now = new Date().toISOString()
): Cycle[] => {
  const sorted = sortCyclesByStartDate(cycles);
  const day = dayjs(date);

  const endOf = (cycle: Cycle) => cycle.endDate ?? cycle.startDate;

  const containing = sorted.find((cycle) =>
    day.isBetween(cycle.startDate, endOf(cycle), "day", "[]")
  );
  if (containing) {
    return sorted.map((cycle) =>
      cycle.id === containing.id ? { ...cycle, flow, updatedAt: now } : cycle
    );
  }

  const extendsEnd = sorted.find(
    (cycle) => dayjs(endOf(cycle)).add(1, "day").isSame(day, "day")
  );
  if (extendsEnd) {
    return sorted.map((cycle) =>
      cycle.id === extendsEnd.id
        ? { ...cycle, endDate: date, flow, updatedAt: now }
        : cycle
    );
  }

  const precedesStart = sorted.find((cycle) =>
    day.add(1, "day").isSame(dayjs(cycle.startDate), "day")
  );
  if (precedesStart) {
    return sorted.map((cycle) =>
      cycle.id === precedesStart.id
        ? { ...cycle, startDate: date, flow, updatedAt: now }
        : cycle
    );
  }

  return [
    ...sorted,
    {
      id: `cycle-${date}`,
      startDate: date,
      endDate: date,
      flow,
      createdAt: now,
      updatedAt: now
    }
  ];
};

/** Removes a bleeding day, splitting or trimming the cycle it belonged to. */
export const removePeriodDay = (
  cycles: Cycle[],
  date: string,
  now = new Date().toISOString()
): Cycle[] => {
  const day = dayjs(date);

  return sortCyclesByStartDate(cycles).flatMap<Cycle>((cycle) => {
    const end = cycle.endDate ?? cycle.startDate;
    if (!day.isBetween(cycle.startDate, end, "day", "[]")) {
      return [cycle];
    }

    const isStart = day.isSame(dayjs(cycle.startDate), "day");
    const isEnd = day.isSame(dayjs(end), "day");

    if (isStart && isEnd) {
      return [];
    }
    if (isStart) {
      return [
        {
          ...cycle,
          startDate: toIsoDate(day.add(1, "day")),
          updatedAt: now
        }
      ];
    }
    if (isEnd) {
      return [{ ...cycle, endDate: toIsoDate(day.subtract(1, "day")), updatedAt: now }];
    }

    // A gap in the middle splits one run of bleeding into two.
    return [
      { ...cycle, endDate: toIsoDate(day.subtract(1, "day")), updatedAt: now },
      {
        ...cycle,
        id: `${cycle.id}-b`,
        startDate: toIsoDate(day.add(1, "day")),
        endDate: end,
        createdAt: now,
        updatedAt: now
      }
    ];
  });
};

export const isPeriodDay = (cycles: Cycle[], date: string) =>
  cycles.some((cycle) =>
    dayjs(date).isBetween(cycle.startDate, cycle.endDate ?? cycle.startDate, "day", "[]")
  );

export const flowOn = (cycles: Cycle[], date: string): FlowIntensity | undefined =>
  cycles.find((cycle) =>
    dayjs(date).isBetween(cycle.startDate, cycle.endDate ?? cycle.startDate, "day", "[]")
  )?.flow;
