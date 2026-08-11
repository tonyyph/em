import { useMemo } from "react";
import { useAppStore } from "@/store/appStore";

export const useSymptoms = (date?: string) => {
  const symptoms = useAppStore((state) => state.symptoms);
  const upsertSymptom = useAppStore((state) => state.upsertSymptom);

  return {
    symptoms: useMemo(
      () => (date ? symptoms.filter((symptom) => symptom.date === date) : symptoms),
      [date, symptoms]
    ),
    upsertSymptom
  };
};
