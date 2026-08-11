export type SymptomCategory = "physical" | "mental" | "behavior" | "pregnancy";

export type SymptomSeverity = "mild" | "moderate" | "severe";

export type SymptomType =
  | "cramps"
  | "headache"
  | "breast_tenderness"
  | "acne"
  | "bloating"
  | "fatigue"
  | "diarrhea"
  | "constipation"
  | "libido"
  | "stress"
  | "anxiety"
  | "happy"
  | "sad"
  | "irritable"
  | "sleep"
  | "water"
  | "exercise"
  | "sex"
  | "contraception"
  | "nausea"
  | "back_pain";

export type SymptomLog = {
  id: string;
  userId?: string;
  date: string;
  type: SymptomType;
  category: SymptomCategory;
  severity: SymptomSeverity;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type SymptomCatalogEntry = {
  type: SymptomType;
  category: SymptomCategory;
  label: string;
  icon: string;
};

/**
 * Every `SymptomType` must appear here exactly once — a type without an entry
 * is invisible in the UI, which is how `happy` and `sad` previously left the
 * Mood tab with nothing but negative options in it.
 */
export const symptomCatalog: SymptomCatalogEntry[] = [
  { type: "cramps", category: "physical", label: "Cramps", icon: "flash-outline" },
  { type: "headache", category: "physical", label: "Headache", icon: "bandage-outline" },
  {
    type: "breast_tenderness",
    category: "physical",
    label: "Breast tenderness",
    icon: "heart-outline"
  },
  { type: "acne", category: "physical", label: "Acne", icon: "ellipse-outline" },
  { type: "bloating", category: "physical", label: "Bloating", icon: "balloon-outline" },
  { type: "fatigue", category: "physical", label: "Fatigue", icon: "battery-dead-outline" },
  { type: "nausea", category: "physical", label: "Nausea", icon: "cafe-outline" },
  { type: "back_pain", category: "physical", label: "Back pain", icon: "body-outline" },
  { type: "diarrhea", category: "physical", label: "Diarrhea", icon: "swap-vertical-outline" },
  { type: "constipation", category: "physical", label: "Constipation", icon: "remove-circle-outline" },

  { type: "happy", category: "mental", label: "Happy", icon: "happy-outline" },
  { type: "sad", category: "mental", label: "Sad", icon: "sad-outline" },
  { type: "irritable", category: "mental", label: "Irritable", icon: "thunderstorm-outline" },
  { type: "anxiety", category: "mental", label: "Anxious", icon: "pulse-outline" },
  { type: "stress", category: "mental", label: "Stressed", icon: "alert-circle-outline" },

  { type: "sleep", category: "behavior", label: "Sleep", icon: "moon-outline" },
  { type: "water", category: "behavior", label: "Water", icon: "water-outline" },
  { type: "exercise", category: "behavior", label: "Exercise", icon: "walk-outline" },
  { type: "sex", category: "behavior", label: "Sex", icon: "heart-circle-outline" },
  { type: "libido", category: "behavior", label: "Libido", icon: "flame-outline" },
  {
    type: "contraception",
    category: "behavior",
    label: "Contraception",
    icon: "shield-checkmark-outline"
  }
];

export const symptomsByCategory = (category: SymptomCategory) =>
  symptomCatalog.filter((entry) => entry.category === category);

export const findSymptom = (type: SymptomType) =>
  symptomCatalog.find((entry) => entry.type === type);
