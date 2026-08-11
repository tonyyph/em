import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/common/AppText";
import { colors, radius, spacing } from "@/design/tokens";

type InsightBlockProps = {
  label: string;
  title: string;
  body: string;
  signal?: "strong" | "moderate" | "early";
};

const signalCopy = {
  strong: "Strong",
  moderate: "Moderate",
  early: "Early"
};

export function InsightBlock({ label, title, body, signal = "early" }: InsightBlockProps) {
  return (
    <View style={styles.root}>
      <View style={styles.meta}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <View style={styles.signal}>
          <AppText variant="caption" color="textSecondary">
            {signalCopy[signal]}
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
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  signal: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted
  },
  title: {
    marginTop: spacing.xs,
    marginBottom: spacing.xxs
  }
});
