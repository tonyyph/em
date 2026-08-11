import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "@/design/tokens";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  tone?: "warm" | "cool" | "plain";
};

export function MetricCard({ label, value, detail, tone = "plain" }: MetricCardProps) {
  return (
    <View style={[styles.root, styles[tone]]}>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
      <AppText variant="numeric" style={styles.value}>
        {value}
      </AppText>
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
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  warm: {
    backgroundColor: colors.surfaceWarm
  },
  cool: {
    backgroundColor: colors.surfaceCool
  },
  plain: {},
  value: {
    marginTop: spacing.xs
  },
  detail: {
    marginTop: spacing.xxs
  }
});
