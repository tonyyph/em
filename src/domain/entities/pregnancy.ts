export type Pregnancy = {
  id: string;
  userId?: string;
  edd: string;
  lastPeriodStart?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type PregnancyWeekInfo = {
  week: number;
  dayOfWeek: number;
  edd: string;
  trimester: 1 | 2 | 3;
  headline: string;
  checklist: string[];
};
