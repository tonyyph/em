/**
 * Ẽm colour palettes.
 *
 * Two themes, one identity: warm paper by day, inked paper by night. Neither
 * uses pure white or pure black — every neutral carries a little warmth so the
 * app reads as printed matter rather than as a screen.
 *
 * Every text/ground pair below meets WCAG AA (>= 4.5:1), including the phase
 * colours, which double as text labels and not just as marks.
 */

export type PhaseName =
  | "menstrual"
  | "follicular"
  | "fertile"
  | "ovulation"
  | "luteal"
  | "pregnancy"
  | "wellness";

export type ThemeColors = {
  /** Page ground. */
  background: string;
  /** Recessed areas within a card — segmented tracks, chart wells. */
  backgroundSunken: string;
  /** Default card ground. */
  surface: string;
  /** Cards that need to sit above other cards. */
  surfaceRaised: string;
  /** Quiet fills: pills, inactive segments. */
  surfaceMuted: string;
  /** Warm accent fill — pairs with brandAction and the pregnancy phase. */
  surfaceWarm: string;
  /** Cool accent fill — pairs with the fertile/wellness phases. */
  surfaceCool: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Text drawn on top of brandAction. */
  textOnAction: string;

  border: string;
  /** Hairline rules inside a card. */
  separator: string;

  brandAction: string;
  brandActionPressed: string;
  /** Tinted ground for tonal buttons and brand-adjacent chips. */
  brandActionSoft: string;

  focus: string;
  disabled: string;
  scrim: string;

  success: string;
  warning: string;
  error: string;
  destructive: string;

  /** Banner grounds, keyed to tone. */
  bannerNeutral: string;
  bannerWarning: string;
  bannerError: string;
  bannerSuccess: string;

  chartGrid: string;
  chartLabel: string;
  /** Fill under a chart line. */
  chartFill: string;

  /** The paper texture behind every screen. */
  atmosphereWash: string;
  atmosphereLines: [string, string, string];

  phases: Record<PhaseName, string>;
  /**
   * Predicted period reads as a lighter echo of a logged one — the visual
   * grammar for "estimated, not recorded".
   */
  phasePredicted: string;
  /** Soft grounds per phase, for chips and cards that carry a phase identity. */
  phaseSoft: Record<PhaseName, string>;
};

export const lightColors: ThemeColors = {
  background: "#FBF6EF",
  backgroundSunken: "#F1E7DA",
  surface: "#FFFDF9",
  surfaceRaised: "#FFFFFD",
  surfaceMuted: "#F5EDE2",
  surfaceWarm: "#F8EBDD",
  surfaceCool: "#EAF1EF",

  textPrimary: "#241B1D",
  textSecondary: "#4C4145",
  textMuted: "#6E6266",
  textOnAction: "#FFFDF9",

  border: "#E4D9CE",
  separator: "rgba(36, 27, 29, 0.09)",

  brandAction: "#7E3F46",
  brandActionPressed: "#633139",
  brandActionSoft: "#F3E2E1",

  focus: "#1F6E73",
  disabled: "rgba(36, 27, 29, 0.32)",
  scrim: "rgba(36, 27, 29, 0.42)",

  success: "#2C6E4E",
  warning: "#8A5714",
  error: "#98333A",
  destructive: "#98333A",

  bannerNeutral: "#EAF1EF",
  bannerWarning: "#F7E7C9",
  bannerError: "#F7DEDC",
  bannerSuccess: "#DFEDE5",

  chartGrid: "rgba(36, 27, 29, 0.10)",
  chartLabel: "#6E6266",
  chartFill: "rgba(126, 63, 70, 0.10)",

  atmosphereWash: "#F5E9DC",
  atmosphereLines: ["#E8D8C8", "#E1D1C2", "#EADFD5"],

  phases: {
    menstrual: "#B0454E",
    follicular: "#3D7059",
    fertile: "#1F7B7C",
    ovulation: "#96651A",
    luteal: "#6A5598",
    pregnancy: "#8A5C3B",
    wellness: "#4A6C86"
  },
  phasePredicted: "#B86F6A",
  phaseSoft: {
    menstrual: "#FAEAE9",
    follicular: "#E2EFE7",
    fertile: "#EDF6F5",
    ovulation: "#FCF4E6",
    luteal: "#E9E4F2",
    pregnancy: "#F3E6DA",
    wellness: "#E3EBF1"
  }
};

export const darkColors: ThemeColors = {
  background: "#141010",
  backgroundSunken: "#0F0C0C",
  surface: "#1E1918",
  surfaceRaised: "#272120",
  surfaceMuted: "#272120",
  surfaceWarm: "#2B211C",
  surfaceCool: "#1B2422",

  textPrimary: "#F6EEE6",
  textSecondary: "#CDBEB2",
  textMuted: "#A29387",
  textOnAction: "#241B1D",

  border: "#372E2A",
  separator: "rgba(246, 238, 230, 0.10)",

  brandAction: "#E0A0A6",
  brandActionPressed: "#C4858B",
  brandActionSoft: "#332325",

  focus: "#5FBEC3",
  disabled: "rgba(246, 238, 230, 0.30)",
  scrim: "rgba(10, 7, 7, 0.60)",

  success: "#6FBE92",
  warning: "#E0AC5B",
  error: "#E98F94",
  destructive: "#E98F94",

  bannerNeutral: "#1B2422",
  bannerWarning: "#2E2417",
  bannerError: "#301E1F",
  bannerSuccess: "#182720",

  chartGrid: "rgba(246, 238, 230, 0.12)",
  chartLabel: "#A29387",
  chartFill: "rgba(224, 160, 166, 0.14)",

  atmosphereWash: "#1C1614",
  atmosphereLines: ["#2A211D", "#302620", "#251E1A"],

  phases: {
    menstrual: "#E88A91",
    follicular: "#8FC9B2",
    fertile: "#5CBCBD",
    ovulation: "#E0AC5B",
    luteal: "#AE9BDB",
    pregnancy: "#C9946D",
    wellness: "#8FB2CC"
  },
  phasePredicted: "#A06A6E",
  phaseSoft: {
    menstrual: "#33201F",
    follicular: "#1B2A24",
    fertile: "#17282A",
    ovulation: "#2E2417",
    luteal: "#241F31",
    pregnancy: "#2B2019",
    wellness: "#1C2630"
  }
};
