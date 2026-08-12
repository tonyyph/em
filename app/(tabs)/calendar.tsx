import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { getCurrentPhase } from "@/design/phase";
import { useTheme } from "@/design/theme";
import { phaseMeta, radius, spacing } from "@/design/tokens";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { useAppStore } from "@/store/appStore";
import { dayjs } from "@/utils/date/dayjs";
import { describeNextPeriod } from "@/utils/format/prediction";

export default function CalendarScreen() {
  const { colors, elevation } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const { prediction } = useCyclePredictions();

  const selectedPhase = getCurrentPhase(
    selectedDate,
    cycles,
    prediction,
    prediction.averagePeriodLength
  );
  const selectedLogs = symptoms.filter((symptom) => symptom.date === selectedDate);
  const nextPeriod = describeNextPeriod(prediction);

  return (
    <Screen>
      <AppHeader
        eyebrow="Cycle history"
        title="Calendar"
        subtitle="Recorded days and estimated days are drawn differently, so uncertainty stays visible."
      />

      <MonthCalendar
        cycles={cycles}
        symptoms={symptoms}
        prediction={prediction}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <Section title="Selected day" action={<ConfidenceBadge confidence={prediction.confidence} compact />}>
        <View
          style={[
            styles.dayPanel,
            elevation.raised,
            { backgroundColor: colors.surface, borderColor: colors.border }
          ]}
        >
          <View style={styles.dayCopy}>
            <View style={styles.phaseRow}>
              <View
                style={[styles.swatch, { backgroundColor: colors.phases[selectedPhase] }]}
              />
              <AppText variant="caption" color="textMuted">
                {phaseMeta[selectedPhase].label}
              </AppText>
            </View>
            <AppText variant="sectionTitle" style={styles.dayTitle}>
              {dayjs(selectedDate).format("dddd, MMM D")}
            </AppText>
            <AppText variant="supporting" color="textSecondary">
              {selectedLogs.length > 0
                ? `${selectedLogs.length} signal${selectedLogs.length > 1 ? "s" : ""} recorded. Tap to review or add more.`
                : "Nothing recorded yet. Add flow, symptoms, mood, or a note."}
            </AppText>
          </View>
          <Link href={`/cycle/${selectedDate}`} asChild>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Log ${dayjs(selectedDate).format("MMMM D")}`}
              style={({ pressed }) => [
                styles.iconAction,
                { backgroundColor: colors.brandAction, opacity: pressed ? 0.8 : 1 }
              ]}
            >
              <Ionicons name="add" size={24} color={colors.textOnAction} />
            </Pressable>
          </Link>
        </View>
      </Section>

      {prediction.nextPeriodRange ? (
        <InfoBanner
          title={`Next period somewhere in ${nextPeriod.value}`}
          body={`Recent cycles vary by about ${prediction.irregularityDays} days, so the calendar shades a span rather than marking one date.`}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  dayPanel: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  dayCopy: {
    flex: 1
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs
  },
  swatch: {
    width: 7,
    height: 7,
    borderRadius: radius.full
  },
  dayTitle: {
    marginTop: spacing.xxs,
    marginBottom: spacing.xxs
  },
  iconAction: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center"
  }
});
