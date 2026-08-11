import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { colors, radius, spacing } from "@/design/tokens";

type EmptyStateProps = {
  title: string;
  body: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

export function EmptyState({ title, body, actionLabel, onActionPress }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Ionicons name="leaf-outline" size={24} color={colors.brandAction} />
      </View>
      <AppText variant="cardTitle" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="supporting" color="textSecondary" style={styles.body}>
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
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: "flex-start"
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  title: {
    marginBottom: spacing.xs
  },
  body: {
    marginBottom: spacing.md
  },
  action: {
    alignSelf: "stretch"
  }
});
