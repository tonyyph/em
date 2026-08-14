import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Tappable } from "./Tappable";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";
import type { CyclePrediction } from "@/domain/entities/cycle";

export type Confidence = CyclePrediction["confidence"];

type ConfidenceBadgeProps = {
  confidence: Confidence;
  /** Hides the word, leaving only the three bars — for tight rows. */
  compact?: boolean;
  /** Opens the explanation of what this level means and what would raise it. */
  onPress?: () => void;
};

const LABEL: Record<Confidence, string> = {
  high: "Strong signal",
  medium: "Moderate signal",
  low: "Needs more history"
};

/**
 * What the badge says when someone asks it to explain itself. Epistemic honesty
 * is the product's whole differentiator, so the explanation has to be as
 * concrete as the claim — "needs more history" is only useful next to how much
 * more, and of what.
 */
const EXPLANATION: Record<Confidence, string> = {
  high: "Your recent cycles have been close to the same length, so a single predicted date is defensible. Ẽm still shows this as an estimate, because a cycle can shift for reasons no app can see.",
  medium:
    "Your cycles vary enough that Ẽm widens the prediction to a span rather than naming one day. More logged cycles will narrow it.",
  low: "There is not yet enough history to say much. Ẽm needs roughly three recorded cycles before a prediction means more than an average."
};

const FILLED: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };

/**
 * The app's one honest gesture, made consistent: wherever a prediction is
 * shown, this says how much to trust it. Three bars rather than a percentage,
 * because the underlying estimate does not justify a number.
 */
export function ConfidenceBadge({
  confidence,
  compact = false,
  onPress
}: ConfidenceBadgeProps) {
  const { colors } = useTheme();

  const tint = {
    high: colors.success,
    medium: colors.warning,
    low: colors.textMuted
  }[confidence];

  const Container = onPress ? Tappable : View;
  const interaction = onPress
    ? ({
        onPress,
        dense: true,
        haptic: "selection" as const,
        accessibilityRole: "button" as const,
        accessibilityLabel: `Prediction confidence: ${LABEL[confidence]}`,
        accessibilityHint: "Explains what this confidence level means"
      } as const)
    : ({
        accessibilityRole: "text" as const,
        accessibilityLabel: `Prediction confidence: ${LABEL[confidence]}`
      } as const);

  return (
    <Container
      {...interaction}
      style={[
        styles.root,
        { backgroundColor: colors.surfaceMuted },
        compact ? styles.compact : undefined
      ]}
    >
      <View style={styles.bars}>
        {[0, 1, 2].map((bar) => (
          <View
            key={bar}
            style={[
              styles.bar,
              { height: 7 + bar * 3 },
              { backgroundColor: bar < FILLED[confidence] ? tint : colors.separator }
            ]}
          />
        ))}
      </View>
      {compact ? null : (
        <AppText variant="caption" style={{ color: tint }}>
          {LABEL[confidence]}
        </AppText>
      )}
    </Container>
  );
}

export const getConfidenceLabel = (confidence: Confidence) => LABEL[confidence];

/** The copy a screen shows when someone taps the badge to ask why. */
export const getConfidenceExplanation = (confidence: Confidence) => EXPLANATION[confidence];

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  compact: {
    paddingHorizontal: spacing.xs
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2
  },
  bar: {
    width: 3,
    borderRadius: radius.full
  }
});
