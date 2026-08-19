import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, { FadeIn } from "react-native-reanimated";
import { MonthCalendar } from "@/components/calendar/MonthCalendar";
import { accessibilityFor, getDayState } from "@/components/calendar/dayState";
import { AppHeader } from "@/components/common/AppHeader";
import { AppSheet, useAppSheet } from "@/components/common/AppSheet";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import {
  ConfidenceBadge,
  getConfidenceExplanation,
  getConfidenceLabel
} from "@/components/common/ConfidenceBadge";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { Tappable } from "@/components/common/Tappable";
import { getCurrentPhase } from "@/design/phase";
import { useTheme } from "@/design/theme";
import { motion, phaseMeta, radius, spacing } from "@/design/tokens";
import { symptomCatalog } from "@/domain/entities/symptom";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { useAppStore } from "@/store/appStore";
import { dayjs } from "@/utils/date/dayjs";
import { describeNextPeriod } from "@/utils/format/prediction";

export default function CalendarScreen() {
  const { colors, elevation, reduceMotion } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const setSelectedDate = useAppStore((state) => state.setSelectedDate);
  const { prediction } = useCyclePredictions();

  const { ref: daySheetRef, open: openDaySheet } = useAppSheet();
  const { ref: confidenceSheetRef, open: openConfidenceSheet } = useAppSheet();

  const selectedPhase = getCurrentPhase(
    selectedDate,
    cycles,
    prediction,
    prediction.averagePeriodLength
  );
  const selectedLogs = symptoms.filter((symptom) => symptom.date === selectedDate);
  const selectedState = getDayState(selectedDate, cycles, symptoms, prediction);
  const nextPeriod = describeNextPeriod(prediction);

  const labelFor = (type: string) =>
    symptomCatalog.find((entry) => entry.type === type)?.label ?? type;

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Cycle history"
          title="Calendar"
          subtitle="Recorded days and estimated days are drawn differently, so uncertainty stays visible."
        />
      </Reveal>

      <Reveal index={1}>
        <MonthCalendar
          cycles={cycles}
          symptoms={symptoms}
          prediction={prediction}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      </Reveal>

      <Reveal index={2}>
        <Section
          title="Selected day"
          action={
            <ConfidenceBadge
              confidence={prediction.confidence}
              compact
              onPress={openConfidenceSheet}
            />
          }
        >
          <Tappable
            dense
            haptic="light"
            scale={0.99}
            onPress={openDaySheet}
            accessibilityRole="button"
            accessibilityLabel={accessibilityFor(selectedDate, selectedState)}
            accessibilityHint="Opens everything recorded and estimated for this day"
            style={[
              styles.dayPanel,
              elevation.lifted,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            {/*
              Keyed on the date so the panel re-enters when a different day is
              picked. Without it the text swaps in place and the calendar gives
              no sign that the tap did anything.
            */}
            <Animated.View
              key={selectedDate}
              entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}
              style={styles.dayCopy}
            >
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
            </Animated.View>

            <Link href={`/cycle/${selectedDate}`} asChild>
              <Tappable
                dense
                haptic="light"
                accessibilityRole="button"
                accessibilityLabel={`Log ${dayjs(selectedDate).format("MMMM D")}`}
                // Flattened: `Link asChild` passes this to <Slot>, which
                // rejects an array of styles on its child.
                style={StyleSheet.flatten([
                  styles.iconAction,
                  { backgroundColor: colors.brandAction }
                ])}
              >
                <Ionicons name="add" size={24} color={colors.textOnAction} />
              </Tappable>
            </Link>
          </Tappable>
        </Section>
      </Reveal>

      {prediction.nextPeriodRange ? (
        <Reveal index={3}>
          <InfoBanner
            title={`Next period somewhere in ${nextPeriod.value}`}
            body={`Recent cycles vary by about ${prediction.irregularityDays} days, so the calendar shades a span rather than marking one date.`}
          />
        </Reveal>
      ) : null}

      <AppSheet
        ref={daySheetRef}
        title={dayjs(selectedDate).format("dddd, MMMM D")}
        subtitle={phaseMeta[selectedPhase].label}
      >
        <View style={styles.sheetSection}>
          <AppText variant="eyebrow" color="textMuted">
            What Ẽm knows
          </AppText>
          {/*
            Recorded facts are listed before estimates, and estimates are
            labelled as such. The sheet is the one place the two sit side by
            side, so the distinction has to survive being read aloud.
          */}
          <View style={styles.factList}>
            {selectedState.loggedPeriod ? (
              <Fact tone={colors.phases.menstrual} text="Period logged — recorded, not estimated" />
            ) : null}
            {selectedState.symptom ? (
              <Fact
                tone={colors.phases.wellness}
                text={`${selectedLogs.length} signal${selectedLogs.length > 1 ? "s" : ""} logged`}
              />
            ) : null}
            {selectedState.ovulation ? (
              <Fact tone={colors.phases.ovulation} text="Estimated ovulation — a prediction" />
            ) : null}
            {selectedState.fertile && !selectedState.ovulation ? (
              <Fact tone={colors.phases.fertile} text="Inside the estimated fertile window" />
            ) : null}
            {selectedState.predictedPeriod ? (
              <Fact tone={colors.phasePredicted} text="Predicted period — an estimate" />
            ) : null}
            {selectedState.predictedRange && !selectedState.predictedPeriod ? (
              <Fact
                tone={colors.textMuted}
                text="Possible period — your cycles vary enough that this is a span"
              />
            ) : null}
            {!selectedState.loggedPeriod &&
            !selectedState.symptom &&
            !selectedState.ovulation &&
            !selectedState.fertile &&
            !selectedState.predictedPeriod &&
            !selectedState.predictedRange ? (
              <AppText variant="supporting" color="textSecondary">
                Nothing recorded and nothing predicted for this day.
              </AppText>
            ) : null}
          </View>
        </View>

        {selectedLogs.length > 0 ? (
          <View style={styles.sheetSection}>
            <AppText variant="eyebrow" color="textMuted">
              Logged
            </AppText>
            <View style={styles.factList}>
              {selectedLogs.map((log) => (
                <AppText key={log.id} variant="supporting" color="textSecondary">
                  {labelFor(log.type)} · {log.severity}
                </AppText>
              ))}
            </View>
          </View>
        ) : null}

        <Link href={`/cycle/${selectedDate}`} asChild>
          <Button icon="create-outline">Log this day</Button>
        </Link>
      </AppSheet>

      <AppSheet
        ref={confidenceSheetRef}
        title={getConfidenceLabel(prediction.confidence)}
      >
        <AppText variant="body" color="textSecondary">
          {getConfidenceExplanation(prediction.confidence)}
        </AppText>
      </AppSheet>
    </Screen>
  );
}

/** One line of the day sheet, with the colour that draws it on the calendar. */
function Fact({ tone, text }: { tone: string; text: string }) {
  return (
    <View style={styles.fact}>
      <View style={[styles.factSwatch, { backgroundColor: tone }]} />
      <AppText variant="supporting" color="textSecondary" style={styles.factText}>
        {text}
      </AppText>
    </View>
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
  },
  sheetSection: {
    marginBottom: spacing.lg
  },
  factList: {
    gap: spacing.xs,
    marginTop: spacing.xs
  },
  fact: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs
  },
  factSwatch: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    marginTop: 7
  },
  factText: {
    flex: 1
  }
});
