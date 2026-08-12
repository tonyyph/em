import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";
import type { CyclePrediction } from "@/domain/entities/cycle";

export type Confidence = CyclePrediction["confidence"];

type ConfidenceBadgeProps = {
  confidence: Confidence;
  /** Hides the word, leaving only the three bars — for tight rows. */
  compact?: boolean;
};

const LABEL: Record<Confidence, string> = {
  high: "Strong signal",
  medium: "Moderate signal",
  low: "Needs more history"
};

const FILLED: Record<Confidence, number> = { high: 3, medium: 2, low: 1 };

/**
 * The app's one honest gesture, made consistent: wherever a prediction is
 * shown, this says how much to trust it. Three bars rather than a percentage,
 * because the underlying estimate does not justify a number.
 */
export function ConfidenceBadge({ confidence, compact = false }: ConfidenceBadgeProps) {
  const { colors } = useTheme();

  const tint = {
    high: colors.success,
    medium: colors.warning,
    low: colors.textMuted
  }[confidence];

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.surfaceMuted },
        compact ? styles.compact : undefined
      ]}
      accessibilityRole="text"
      accessibilityLabel={`Prediction confidence: ${LABEL[confidence]}`}
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
    </View>
  );
}

export const getConfidenceLabel = (confidence: Confidence) => LABEL[confidence];

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
