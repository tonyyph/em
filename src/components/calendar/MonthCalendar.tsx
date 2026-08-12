import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import { useTheme, type Theme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import type { SymptomLog } from "@/domain/entities/symptom";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

type MonthCalendarProps = {
  month?: string;
  cycles: Cycle[];
  symptoms?: SymptomLog[];
  prediction: CyclePrediction;
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

type DayState = {
  loggedPeriod: boolean;
  predictedPeriod: boolean;
  /** Inside the widened range shown when cycles are irregular. */
  predictedRange: boolean;
  fertile: boolean;
  ovulation: boolean;
  symptom: boolean;
};

const getDayState = (
  date: string,
  cycles: Cycle[],
  symptoms: SymptomLog[],
  prediction: CyclePrediction
): DayState => {
  const day = dayjs(date);

  const loggedPeriod = cycles.some((cycle) => {
    // Fall back to the predicted period length rather than a fixed 5 days, so
    // a cycle logged without an end date is not silently mis-drawn.
    const end =
      cycle.endDate ??
      dayjs(cycle.startDate)
        .add(Math.max(prediction.averagePeriodLength - 1, 0), "day")
        .format("YYYY-MM-DD");
    return day.isBetween(cycle.startDate, end, "day", "[]");
  });

  const range = prediction.nextPeriodRange;

  return {
    loggedPeriod,
    predictedPeriod: day.isBetween(
      prediction.nextPeriodStart,
      prediction.nextPeriodEnd,
      "day",
      "[]"
    ),
    predictedRange: range
      ? day.isBetween(range.earliest, range.latest, "day", "[]")
      : false,
    fertile: day.isBetween(
      prediction.fertileWindowStart,
      prediction.fertileWindowEnd,
      "day",
      "[]"
    ),
    ovulation: date === prediction.ovulationDay,
    symptom: symptoms.some((symptom) => symptom.date === date)
  };
};

/**
 * Marker grammar, in priority order. Recorded facts always outrank estimates:
 * a logged period is a solid fill, everything predicted is softer, and the
 * irregularity range is only a tint — it is the weakest claim the app makes.
 */
const describeDay = (state: DayState, theme: Theme) => {
  const { colors } = theme;
  if (state.loggedPeriod) {
    return { ground: colors.phases.menstrual, text: colors.textOnAction, dashed: false };
  }
  if (state.ovulation) {
    return { ground: colors.phaseSoft.ovulation, text: colors.phases.ovulation, dashed: false };
  }
  if (state.predictedPeriod) {
    // Android ignores `borderStyle: dashed` once a border radius is set, so the
    // dash is treated as an iOS enhancement and the lighter `phasePredicted`
    // ring carries the "estimated, not recorded" meaning on both platforms.
    return { ground: "transparent", text: colors.phases.menstrual, dashed: true };
  }
  if (state.fertile) {
    return { ground: colors.phaseSoft.fertile, text: colors.phases.fertile, dashed: false };
  }
  if (state.predictedRange) {
    return { ground: colors.phaseSoft.menstrual, text: colors.textSecondary, dashed: false };
  }
  return { ground: "transparent", text: null, dashed: false };
};

const accessibilityFor = (date: string, state: DayState) => {
  const notes: string[] = [];
  if (state.loggedPeriod) notes.push("period logged");
  if (state.predictedPeriod) notes.push("predicted period");
  else if (state.predictedRange) notes.push("possible period, cycle is irregular");
  if (state.ovulation) notes.push("estimated ovulation");
  else if (state.fertile) notes.push("fertile window");
  if (state.symptom) notes.push("symptom logged");
  return `${dayjs(date).format("dddd, MMMM D")}${notes.length ? `. ${notes.join(", ")}` : ""}`;
};

function CalendarDay({
  date,
  isCurrentMonth,
  isSelected,
  isToday,
  state,
  onPress
}: {
  date: string;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  state: DayState;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { colors, reduceMotion } = theme;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const tone = describeDay(state, theme);
  const textColor = isCurrentMonth
    ? (tone.text ?? colors.textPrimary)
    : colors.textMuted;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityFor(date, state)}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      onPressIn={() => {
        if (!reduceMotion) scale.value = withSpring(0.9, motion.spring);
      }}
      onPressOut={() => {
        if (!reduceMotion) scale.value = withSpring(1, motion.spring);
      }}
      style={[styles.day, animatedStyle]}
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
        {isToday ? (
          <View style={[styles.todayDot, { backgroundColor: colors.focus }]} />
        ) : null}
      </View>
    </AnimatedPressable>
  );
}

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
    <View style={[styles.legendPill, { backgroundColor: colors.surfaceMuted }]}>
      <View
        style={[
          styles.legendSwatch,
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

export function MonthCalendar({
  month,
  cycles,
  symptoms = [],
  prediction,
  selectedDate,
  onSelectDate
}: MonthCalendarProps) {
  const { colors, elevation, reduceMotion } = useTheme();
  const [visibleMonth, setVisibleMonth] = useState(() =>
    dayjs(month ?? selectedDate).startOf("month")
  );

  const gridStart = visibleMonth.startOf("week");
  const today = toIsoDate(new Date());

  const days = useMemo(
    () => Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day")),
    [gridStart]
  );

  const step = (delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setVisibleMonth((current) => current.add(delta, "month"));
  };

  return (
    <View
      style={[
        styles.root,
        elevation.raised,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="eyebrow" color="textMuted">
            Cycle atlas
          </AppText>
          <AppText variant="sectionTitle">{visibleMonth.format("MMMM YYYY")}</AppText>
        </View>
        <View style={styles.monthActions}>
          {([
            ["chevron-back", -1],
            ["chevron-forward", 1]
          ] as const).map(([icon, delta]) => (
            <Pressable
              key={icon}
              accessibilityRole="button"
              accessibilityLabel={delta < 0 ? "Previous month" : "Next month"}
              hitSlop={6}
              onPress={() => step(delta)}
              style={({ pressed }) => [
                styles.monthButton,
                {
                  backgroundColor: colors.surfaceMuted,
                  borderColor: colors.border,
                  opacity: pressed ? 0.6 : 1
                }
              ]}
            >
              <Ionicons name={icon} size={17} color={colors.textPrimary} />
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.weekdays}>
        {WEEKDAYS.map((weekday, index) => (
          <View key={`${weekday}-${index}`} style={styles.weekdayCell}>
            <AppText variant="caption" color="textMuted">
              {weekday}
            </AppText>
          </View>
        ))}
      </View>

      <Animated.View
        key={visibleMonth.format("YYYY-MM")}
        entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}
        style={styles.grid}
      >
        {days.map((day) => {
          const iso = day.format("YYYY-MM-DD");
          return (
            <CalendarDay
              key={iso}
              date={iso}
              isCurrentMonth={day.month() === visibleMonth.month()}
              isSelected={iso === selectedDate}
              isToday={iso === today}
              state={getDayState(iso, cycles, symptoms, prediction)}
              onPress={() => onSelectDate(iso)}
            />
          );
        })}
      </Animated.View>

      <View style={[styles.legend, { borderTopColor: colors.separator }]}>
        <LegendPill label="Period" color={colors.phases.menstrual} />
        <LegendPill label="Predicted" color={colors.phasePredicted} dashed />
        <LegendPill label="Fertile" color={colors.phaseSoft.fertile} />
        <LegendPill label="Ovulation" color={colors.phases.ovulation} />
        <LegendPill label="Logged" color={colors.phases.wellness} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  headerCopy: {
    flex: 1
  },
  monthActions: {
    flexDirection: "row",
    gap: spacing.xs
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center"
  },
  weekdays: {
    flexDirection: "row",
    marginBottom: spacing.xxs
  },
  weekdayCell: {
    width: `${100 / 7}%`,
    alignItems: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
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
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xxs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  legendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs,
    borderRadius: radius.full,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4
  },
  legendSwatch: {
    width: 9,
    height: 9,
    borderRadius: radius.full
  }
});
