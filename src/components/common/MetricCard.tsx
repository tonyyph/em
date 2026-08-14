import { StyleSheet, View, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "./AppText";
import { Tappable } from "./Tappable";
import type { PhaseName } from "@/design/palettes";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  /** Ties the card to a cycle phase — sets its ground, rule and accent. */
  phase?: PhaseName;
  icon?: keyof typeof Ionicons.glyphMap;
  /**
   * A qualifier printed beside the value, for anything the app is not certain
   * about: "estimate", "±3 days", "needs more history".
   */
  qualifier?: string;
  /**
   * Opens the detail behind the number. A card that shows a prediction but
   * cannot explain it is the kind of dead end that makes an app feel like a
   * mock-up, so most call sites should pass this.
   */
  onPress?: () => void;
  style?: ViewStyle;
};

export function MetricCard({
  label,
  value,
  detail,
  phase,
  icon,
  qualifier,
  onPress,
  style
}: MetricCardProps) {
  const { colors, elevation } = useTheme();

  const accent = phase ? colors.phases[phase] : colors.textMuted;
  const ground = phase ? colors.phaseSoft[phase] : colors.surface;

  // A card is a large target, so it takes a gentler press than a button — at
  // the button's scale a full-width surface looks like it is collapsing.
  const Container = onPress ? Tappable : View;
  const interaction = onPress
    ? ({
        onPress,
        scale: 0.99,
        haptic: "light" as const,
        accessibilityRole: "button" as const,
        accessibilityLabel: `${label}: ${value}${qualifier ? `, ${qualifier}` : ""}`
      } as const)
    : undefined;

  return (
    <Container
      {...interaction}
      style={[
        styles.root,
        onPress ? elevation.lifted : elevation.raised,
        { backgroundColor: ground, borderColor: phase ? "transparent" : colors.border },
        style
      ]}
    >
      <View style={styles.head}>
        <View style={[styles.rule, { backgroundColor: accent }]} />
        <AppText variant="eyebrow" color="textMuted" style={styles.label} numberOfLines={2}>
          {label}
        </AppText>
        {icon ? <Ionicons name={icon} size={15} color={accent} /> : null}
      </View>

      <AppText variant="numeric" style={styles.value}>
        {value}
      </AppText>

      {qualifier ? (
        <AppText variant="caption" style={{ color: accent }}>
          {qualifier}
        </AppText>
      ) : null}

      {detail ? (
        <AppText variant="caption" color="textSecondary" style={styles.detail}>
          {detail}
        </AppText>
      ) : null}
    </Container>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  rule: {
    width: 3,
    height: 14,
    borderRadius: radius.full
  },
  label: {
    flex: 1
  },
  value: {
    marginTop: spacing.sm
  },
  detail: {
    marginTop: spacing.xxs
  }
});
