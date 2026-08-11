export type HealthGoal = "tracking" | "ttc" | "pregnancy" | "contraception" | "menopause";

export type FlowIntensity = "spotting" | "light" | "medium" | "heavy";

export type Cycle = {
  id: string;
  userId?: string;
  startDate: string;
  endDate?: string;
  flow?: FlowIntensity;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CycleConfig = {
  averageCycleLength: number;
  averagePeriodLength: number;
  goal: HealthGoal;
};

export type CyclePrediction = {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  ovulationDay: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  averageCycleLength: number;
  averagePeriodLength: number;
  confidence: "high" | "medium" | "low";
  irregularityDays: number;
  nextPeriodRange?: {
    earliest: string;
    latest: string;
  };
};
