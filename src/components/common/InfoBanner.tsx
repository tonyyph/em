import { StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "@/design/tokens";

type InfoBannerTone = "neutral" | "warning" | "error" | "success";

type InfoBannerProps = {
  title: string;
  body?: string;
  tone?: InfoBannerTone;
};

const toneColor: Record<InfoBannerTone, string> = {
  neutral: colors.surfaceCool,
  warning: "#F6E5C5",
  error: "#F5D9D7",
  success: "#DCEDE4"
};

const toneIcon: Record<InfoBannerTone, keyof typeof Ionicons.glyphMap> = {
  neutral: "shield-checkmark-outline",
  warning: "alert-circle-outline",
  error: "warning-outline",
  success: "checkmark-circle-outline"
};

export function InfoBanner({ title, body, tone = "neutral" }: InfoBannerProps) {
  return (
    <View style={[styles.root, { backgroundColor: toneColor[tone] }]}>
      <Ionicons name={toneIcon[tone]} size={20} color={colors.textPrimary} />
      <View style={styles.copy}>
        <AppText variant="cardTitle">{title}</AppText>
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
    alignItems: "flex-start"
  },
  copy: {
    flex: 1
  },
  body: {
    marginTop: spacing.xxs
  }
});
