import { create } from "zustand";
import type { AppUser } from "@/domain/entities/user";
import type { Cycle, CycleConfig, FlowIntensity } from "@/domain/entities/cycle";
import { applyPeriodDay, removePeriodDay } from "@/utils/algorithms/periodLog";
import type { OvulationLog } from "@/domain/entities/ovulation";
import type { Pregnancy } from "@/domain/entities/pregnancy";
import type { SymptomLog } from "@/domain/entities/symptom";
import { toIsoDate } from "@/utils/date/dayjs";

type AppState = {
  user?: AppUser;
  cycles: Cycle[];
  symptoms: SymptomLog[];
  ovulationLogs: OvulationLog[];
  pregnancy?: Pregnancy;
  cycleConfig: CycleConfig;
  selectedDate: string;
  setUser: (user?: AppUser) => void;
  setCycles: (cycles: Cycle[]) => void;
  upsertCycle: (cycle: Cycle) => void;
  removeCycle: (id: string) => void;
  setSymptoms: (symptoms: SymptomLog[]) => void;
  upsertSymptom: (symptom: SymptomLog) => void;
  removeSymptom: (id: string) => void;
  /** Records or clears a bleeding day without fabricating one-day cycles. */
  setPeriodDay: (date: string, flow: FlowIntensity | undefined) => void;
  setOvulationLogs: (logs: OvulationLog[]) => void;
  upsertOvulationLog: (log: OvulationLog) => void;
  setPregnancy: (pregnancy?: Pregnancy) => void;
  updateCycleConfig: (config: Partial<CycleConfig>) => void;
  setSelectedDate: (date: string) => void;
};

export const useAppStore = create<AppState>((set) => ({
  cycles: [],
  symptoms: [],
  ovulationLogs: [],
  cycleConfig: {
    averageCycleLength: 28,
    averagePeriodLength: 5,
    goal: "tracking"
  },
  selectedDate: toIsoDate(new Date()),
  setUser: (user) => set({ user }),
  setCycles: (cycles) => set({ cycles }),
  upsertCycle: (cycle) =>
    set((state) => ({
      cycles: state.cycles.some((item) => item.id === cycle.id)
        ? state.cycles.map((item) => (item.id === cycle.id ? cycle : item))
        : [...state.cycles, cycle]
    })),
  removeCycle: (id) => set((state) => ({ cycles: state.cycles.filter((cycle) => cycle.id !== id) })),
  setSymptoms: (symptoms) => set({ symptoms }),
  upsertSymptom: (symptom) =>
    set((state) => ({
      symptoms: state.symptoms.some((item) => item.id === symptom.id)
        ? state.symptoms.map((item) => (item.id === symptom.id ? symptom : item))
        : [...state.symptoms, symptom]
    })),
  removeSymptom: (id) =>
    set((state) => ({ symptoms: state.symptoms.filter((symptom) => symptom.id !== id) })),
  setPeriodDay: (date, flow) =>
    set((state) => ({
      cycles: flow
        ? applyPeriodDay(state.cycles, date, flow)
        : removePeriodDay(state.cycles, date)
    })),
  setOvulationLogs: (ovulationLogs) => set({ ovulationLogs }),
  upsertOvulationLog: (log) =>
    set((state) => ({
      ovulationLogs: state.ovulationLogs.some((item) => item.id === log.id)
        ? state.ovulationLogs.map((item) => (item.id === log.id ? log : item))
        : [...state.ovulationLogs, log]
    })),
  setPregnancy: (pregnancy) => set({ pregnancy }),
  updateCycleConfig: (config) => set((state) => ({ cycleConfig: { ...state.cycleConfig, ...config } })),
  setSelectedDate: (selectedDate) => set({ selectedDate })
}));
