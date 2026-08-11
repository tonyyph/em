import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { AccessibilityInfo, Platform, useColorScheme, type ViewStyle } from "react-native";
import { darkColors, lightColors, type ThemeColors } from "./palettes";

export type ColorSchemeName = "light" | "dark";
export type ThemePreference = "system" | ColorSchemeName;

export type Elevation = {
  none: ViewStyle;
  /** Cards that sit on the page. */
  raised: ViewStyle;
  /** Cards that sit on other cards, and the day-detail panel. */
  lifted: ViewStyle;
  /** The tab bar and modal sheets, which cast upward. */
  sheet: ViewStyle;
};

export type Theme = {
  scheme: ColorSchemeName;
  isDark: boolean;
  colors: ThemeColors;
  elevation: Elevation;
  /** True when the OS asks for reduced motion. Animations must degrade, not stop. */
  reduceMotion: boolean;
};

/**
 * Shadows are warm, never neutral grey — a grey shadow on warm paper reads as
 * dirt. In dark mode shadows are close to invisible against a near-black
 * ground, so depth is carried by surface lightness and a hairline instead, and
 * the shadow is kept only to soften the edge.
 */
const buildElevation = (isDark: boolean): Elevation => {
  if (isDark) {
    return {
      none: {},
      raised: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.34,
        shadowRadius: 14,
        elevation: 2
      },
      lifted: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.42,
        shadowRadius: 22,
        elevation: 5
      },
      sheet: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.46,
        shadowRadius: 20,
        elevation: 10
      }
    };
  }

  return {
    none: {},
    raised: {
      shadowColor: "#4A3128",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.07,
      shadowRadius: 16,
      elevation: 2
    },
    lifted: {
      shadowColor: "#4A3128",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.1,
      shadowRadius: 28,
      elevation: 5
    },
    sheet: {
      shadowColor: "#3A2620",
      shadowOffset: { width: 0, height: -8 },
      shadowOpacity: 0.1,
      shadowRadius: 22,
      elevation: 10
    }
  };
};

const ThemeContext = createContext<Theme | undefined>(undefined);
const ThemePreferenceContext = createContext<{
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
}>({ preference: "system", setPreference: () => {} });

/**
 * Tracks the OS reduce-motion setting and keeps tracking it — the user can flip
 * it while the app is open, and a one-shot read at mount would miss that.
 */
const useReduceMotion = () => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) {
        setReduceMotion(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
};

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>("system");
  const reduceMotion = useReduceMotion();

  const scheme: ColorSchemeName =
    preference === "system" ? (systemScheme === "dark" ? "dark" : "light") : preference;

  const theme = useMemo<Theme>(() => {
    const isDark = scheme === "dark";
    return {
      scheme,
      isDark,
      colors: isDark ? darkColors : lightColors,
      elevation: buildElevation(isDark),
      reduceMotion
    };
  }, [scheme, reduceMotion]);

  const preferenceValue = useMemo(
    () => ({ preference, setPreference }),
    [preference]
  );

  return (
    <ThemePreferenceContext.Provider value={preferenceValue}>
      <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
    </ThemePreferenceContext.Provider>
  );
}

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error("useTheme must be used inside <ThemeProvider>.");
  }
  return theme;
};

export const useThemePreference = () => useContext(ThemePreferenceContext);

/** Convenience for the common case of only needing colours. */
export const useColors = () => useTheme().colors;

/**
 * Font scaling cap. Vietnamese copy is already ~25% longer than the English it
 * replaces, so the multiplier that a Latin-only layout survives is not the one
 * this app survives.
 */
export const maxFontSizeMultiplier = Platform.OS === "ios" ? 1.35 : 1.3;
