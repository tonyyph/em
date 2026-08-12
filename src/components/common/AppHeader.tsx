import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "./AppText";
import { useTheme } from "@/design/theme";
import { layout, radius, spacing } from "@/design/tokens";

type AppHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  onActionPress?: () => void;
};

export function AppHeader({
  eyebrow,
  title,
  subtitle,
  actionLabel,
  actionIcon = "information-circle-outline",
  onActionPress
}: AppHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.root}>
      <View style={styles.copy}>
        {eyebrow ? (
          <AppText variant="eyebrow" color="textMuted" style={styles.eyebrow}>
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
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.7 : 1
            }
          ]}
        >
          <Ionicons name={actionIcon} size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: layout.headerHeight,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md
  },
  copy: {
    flex: 1
  },
  eyebrow: {
    marginBottom: spacing.xs
  },
  subtitle: {
    marginTop: spacing.xs,
    maxWidth: 340
  },
  action: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xs
  }
});
