import { StyleSheet, View } from "react-native";
import { Link, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "@/components/common/AppText";
import { Tappable } from "@/components/common/Tappable";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

type CareLinkProps = {
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
};

/** A route out of the care centre, drawn as a card rather than a list row. */
export function CareLink({ href, icon, title, body }: CareLinkProps) {
  const { colors, elevation } = useTheme();

  return (
    <Link href={href} asChild>
      <Tappable
        dense
        haptic="light"
        scale={0.99}
        accessibilityRole="link"
        accessibilityLabel={`${title}. ${body}`}
        style={[
          styles.root,
          elevation.raised,
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
      >
        <View style={[styles.icon, { backgroundColor: colors.brandActionSoft }]}>
          <Ionicons name={icon} size={19} color={colors.brandAction} />
        </View>
        <View style={styles.copy}>
          <AppText variant="cardTitle">{title}</AppText>
          <AppText variant="supporting" color="textSecondary">
            {body}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Tappable>
    </Link>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 76,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1
  }
});
