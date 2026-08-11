import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/common/AppText";
import { colors, radius, spacing, type PhaseName, phaseMeta } from "@/design/tokens";

type PhaseTimelineProps = {
  active: PhaseName;
};

const ordered: PhaseName[] = ["menstrual", "follicular", "fertile", "ovulation", "luteal"];

export function PhaseTimeline({ active }: PhaseTimelineProps) {
  return (
    <View style={styles.root} accessibilityLabel={`Cycle phase timeline. Current phase: ${phaseMeta[active].label}`}>
      {ordered.map((phase) => {
        const selected = phase === active;
        return (
          <View key={phase} style={styles.item}>
            <View
              style={[
                styles.line,
                { backgroundColor: selected ? phaseMeta[phase].color : colors.separator }
              ]}
            />
            <AppText variant="caption" color={selected ? "textPrimary" : "textMuted"} style={styles.label}>
              {phaseMeta[phase].shortLabel}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    gap: spacing.xs
  },
  item: {
    flex: 1
  },
  line: {
    height: 5,
    borderRadius: radius.full,
    marginBottom: spacing.xs
  },
  label: {
    textAlign: "center"
  }
});
