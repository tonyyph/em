import { StyleSheet, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import type { PhaseName } from "@/design/palettes";
import { useTheme } from "@/design/theme";
import { motion, phaseMeta, phaseOrder, radius, spacing } from "@/design/tokens";

type PhaseTimelineProps = {
  active: PhaseName;
};

export function PhaseTimeline({ active }: PhaseTimelineProps) {
  const { colors, reduceMotion } = useTheme();

  // `pregnancy` and `wellness` sit outside the menstrual sequence, so the strip
  // renders with nothing active rather than mis-highlighting a phase.
  const activeIndex = phaseOrder.indexOf(active);

  return (
    <View
      style={styles.root}
      accessibilityRole="progressbar"
      accessibilityLabel={`Cycle phase timeline. Current phase: ${phaseMeta[active].label}`}
    >
      {phaseOrder.map((phase, index) => {
        const selected = index === activeIndex;
        const passed = activeIndex >= 0 && index < activeIndex;

        return (
          <View key={phase} style={styles.item}>
            <View
              style={[
                styles.line,
                selected ? styles.lineActive : undefined,
                {
                  backgroundColor: selected
                    ? colors.phases[phase]
                    : passed
                      ? colors.phaseSoft[phase]
                      : colors.separator
                }
              ]}
            />
            <AppText
              variant="caption"
              color={selected ? "textPrimary" : "textMuted"}
              numberOfLines={1}
              style={styles.label}
            >
              {phaseMeta[phase].shortLabel}
            </AppText>
            {selected ? (
              <Animated.View
                entering={
                  reduceMotion ? undefined : FadeIn.duration(motion.duration.base)
                }
                style={[styles.dot, { backgroundColor: colors.phases[phase] }]}
              />
            ) : null}
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
    flex: 1,
    alignItems: "center"
  },
  line: {
    height: 5,
    width: "100%",
    borderRadius: radius.full,
    marginBottom: spacing.xs
  },
  lineActive: {
    height: 8,
    marginBottom: spacing.xs - 3
  },
  label: {
    textAlign: "center"
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: radius.full,
    marginTop: spacing.xxs
  }
});
