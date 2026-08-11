import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";
import { useCyclePredictions } from "./useCyclePredictions";

export const useOvulation = () => {
  const ovulationLogs = useAppStore((state) => state.ovulationLogs);
  const upsertOvulationLog = useAppStore((state) => state.upsertOvulationLog);
  const { prediction } = useCyclePredictions();

  return {
    prediction,
    ovulationLogs: useMemo(() => ovulationLogs, [ovulationLogs]),
    upsertOvulationLog
  };
};
