import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({
  title,
  body,
  icon = "leaf-outline",
  actionLabel,
  onActionPress
}: EmptyStateProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <View style={[styles.badge, { backgroundColor: colors.brandActionSoft }]}>
        <Ionicons name={icon} size={20} color={colors.brandAction} />
      </View>
      <AppText variant="cardTitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="supporting" color="textSecondary">
        {body}
      </AppText>
      {actionLabel && onActionPress ? (
        <Button variant="tonal" onPress={onActionPress} style={styles.action}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    padding: spacing.lg
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    marginBottom: spacing.xxs
  },
  action: {
    alignSelf: "flex-start",
    marginTop: spacing.md
  }
});
