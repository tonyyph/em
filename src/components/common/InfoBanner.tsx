import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

export type BannerTone = "neutral" | "warning" | "error" | "success";

type InfoBannerProps = {
  title: string;
  body?: string;
  tone?: BannerTone;
};

const iconFor: Record<BannerTone, keyof typeof Ionicons.glyphMap> = {
  neutral: "shield-checkmark-outline",
  warning: "alert-circle-outline",
  error: "warning-outline",
  success: "checkmark-circle-outline"
};

export function InfoBanner({ title, body, tone = "neutral" }: InfoBannerProps) {
  const { colors } = useTheme();

  const ground = {
    neutral: colors.bannerNeutral,
    warning: colors.bannerWarning,
    error: colors.bannerError,
    success: colors.bannerSuccess
  }[tone];

  const accent = {
    neutral: colors.focus,
    warning: colors.warning,
    error: colors.error,
    success: colors.success
  }[tone];

  return (
    <View style={[styles.root, { backgroundColor: ground }]}>
      <Ionicons name={iconFor[tone]} size={19} color={accent} style={styles.icon} />
      <View style={styles.copy}>
        <AppText variant="label">{title}</AppText>
        {body ? (
          <AppText variant="supporting" color="textSecondary" style={styles.body}>
            {body}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  icon: {
    marginTop: 1
  },
  copy: {
    flex: 1
  },
  body: {
    marginTop: spacing.xxs
  }
});
