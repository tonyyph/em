import { StyleSheet, View, type ViewStyle } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "./AppText";
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
  style?: ViewStyle;
};

export function MetricCard({
  label,
  value,
  detail,
  phase,
  icon,
  qualifier,
  style
}: MetricCardProps) {
  const { colors, elevation } = useTheme();

  const accent = phase ? colors.phases[phase] : colors.textMuted;
  const ground = phase ? colors.phaseSoft[phase] : colors.surface;

  return (
    <View
      style={[
        styles.root,
        elevation.raised,
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
    </View>
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
