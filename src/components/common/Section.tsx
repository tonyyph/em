import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, spacing } from "@/design/tokens";

type SectionProps = PropsWithChildren<{
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
}>;

export function Section({ title, eyebrow, description, action, children }: SectionProps) {
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {eyebrow ? (
            <AppText variant="caption" color="textMuted" style={styles.eyebrow}>
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="sectionTitle">{title}</AppText>
          {description ? (
            <AppText variant="supporting" color="textSecondary" style={styles.description}>
              {description}
            </AppText>
          ) : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: spacing.xl
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: spacing.md,
    marginBottom: spacing.sm
  },
  headerText: {
    flex: 1
  },
  eyebrow: {
    color: colors.textMuted,
    textTransform: "uppercase"
  },
  description: {
    marginTop: spacing.xs
  }
});
