import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import type { SymptomLog } from "@/domain/entities/symptom";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";
import { AppText } from "@/components/common/AppText";
import { colors, layout, phaseMeta, radius, spacing } from "@/design/tokens";

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
  fertile: boolean;
  ovulation: boolean;
  symptom: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const getDayState = (date: string, cycles: Cycle[], symptoms: SymptomLog[], prediction: CyclePrediction): DayState => {
  const loggedPeriod = cycles.some((cycle) => {
    const end = cycle.endDate ?? dayjs(cycle.startDate).add(4, "day").format("YYYY-MM-DD");
    return dayjs(date).isBetween(cycle.startDate, end, "day", "[]");
  });

  return {
    loggedPeriod,
    predictedPeriod: dayjs(date).isBetween(prediction.nextPeriodStart, prediction.nextPeriodEnd, "day", "[]"),
    fertile: dayjs(date).isBetween(prediction.fertileWindowStart, prediction.fertileWindowEnd, "day", "[]"),
    ovulation: date === prediction.ovulationDay,
    symptom: symptoms.some((symptom) => symptom.date === date)
  };
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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, { damping: 16, stiffness: 180 }) }]
  }));
  const markerColor = state.loggedPeriod
    ? colors.phases.menstrual
    : state.ovulation
      ? colors.phases.ovulation
      : state.fertile
        ? colors.phases.fertile
        : state.predictedPeriod
          ? "#E7B5B1"
          : "transparent";

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${dayjs(date).format("MMMM D")}${state.loggedPeriod ? ", period logged" : ""}${state.ovulation ? ", estimated ovulation" : ""}`}
      onPress={onPress}
      onPressIn={() => {
        scale.value = 0.94;
      }}
      onPressOut={() => {
        scale.value = 1;
      }}
      style={[styles.day, animatedStyle]}
    >
      <View style={[styles.dayShell, isSelected ? styles.selectedDay : undefined, isToday ? styles.todayDay : undefined]}>
        <AppText variant="label" color={isCurrentMonth ? "textPrimary" : "textMuted"}>
          {dayjs(date).date()}
        </AppText>
        <View style={styles.markerRow}>
          {markerColor !== "transparent" ? (
            <View style={[styles.primaryMarker, state.ovulation ? styles.ovulationMarker : undefined, { backgroundColor: markerColor }]} />
          ) : null}
          {state.symptom ? <View style={styles.symptomMarker} /> : null}
        </View>
      </View>
    </AnimatedPressable>
  );
}

export function MonthCalendar({ month, cycles, symptoms = [], prediction, selectedDate, onSelectDate }: MonthCalendarProps) {
  const [visibleMonth, setVisibleMonth] = useState(dayjs(month ?? selectedDate).startOf("month"));
  const gridStart = visibleMonth.startOf("week");
  const today = toIsoDate(new Date());
  const days = useMemo(() => Array.from({ length: 42 }, (_, index) => gridStart.add(index, "day")), [gridStart]);
  const selectedState = getDayState(selectedDate, cycles, symptoms, prediction);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View>
          <AppText variant="caption" color="textMuted">
            Calendar atlas
          </AppText>
          <AppText variant="sectionTitle">{visibleMonth.format("MMMM YYYY")}</AppText>
        </View>
        <View style={styles.monthActions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous month"
            hitSlop={8}
            onPress={() => setVisibleMonth((current) => current.subtract(1, "month"))}
            style={styles.monthButton}
          >
            <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next month"
            hitSlop={8}
            onPress={() => setVisibleMonth((current) => current.add(1, "month"))}
            style={styles.monthButton}
          >
            <Ionicons name="chevron-forward" size={18} color={colors.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.weekRow}>
        {["S", "M", "T", "W", "T", "F", "S"].map((item, index) => (
          <AppText key={`${item}-${index}`} variant="caption" color="textMuted" style={styles.weekLabel}>
            {item}
          </AppText>
        ))}
      </View>

      <View style={styles.grid}>
        {days.map((day) => {
          const date = toIsoDate(day);
          return (
            <CalendarDay
              key={date}
              date={date}
              isCurrentMonth={day.month() === visibleMonth.month()}
              isSelected={date === selectedDate}
              isToday={date === today}
              state={getDayState(date, cycles, symptoms, prediction)}
              onPress={() => onSelectDate(date)}
            />
          );
        })}
      </View>

      <View style={styles.detail}>
        <View style={styles.detailCopy}>
          <AppText variant="caption" color="textMuted">
            Selected day
          </AppText>
          <AppText variant="cardTitle">{dayjs(selectedDate).format("dddd, MMM D")}</AppText>
        </View>
        <View style={styles.detailTags}>
          {selectedState.loggedPeriod ? <LegendPill label="Period" color={colors.phases.menstrual} /> : null}
          {selectedState.predictedPeriod && !selectedState.loggedPeriod ? <LegendPill label="Predicted" color="#E7B5B1" /> : null}
          {selectedState.fertile ? <LegendPill label="Fertile" color={colors.phases.fertile} /> : null}
          {selectedState.ovulation ? <LegendPill label="Ovulation" color={colors.phases.ovulation} diamond /> : null}
          {!selectedState.loggedPeriod && !selectedState.predictedPeriod && !selectedState.fertile && !selectedState.ovulation ? (
            <LegendPill label="Wellness" color={colors.phases.wellness} />
          ) : null}
        </View>
      </View>

      <View style={styles.legend}>
        <LegendPill label={phaseMeta.menstrual.shortLabel} color={colors.phases.menstrual} />
        <LegendPill label="Predicted" color="#E7B5B1" />
        <LegendPill label={phaseMeta.fertile.shortLabel} color={colors.phases.fertile} />
        <LegendPill label={phaseMeta.ovulation.shortLabel} color={colors.phases.ovulation} diamond />
        <LegendPill label="Symptom" color={colors.textPrimary} outline />
      </View>
    </View>
  );
}

function LegendPill({ label, color, diamond, outline }: { label: string; color: string; diamond?: boolean; outline?: boolean }) {
  return (
    <View style={styles.legendPill}>
      <View
        style={[
          styles.legendDot,
          diamond ? styles.legendDiamond : undefined,
          outline ? styles.legendOutline : { backgroundColor: color, borderColor: color }
        ]}
      />
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md
  },
  monthActions: {
    flexDirection: "row",
    gap: spacing.xs
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted,
    alignItems: "center",
    justifyContent: "center"
  },
  weekRow: {
    flexDirection: "row",
    marginBottom: spacing.xs
  },
  weekLabel: {
    width: `${100 / 7}%`,
    textAlign: "center"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  day: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 3,
    minHeight: layout.minTouchTarget
  },
  dayShell: {
    flex: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent"
  },
  selectedDay: {
    backgroundColor: colors.backgroundMuted,
    borderColor: colors.textPrimary
  },
  todayDay: {
    borderColor: colors.focus
  },
  markerRow: {
    position: "absolute",
    bottom: 5,
    flexDirection: "row",
    gap: 3,
    alignItems: "center"
  },
  primaryMarker: {
    width: 16,
    height: 3,
    borderRadius: radius.full
  },
  ovulationMarker: {
    width: 7,
    height: 7,
    borderRadius: 1,
    transform: [{ rotate: "45deg" }]
  },
  symptomMarker: {
    width: 5,
    height: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.textPrimary
  },
  detail: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    flexDirection: "row",
    gap: spacing.md,
    justifyContent: "space-between",
    alignItems: "center"
  },
  detailCopy: {
    flex: 1
  },
  detailTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    justifyContent: "flex-end",
    flex: 1
  },
  legend: {
    marginTop: spacing.md,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  legendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundMuted
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: radius.full,
    borderWidth: 1
  },
  legendDiamond: {
    borderRadius: 1,
    transform: [{ rotate: "45deg" }]
  },
  legendOutline: {
    backgroundColor: "transparent",
    borderColor: colors.textPrimary
  }
});
