import type { TextStyle } from "react-native";
import type { PhaseName, ThemeColors } from "./palettes";

export type { PhaseName, ThemeColors };
export { lightColors, darkColors } from "./palettes";

/**
 * Two families carry the whole system.
 *
 * Fraunces is the editorial voice — it appears only at the top of a screen and
 * on hero numbers, where a screen earns some character. Be Vietnam Pro does the
 * working UI: it was drawn by a Vietnamese foundry, so stacked diacritics
 * (ế, ộ, ữ) are designed rather than retrofitted, and it stays legible at the
 * small sizes the data-dense screens need.
 *
 * With custom families loaded, always express weight through `fontFamily` and
 * never through `fontWeight` — React Native would otherwise ask the platform to
 * synthesise a weight and the two engines disagree about the result.
 */
export const fonts = {
  serif: {
    regular: "Fraunces_400Regular",
    medium: "Fraunces_500Medium",
    semibold: "Fraunces_600SemiBold",
    bold: "Fraunces_700Bold"
  },
  sans: {
    regular: "BeVietnamPro_400Regular",
    medium: "BeVietnamPro_500Medium",
    semibold: "BeVietnamPro_600SemiBold",
    bold: "BeVietnamPro_700Bold"
  }
} as const;

/**
 * Line heights are set generously — Vietnamese stacks marks above and below the
 * x-height, and tight leading collides them with the line above.
 */
export const typography = {
  /** Onboarding and other full-bleed statements. */
  display: {
    fontFamily: fonts.serif.semibold,
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: -0.4
  },
  /** The one number a screen is really about. */
  heroMetric: {
    fontFamily: fonts.serif.semibold,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -1.2,
    fontVariant: ["tabular-nums"]
  },
  pageTitle: {
    fontFamily: fonts.serif.semibold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.3
  },
  sectionTitle: {
    fontFamily: fonts.sans.semibold,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.1
  },
  cardTitle: {
    fontFamily: fonts.sans.semibold,
    fontSize: 16,
    lineHeight: 23,
    letterSpacing: -0.1
  },
  body: {
    fontFamily: fonts.sans.regular,
    fontSize: 16,
    lineHeight: 25,
    letterSpacing: 0
  },
  supporting: {
    fontFamily: fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0
  },
  label: {
    fontFamily: fonts.sans.semibold,
    fontSize: 13,
    lineHeight: 19,
    letterSpacing: 0.1
  },
  caption: {
    fontFamily: fonts.sans.medium,
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.1
  },
  /** Uppercase kicker above a title. Tracking does the work, not size. */
  eyebrow: {
    fontFamily: fonts.sans.semibold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.3,
    textTransform: "uppercase"
  },
  /** Any figure that sits in a column or changes in place. */
  numeric: {
    fontFamily: fonts.sans.semibold,
    fontSize: 22,
    lineHeight: 29,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"]
  }
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof typography;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 44
};

export const layout = {
  gutter: 20,
  maxContentWidth: 520,
  minTouchTarget: 48,
  tabBarHeight: 76,
  headerHeight: 64
};

export const radius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999
};

export const motion = {
  duration: {
    quick: 140,
    base: 220,
    considered: 340,
    /** Hero reveals only — the cycle ring drawing itself in. */
    deliberate: 620
  },
  spring: {
    damping: 18,
    stiffness: 170,
    mass: 0.9
  },
  /** Softer spring for large surfaces, where the default reads as a twitch. */
  springSoft: {
    damping: 22,
    stiffness: 120,
    mass: 1
  },
  pressScale: 0.975
};

export const phaseOrder: PhaseName[] = [
  "menstrual",
  "follicular",
  "fertile",
  "ovulation",
  "luteal"
];

/**
 * Copy only — colour lives in the active theme, so a phase looks right in both
 * light and dark. These strings are the fallback English; the i18n dictionary
 * overrides them at render time.
 */
export const phaseMeta: Record<
  PhaseName,
  { label: string; shortLabel: string; description: string }
> = {
  menstrual: {
    label: "Menstrual phase",
    shortLabel: "Period",
    description: "Energy may be lower. Gentle logging helps future predictions."
  },
  follicular: {
    label: "Follicular phase",
    shortLabel: "Renew",
    description: "Your body is moving toward the fertile window."
  },
  fertile: {
    label: "Fertile window",
    shortLabel: "Fertile",
    description: "An estimated fertile span based on recent cycle history."
  },
  ovulation: {
    label: "Estimated ovulation",
    shortLabel: "Ovulation",
    description: "Prediction only. LH, BBT, and mucus logs can improve confidence."
  },
  luteal: {
    label: "Luteal phase",
    shortLabel: "Prepare",
    description: "PMS patterns often become clearer in this phase."
  },
  pregnancy: {
    label: "Pregnancy mode",
    shortLabel: "Pregnancy",
    description: "Week-by-week support after pregnancy is confirmed."
  },
  wellness: {
    label: "Wellness",
    shortLabel: "Wellness",
    description: "Daily body signals, mood, and care habits."
  }
};
