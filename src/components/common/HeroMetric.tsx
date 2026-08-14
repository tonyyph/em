import { useEffect } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { AppText } from "./AppText";
import type { PhaseName } from "@/design/palettes";
import { maxFontSizeMultiplier, useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion, radius, spacing, typography } from "@/design/tokens";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

type HeroMetricProps = {
  eyebrow: string;
  /** The number itself. Counts up from zero on mount. */
  value: number;
  /** Printed after the number at normal size — "days", "weeks". */
  unit?: string;
  /** The sentence under the number that says what it means. */
  caption: string;
  phase?: PhaseName;
};

/**
 * The one number a screen is really about.
 *
 * Every screen should be able to answer "what does this mean right now" in a
 * single glance, and `typography.heroMetric` exists for exactly that — it was
 * defined and then never used anywhere, which is why most screens read as a
 * list of equally-weighted cards with no obvious entry point.
 *
 * The count-up is driven through an uneditable `TextInput` rather than React
 * state: a number animating through state would re-render the subtree on every
 * frame, and the whole point of running it on the UI thread is that it costs
 * nothing.
 */
export function HeroMetric({ eyebrow, value, unit, caption, phase }: HeroMetricProps) {
  const { colors, elevation, reduceMotion } = useTheme();
  const count = useSharedValue(reduceMotion ? value : 0);

  const accent = phase ? colors.phases[phase] : colors.brandAction;
  const ground = phase ? colors.phaseSoft[phase] : colors.surface;

  useEffect(() => {
    count.value = reduceMotion
      ? value
      : withTiming(value, {
          duration: motion.duration.deliberate,
          easing: Easing.bezier(...curves.enter)
        });
  }, [count, value, reduceMotion]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(count.value)}`,
    // iOS needs `value` as well for the initial render to pick the text up.
    defaultValue: `${Math.round(count.value)}`
  }));

  return (
    <View
      style={[
        styles.root,
        elevation.lifted,
        { backgroundColor: ground, borderColor: phase ? "transparent" : colors.border }
      ]}
      accessibilityRole="summary"
      accessibilityLabel={`${eyebrow}: ${value} ${unit ?? ""}. ${caption}`}
    >
      <AppText variant="eyebrow" color="textMuted">
        {eyebrow}
      </AppText>

      <View style={styles.figure} accessibilityElementsHidden importantForAccessibility="no">
        <AnimatedTextInput
          editable={false}
          // The scroll view underneath must keep the touch — the number is not
          // a field, it only borrows the component to be cheap to animate.
          pointerEvents="none"
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[styles.number, typography.heroMetric, { color: colors.textPrimary }]}
          animatedProps={animatedProps}
        />
        {unit ? (
          <AppText variant="sectionTitle" style={[styles.unit, { color: accent }]}>
            {unit}
          </AppText>
        ) : null}
      </View>

      <AppText variant="supporting" color="textSecondary">
        {caption}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg
  },
  figure: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
    marginTop: spacing.xxs,
    marginBottom: spacing.xxs
  },
  number: {
    // TextInput carries platform padding a Text does not; without stripping it
    // the number sits low against its caption.
    padding: 0,
    margin: 0
  },
  unit: {
    marginBottom: 6
  }
});
