import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight
} from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import { Tappable } from "@/components/common/Tappable";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import type { SymptomLog } from "@/domain/entities/symptom";
import { CalendarDay } from "./CalendarDay";
import { CalendarLegend } from "./CalendarLegend";
import { getDayState } from "./dayState";
import { dayjs, toIsoDate } from "@/utils/date/dayjs";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

/** Six rows of seven — a fixed grid, so the card never changes height mid-swipe. */
const GRID_DAYS = 42;

type MonthCalendarProps = {
  month?: string;
  cycles: Cycle[];
  symptoms?: SymptomLog[];
  prediction: CyclePrediction;
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

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
  // Months arrive from the side they were sent towards, so paging back reads as
  // going back rather than as another step forward.
  const [goingBack, setGoingBack] = useState(false);

  const gridStart = visibleMonth.startOf("week");
  const today = toIsoDate(new Date());

  const days = useMemo(
    () => Array.from({ length: GRID_DAYS }, (_, index) => gridStart.add(index, "day")),
    [gridStart]
  );

  const step = useCallback((delta: number) => {
    Haptics.selectionAsync().catch(() => {});
    setGoingBack(delta < 0);
    setVisibleMonth((current) => current.add(delta, "month"));
  }, []);

  // Paging a calendar by swiping is the gesture people try first. The activation
  // offset keeps it from stealing vertical scrolls of the page underneath.
  const swipe = Gesture.Pan()
    .activeOffsetX([-24, 24])
    .failOffsetY([-14, 14])
    .onEnd((event) => {
      "worklet";
      if (event.translationX < -48) {
        runOnJS(step)(1);
      } else if (event.translationX > 48) {
        runOnJS(step)(-1);
      }
    });

  const entering = goingBack ? SlideInLeft : SlideInRight;
  const exiting = goingBack ? SlideOutRight : SlideOutLeft;

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
          {(
            [
              ["chevron-back", -1],
              ["chevron-forward", 1]
            ] as const
          ).map(([icon, delta]) => (
            <Tappable
              key={icon}
              dense
              haptic="none"
              accessibilityRole="button"
              accessibilityLabel={delta < 0 ? "Previous month" : "Next month"}
              hitSlop={6}
              onPress={() => step(delta)}
              pressedColor={colors.surfaceMuted}
              style={[
                styles.monthButton,
                { backgroundColor: colors.surfaceMuted, borderColor: colors.border }
              ]}
            >
              <Ionicons name={icon} size={17} color={colors.textPrimary} />
            </Tappable>
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

      <GestureDetector gesture={swipe}>
        {/*
          The clip is what makes the slide read as paging: without it the
          outgoing month is visible travelling across the rest of the screen.
        */}
        <View style={styles.viewport}>
          <Animated.View
            key={visibleMonth.format("YYYY-MM")}
            entering={reduceMotion ? undefined : entering.duration(motion.duration.base)}
            exiting={reduceMotion ? undefined : exiting.duration(motion.duration.quick)}
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
        </View>
      </GestureDetector>

      <CalendarLegend />
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
  viewport: {
    overflow: "hidden"
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap"
  }
});
