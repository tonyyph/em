import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/common/AppText";
import { Tappable } from "@/components/common/Tappable";
import { useTheme } from "@/design/theme";
import { radius } from "@/design/tokens";
import { accessibilityFor, describeDay, type DayState } from "./dayState";
import { dayjs } from "@/utils/date/dayjs";

type CalendarDayProps = {
  date: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  state: DayState;
  onPress: () => void;
};

/**
 * One cell of the month grid.
 *
 * A day is a small target, so it takes the deepest press in the app — at the
 * card's scale the movement would be invisible at 36pt.
 */
export function CalendarDay({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  state,
  onPress
}: CalendarDayProps) {
  const theme = useTheme();
  const { colors } = theme;

  const tone = describeDay(state, theme);
  const textColor = isCurrentMonth ? (tone.text ?? colors.textPrimary) : colors.textMuted;

  return (
    <Tappable
      dense
      scale={0.9}
      haptic="selection"
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityFor(date, state)}
      onPress={onPress}
      style={styles.day}
    >
      <View
        style={[
          styles.dayShell,
          {
            backgroundColor: isCurrentMonth ? tone.ground : "transparent",
            borderColor: tone.dashed && isCurrentMonth ? colors.phasePredicted : "transparent",
            borderStyle: tone.dashed ? "dashed" : "solid",
            borderWidth: tone.dashed && isCurrentMonth ? 2 : 0
          },
          isSelected
            ? { borderWidth: 2, borderStyle: "solid", borderColor: colors.textPrimary }
            : undefined
        ]}
      >
        <AppText variant="label" style={{ color: textColor }}>
          {dayjs(date).date()}
        </AppText>
      </View>

      <View style={styles.markerRow}>
        {state.symptom && isCurrentMonth ? (
          <View style={[styles.symptomDot, { backgroundColor: colors.phases.wellness }]} />
        ) : null}
        {isToday ? <View style={[styles.todayDot, { backgroundColor: colors.focus }]} /> : null}
      </View>
    </Tappable>
  );
}

const styles = StyleSheet.create({
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2
  },
  dayShell: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center"
  },
  markerRow: {
    height: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1
  },
  symptomDot: {
    width: 4,
    height: 4,
    borderRadius: radius.full
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: radius.full
  }
});
