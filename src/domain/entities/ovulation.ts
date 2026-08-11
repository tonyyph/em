export type LhTestResult = "negative" | "weak_positive" | "positive";

export type CervicalMucus = "dry" | "sticky" | "creamy" | "watery" | "egg_white";

export type OvulationLog = {
  id: string;
  userId?: string;
  date: string;
  bbtCelsius?: number;
  lhTest?: LhTestResult;
  mucus?: CervicalMucus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};
