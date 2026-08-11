import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { getPregnancyWeekInfo } from "@/utils/algorithms/pregnancy";

export const usePregnancy = () => {
  const pregnancy = useAppStore((state) => state.pregnancy);
  const setPregnancy = useAppStore((state) => state.setPregnancy);

  const weekInfo = useMemo(() => {
    if (!pregnancy?.lastPeriodStart) {
      return undefined;
    }

    return getPregnancyWeekInfo(pregnancy.lastPeriodStart);
  }, [pregnancy]);

  return { pregnancy, weekInfo, setPregnancy };
};
