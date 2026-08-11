import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { colors, layout, radius, spacing } from "@/design/tokens";

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
};

export function AppHeader({ eyebrow, title, subtitle, actionLabel, actionIcon = "information-circle-outline", onActionPress }: AppHeaderProps) {
  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        {eyebrow ? (
          <AppText variant="caption" color="textMuted" style={styles.eyebrow}>
            {eyebrow}
          </AppText>
        ) : null}
        <AppText variant="pageTitle">{title}</AppText>
        {subtitle ? (
          <AppText variant="supporting" color="textSecondary" style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          hitSlop={8}
          onPress={onActionPress}
          style={({ pressed }) => [styles.action, pressed ? styles.pressed : undefined]}
        >
          <Ionicons name={actionIcon} size={22} color={colors.textPrimary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: layout.headerHeight,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  copy: {
    flex: 1
  },
  eyebrow: {
    marginBottom: spacing.xxs,
    textTransform: "uppercase"
  },
  subtitle: {
    marginTop: spacing.xs
  },
  action: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  pressed: {
    opacity: 0.75
  }
});
