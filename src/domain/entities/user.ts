import type { CycleConfig } from "./cycle";

export type UserSettings = {
  locale: "vi" | "en";
  unitSystem: "metric" | "imperial";
  notificationsEnabled: boolean;
  biometricLockEnabled: boolean;
};

export type AppUser = {
  id: string;
  email?: string | null;
  isAnonymous: boolean;
  createdAt: string;
  settings: UserSettings;
  cycleConfig: CycleConfig;
};
