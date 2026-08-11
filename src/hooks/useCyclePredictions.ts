import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { getCycleDay, predictCycle } from "@/utils/algorithms/cyclePrediction";

export const useCyclePredictions = () => {
  const cycles = useAppStore((state) => state.cycles);
  const cycleConfig = useAppStore((state) => state.cycleConfig);
  const selectedDate = useAppStore((state) => state.selectedDate);

  const prediction = useMemo(() => predictCycle(cycles, cycleConfig), [cycles, cycleConfig]);
  const selectedCycleDay = useMemo(() => getCycleDay(selectedDate, cycles), [cycles, selectedDate]);

  return {
    prediction,
    selectedCycleDay
  };
};
