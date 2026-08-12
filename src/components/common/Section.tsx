import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { spacing } from "@/design/tokens";

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
        <View style={styles.copy}>
          {eyebrow ? (
            <AppText variant="eyebrow" color="textMuted" style={styles.eyebrow}>
              {eyebrow}
            </AppText>
          ) : null}
          <AppText variant="sectionTitle">{title}</AppText>
        </View>
        {action}
      </View>
      {description ? (
        <AppText variant="supporting" color="textSecondary" style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: spacing.xxl
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  copy: {
    flex: 1
  },
  eyebrow: {
    marginBottom: spacing.xxs
  },
  description: {
    marginTop: spacing.xxs,
    marginBottom: spacing.sm
  }
});
