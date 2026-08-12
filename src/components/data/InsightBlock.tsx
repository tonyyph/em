import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

export type InsightSignal = "strong" | "moderate" | "early";

type InsightBlockProps = {
  label: string;
  title: string;
  body: string;
  signal?: InsightSignal;
};

const SIGNAL_COPY: Record<InsightSignal, string> = {
  strong: "Well supported",
  moderate: "Partly supported",
  early: "Early days"
};

export function InsightBlock({ label, title, body, signal = "early" }: InsightBlockProps) {
  const { colors } = useTheme();

  const tint = {
    strong: colors.success,
    moderate: colors.warning,
    early: colors.textMuted
  }[signal];

  return (
    <View style={[styles.root, { borderTopColor: colors.separator }]}>
      <View style={styles.meta}>
        <AppText variant="eyebrow" color="textMuted" style={styles.label} numberOfLines={1}>
          {label}
        </AppText>
        <View style={[styles.pill, { backgroundColor: colors.surfaceMuted }]}>
          <View style={[styles.dot, { backgroundColor: tint }]} />
          <AppText variant="caption" style={{ color: tint }}>
            {SIGNAL_COPY[signal]}
          </AppText>
        </View>
      </View>
      <AppText variant="cardTitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="supporting" color="textSecondary">
        {body}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.xs
  },
  label: {
    flex: 1
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.full
  },
  title: {
    marginBottom: spacing.xxs
  }
});
