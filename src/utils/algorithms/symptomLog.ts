import {
  findSymptom,
  type SymptomLog,
  type SymptomSeverity,
  type SymptomType
} from "@/domain/entities/symptom";

/** The state of the daily-log form at the moment it is saved. */
export type SymptomDraft = {
  date: string;
  selected: SymptomType[];
  severity: SymptomSeverity;
  notes?: string;
};

export type SymptomReconciliation = {
  /** Logs that were recorded for this day but are no longer selected. */
  removedIds: string[];
  /** Logs to write, whether new or updated. */
  saved: SymptomLog[];
};

/**
 * Turns the daily-log form into the writes it implies.
 *
 * Reconciling rather than appending is what lets the form be edited: anything
 * unticked since the screen opened has to be removed, or a log can only ever
 * grow.
 *
 * Extracted from the screen because the category is the part that goes wrong
 * when this lives inline. The screen only renders one category tab at a time,
 * so the obvious lookup — search the visible entries — silently fails for every
 * signal picked on a different tab, and those got filed as `physical`. The
 * category belongs to the signal, not to whichever tab happened to be open, so
 * it is read from the full catalog here.
 */
export const reconcileSymptomLogs = (
  existing: SymptomLog[],
  draft: SymptomDraft,
  now = new Date().toISOString()
): SymptomReconciliation => {
  const selected = new Set(draft.selected);
  const notes = draft.notes?.trim() || undefined;

  return {
    removedIds: existing
      .filter((symptom) => !selected.has(symptom.type))
      .map((symptom) => symptom.id),
    saved: draft.selected.map((type) => {
      const previous = existing.find((symptom) => symptom.type === type);
      return {
        id: previous?.id ?? `symptom-${draft.date}-${type}`,
        date: draft.date,
        type,
        category: findSymptom(type)?.category ?? previous?.category ?? "physical",
        severity: draft.severity,
        notes,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now
      };
    })
  };
};
