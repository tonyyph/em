import { StyleSheet, Switch, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

type ControlRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  onValueChange?: (next: boolean) => void;
  /** Why this cannot be switched on yet. Renders instead of a live control. */
  unavailable?: string;
  /** Suppresses the divider on the last row of a panel. */
  last?: boolean;
};

/**
 * A settings row with a real control, or an honest note about why there isn't
 * one yet.
 *
 * Showing a dead switch would be worse than showing none: a toggle that flips
 * and does nothing is a promise the app cannot keep, and this screen is
 * specifically about being trustworthy with health data.
 */
export function ControlRow({
  icon,
  title,
  body,
  value,
  onValueChange,
  unavailable,
  last = false
}: ControlRowProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.root,
        last ? styles.last : { borderBottomColor: colors.separator }
      ]}
    >
      <Ionicons name={icon} size={21} color={colors.brandAction} />
      <View style={styles.copy}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText variant="supporting" color="textSecondary">
          {body}
        </AppText>
        {unavailable ? (
          <View style={[styles.notYet, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="caption" color="textMuted">
              {unavailable}
            </AppText>
          </View>
        ) : null}
      </View>
      {unavailable ? null : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          accessibilityLabel={title}
          trackColor={{ true: colors.brandAction, false: colors.backgroundSunken }}
          thumbColor={colors.surface}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  last: {
    borderBottomWidth: 0
  },
  copy: {
    flex: 1
  },
  notYet: {
    alignSelf: "flex-start",
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    marginTop: spacing.xs
  }
});
