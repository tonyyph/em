import { darkColors, lightColors, type ThemeColors } from "@/design/palettes";
import { phaseMeta, phaseOrder, typography } from "@/design/tokens";
import { symptomCatalog } from "@/domain/entities/symptom";
import type { SymptomType } from "@/domain/entities/symptom";

const toRgb = (hex: string) => {
  const clean = hex.replace("#", "");
  return [0, 2, 4].map((index) => parseInt(clean.slice(index, index + 2), 16));
};

const relativeLuminance = (hex: string) => {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const scaled = channel / 255;
    return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string) => {
  const [lighter, darker] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

const AA = 4.5;

const GROUNDS: (keyof ThemeColors)[] = [
  "background",
  "backgroundSunken",
  "surface",
  "surfaceRaised",
  "surfaceMuted",
  "surfaceWarm",
  "surfaceCool"
];

const FOREGROUNDS: (keyof ThemeColors)[] = [
  "textPrimary",
  "textSecondary",
  "textMuted",
  "brandAction",
  "success",
  "warning",
  "error"
];

describe.each([
  ["light", lightColors],
  ["dark", darkColors]
])("%s palette contrast", (_name, palette) => {
  it.each(FOREGROUNDS)("%s meets AA on every ground", (foreground) => {
    for (const ground of GROUNDS) {
      const ratio = contrast(palette[foreground] as string, palette[ground] as string);
      expect(ratio).toBeGreaterThanOrEqual(AA);
    }
  });

  it("keeps every phase colour readable as text on background, surface and its own soft ground", () => {
    for (const phase of Object.keys(palette.phases) as (keyof ThemeColors["phases"])[]) {
      const colour = palette.phases[phase];
      expect(contrast(colour, palette.background)).toBeGreaterThanOrEqual(AA);
      expect(contrast(colour, palette.surface)).toBeGreaterThanOrEqual(AA);
      expect(contrast(colour, palette.phaseSoft[phase])).toBeGreaterThanOrEqual(AA);
    }
  });

  it("keeps label text readable on the brand action fill", () => {
    expect(contrast(palette.textOnAction, palette.brandAction)).toBeGreaterThanOrEqual(AA);
  });

  /**
   * The predicted-period ring is the sole marker distinguishing an estimated
   * day from an ordinary one, so it is a meaningful graphic under WCAG 1.4.11
   * and owes 3:1 — not the 1.7:1 a decorative tint would get away with.
   */
  it("draws the predicted-period ring at non-text contrast", () => {
    expect(contrast(palette.phasePredicted, palette.background)).toBeGreaterThanOrEqual(3);
    expect(contrast(palette.phasePredicted, palette.surface)).toBeGreaterThanOrEqual(3);
  });

  it("keeps the focus ring visible against every ground", () => {
    for (const ground of GROUNDS) {
      expect(contrast(palette.focus, palette[ground] as string)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("symptom catalog", () => {
  /**
   * Regression: six of the twenty-one symptom types had no catalog entry, so
   * they were unreachable in the UI — which left the Mood tab offering only
   * negative moods, with no way to log feeling good.
   */
  it("exposes every SymptomType exactly once", () => {
    const all: SymptomType[] = [
      "cramps",
      "headache",
      "breast_tenderness",
      "acne",
      "bloating",
      "fatigue",
      "diarrhea",
      "constipation",
      "libido",
      "stress",
      "anxiety",
      "happy",
      "sad",
      "irritable",
      "sleep",
      "water",
      "exercise",
      "sex",
      "contraception",
      "nausea",
      "back_pain"
    ];

    const catalogued = symptomCatalog.map((entry) => entry.type);
    expect([...catalogued].sort()).toEqual([...all].sort());
    expect(new Set(catalogued).size).toBe(catalogued.length);
  });

  it("offers at least one positive mood", () => {
    const moods = symptomCatalog.filter((entry) => entry.category === "mental");
    expect(moods.map((entry) => entry.type)).toContain("happy");
  });
});

describe("typography", () => {
  it("expresses weight through fontFamily, never fontWeight", () => {
    for (const [name, style] of Object.entries(typography)) {
      expect(style).toHaveProperty("fontFamily");
      expect(style).not.toHaveProperty("fontWeight");
      expect(name).toBeTruthy();
    }
  });

  it("gives every variant room for stacked Vietnamese diacritics", () => {
    for (const style of Object.values(typography)) {
      const ratio = style.lineHeight! / style.fontSize!;
      expect(ratio).toBeGreaterThanOrEqual(1.1);
    }
  });
});

describe("phase metadata", () => {
  it("describes every phase used by the timeline", () => {
    for (const phase of phaseOrder) {
      expect(phaseMeta[phase]).toBeDefined();
      expect(phaseMeta[phase].shortLabel.length).toBeGreaterThan(0);
    }
  });
});
