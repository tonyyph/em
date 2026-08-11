import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { useAppStore } from "@/store/appStore";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { colors, radius, spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";

export default function CalendarScreen() {
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const { prediction } = useCyclePredictions();

  return (
    <Screen>
      <AppHeader
        eyebrow="Cycle history"
        title="Calendar"
        subtitle="Confirmed logs and estimates are deliberately separated so uncertainty stays visible."
      />
      <MonthCalendar
        cycles={cycles}
        symptoms={symptoms}
        prediction={prediction}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />
      <Section title="Selected day">
        <View style={styles.dayPanel}>
          <View style={styles.dayCopy}>
            <AppText variant="caption" color="textMuted">
              {dayjs(selectedDate).format("YYYY")}
            </AppText>
            <AppText variant="sectionTitle">{dayjs(selectedDate).format("dddd, MMM D")}</AppText>
            <AppText variant="supporting" color="textSecondary" style={styles.dayBody}>
              Add flow, symptoms, mood, or notes. You can edit local logs any time.
            </AppText>
          </View>
          <Link href={`/cycle/${selectedDate}`} asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Log selected day" style={styles.iconAction}>
              <Ionicons name="add" size={24} color={colors.surface} />
            </Pressable>
          </Link>
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayPanel: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  dayCopy: {
    flex: 1
  },
  dayBody: {
    marginTop: spacing.xs
  },
  iconAction: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brandAction
  }
});
