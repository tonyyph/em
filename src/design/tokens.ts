import { Platform } from "react-native";

export const palette = {
  paper: "#FBF6EF",
  paperDeep: "#F1E5D8",
  porcelain: "#FFFDF9",
  vellum: "#F7EFE5",
  ink: "#251C1E",
  inkSoft: "#51464A",
  inkMuted: "#7B7074",
  hairline: "#E2D7CD",
  action: "#7E3F46",
  actionPressed: "#633139",
  menstrual: "#B94E56",
  follicular: "#7BAE9A",
  fertile: "#2F8C8D",
  ovulation: "#C58B2A",
  luteal: "#7F6AAE",
  pregnancy: "#9A6B47",
  wellness: "#5C7F99",
  success: "#2F7C57",
  warning: "#A46719",
  error: "#A33A3F",
  focus: "#1F6E73",
  scrim: "rgba(37, 28, 30, 0.42)",
  disabled: "rgba(37, 28, 30, 0.32)"
};

export const colors = {
  background: palette.paper,
  backgroundElevated: palette.porcelain,
  backgroundMuted: palette.vellum,
  surface: palette.porcelain,
  surfaceWarm: "#F8EBDD",
  surfaceCool: "#EEF4F2",
  textPrimary: palette.ink,
  textSecondary: palette.inkSoft,
  textMuted: palette.inkMuted,
  border: palette.hairline,
  separator: "rgba(37, 28, 30, 0.1)",
  brandAction: palette.action,
  brandActionPressed: palette.actionPressed,
  destructive: palette.error,
  focus: palette.focus,
  disabled: palette.disabled,
  scrim: palette.scrim,
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  chartGrid: "rgba(37, 28, 30, 0.12)",
  chartLabel: palette.inkMuted,
  phases: {
    menstrual: palette.menstrual,
    follicular: palette.follicular,
    fertile: palette.fertile,
    ovulation: palette.ovulation,
    luteal: palette.luteal,
    pregnancy: palette.pregnancy,
    wellness: palette.wellness
  }
};

export const typography = {
  display: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: "700" as const,
    letterSpacing: 0
  },
  heroMetric: {
    fontSize: 48,
    lineHeight: 54,
    fontWeight: "700" as const,
    letterSpacing: 0
  },
  pageTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700" as const,
    letterSpacing: 0
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
    letterSpacing: 0
  },
  cardTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700" as const,
    letterSpacing: 0
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    letterSpacing: 0
  },
  supporting: {
    fontSize: 14,
    lineHeight: 21,
    fontWeight: "400" as const,
    letterSpacing: 0
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700" as const,
    letterSpacing: 0
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600" as const,
    letterSpacing: 0
  },
  numeric: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700" as const,
    letterSpacing: 0,
    fontVariant: ["tabular-nums"] as const
  }
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40
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
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  full: 999
};

export const elevation = {
  none: {},
  raised: Platform.select({
    ios: {
      shadowColor: "#2B1F22",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 24
    },
    android: { elevation: 3 },
    default: {}
  }),
  sheet: Platform.select({
    ios: {
      shadowColor: "#2B1F22",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.12,
      shadowRadius: 20
    },
    android: { elevation: 8 },
    default: {}
  })
};

export const motion = {
  duration: {
    quick: 140,
    base: 220,
    considered: 340
  },
  spring: {
    damping: 18,
    stiffness: 170,
    mass: 0.9
  },
  pressScale: 0.975
};

export type PhaseName = keyof typeof colors.phases;

export const phaseMeta: Record<
  PhaseName,
  {
    label: string;
    shortLabel: string;
    description: string;
    color: string;
  }
> = {
  menstrual: {
    label: "Menstrual phase",
    shortLabel: "Period",
    description: "Energy may be lower. Gentle logging helps future predictions.",
    color: colors.phases.menstrual
  },
  follicular: {
    label: "Follicular phase",
    shortLabel: "Renew",
    description: "Your body is moving toward the fertile window.",
    color: colors.phases.follicular
  },
  fertile: {
    label: "Fertile window",
    shortLabel: "Fertile",
    description: "An estimated fertile span based on recent cycle history.",
    color: colors.phases.fertile
  },
  ovulation: {
    label: "Estimated ovulation",
    shortLabel: "Ovulation",
    description: "Prediction only. LH, BBT, and mucus logs can improve confidence.",
    color: colors.phases.ovulation
  },
  luteal: {
    label: "Luteal phase",
    shortLabel: "Prepare",
    description: "PMS patterns often become clearer in this phase.",
    color: colors.phases.luteal
  },
  pregnancy: {
    label: "Pregnancy mode",
    shortLabel: "Pregnancy",
    description: "Week-by-week support after pregnancy is confirmed.",
    color: colors.phases.pregnancy
  },
  wellness: {
    label: "Wellness",
    shortLabel: "Wellness",
    description: "Daily body signals, mood, and care habits.",
    color: colors.phases.wellness
  }
};
