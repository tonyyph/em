import { reconcileSymptomLogs } from "@/utils/algorithms/symptomLog";
import type { SymptomLog } from "@/domain/entities/symptom";

const log = (type: SymptomLog["type"], overrides: Partial<SymptomLog> = {}): SymptomLog => ({
  id: `symptom-2026-08-19-${type}`,
  date: "2026-08-19",
  type,
  category: "physical",
  severity: "mild",
  createdAt: "2026-08-01T00:00:00.000Z",
  updatedAt: "2026-08-01T00:00:00.000Z",
  ...overrides
});

const NOW = "2026-08-19T09:00:00.000Z";

describe("reconcileSymptomLogs", () => {
  it("files each signal under the category the catalog gives it", () => {
    // The screen only ever has the currently visible tab's entries to hand, so
    // a mood signal selected before switching to Body used to be saved as
    // physical — the category is a catalog fact, not a function of the tab.
    const { saved } = reconcileSymptomLogs(
      [],
      { date: "2026-08-19", selected: ["irritable", "cramps", "exercise"], severity: "moderate" },
      NOW
    );

    expect(saved.map((entry) => [entry.type, entry.category])).toEqual([
      ["irritable", "mental"],
      ["cramps", "physical"],
      ["exercise", "behavior"]
    ]);
  });

  it("removes what was deselected and keeps what was not", () => {
    const existing = [log("cramps"), log("sad", { category: "mental" })];

    const { removedIds, saved } = reconcileSymptomLogs(
      existing,
      { date: "2026-08-19", selected: ["cramps"], severity: "severe" },
      NOW
    );

    expect(removedIds).toEqual([existing[1].id]);
    expect(saved).toHaveLength(1);
    expect(saved[0].severity).toBe("severe");
  });

  it("keeps the original id and creation time when updating an entry", () => {
    const existing = [log("cramps", { id: "legacy-id" })];

    const { saved } = reconcileSymptomLogs(
      existing,
      { date: "2026-08-19", selected: ["cramps"], severity: "mild" },
      NOW
    );

    expect(saved[0].id).toBe("legacy-id");
    expect(saved[0].createdAt).toBe("2026-08-01T00:00:00.000Z");
    expect(saved[0].updatedAt).toBe(NOW);
  });

  it("stores an empty note as no note rather than as an empty string", () => {
    const { saved } = reconcileSymptomLogs(
      [],
      { date: "2026-08-19", selected: ["cramps"], severity: "mild", notes: "  " },
      NOW
    );

    expect(saved[0].notes).toBeUndefined();
  });
});
