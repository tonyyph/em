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

export const symptomCatalog: {
  type: SymptomType;
  category: SymptomCategory;
  label: string;
}[] = [
  { type: "cramps", category: "physical", label: "Cramps" },
  { type: "headache", category: "physical", label: "Headache" },
  { type: "breast_tenderness", category: "physical", label: "Breast tenderness" },
  { type: "acne", category: "physical", label: "Acne" },
  { type: "bloating", category: "physical", label: "Bloating" },
  { type: "fatigue", category: "physical", label: "Fatigue" },
  { type: "stress", category: "mental", label: "Stress" },
  { type: "anxiety", category: "mental", label: "Anxiety" },
  { type: "irritable", category: "mental", label: "Irritable" },
  { type: "sleep", category: "behavior", label: "Sleep" },
  { type: "water", category: "behavior", label: "Water" },
  { type: "exercise", category: "behavior", label: "Exercise" },
  { type: "sex", category: "behavior", label: "Sex" },
  { type: "nausea", category: "pregnancy", label: "Nausea" },
  { type: "back_pain", category: "pregnancy", label: "Back pain" }
];
