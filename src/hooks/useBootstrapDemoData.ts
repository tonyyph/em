import { useEffect } from "react";
import { useAppStore } from "@/store/appStore";
import { toIsoDate, dayjs } from "@/utils/date/dayjs";

export const useBootstrapDemoData = () => {
  const cycles = useAppStore((state) => state.cycles);
  const setCycles = useAppStore((state) => state.setCycles);

  useEffect(() => {
    if (cycles.length > 0) {
      return;
    }

    const now = dayjs();
    setCycles(
      [112, 84, 55, 27].map((daysAgo, index) => ({
        id: `demo-cycle-${index}`,
        startDate: toIsoDate(now.subtract(daysAgo, "day")),
        endDate: toIsoDate(now.subtract(daysAgo - 4, "day")),
        flow: index % 2 === 0 ? "medium" : "light",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    );
  }, [cycles.length, setCycles]);
};
