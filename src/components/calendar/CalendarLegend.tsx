import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

function LegendPill({
  label,
  color,
  dashed = false
}: {
  label: string;
  color: string;
  dashed?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: colors.surfaceMuted }]}>
      <View
        style={[
          styles.swatch,
          dashed
            ? { borderWidth: 1.5, borderStyle: "dashed", borderColor: color }
            : { backgroundColor: color }
        ]}
      />
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

/**
 * The key to the marker grammar. It is deliberately always visible rather than
 * hidden behind a control: the whole point of the calendar is that a recorded
 * day and an estimated one look different, and a legend nobody opens does not
 * carry that.
 */
export function CalendarLegend() {
  const { colors } = useTheme();

  return (
    <View style={[styles.root, { borderTopColor: colors.separator }]}>
      <LegendPill label="Period" color={colors.phases.menstrual} />
      <LegendPill label="Predicted" color={colors.phasePredicted} dashed />
      <LegendPill label="Fertile" color={colors.phaseSoft.fertile} />
      <LegendPill label="Ovulation" color={colors.phases.ovulation} />
      <LegendPill label="Logged" color={colors.phases.wellness} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4
  },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: radius.full
  }
});
