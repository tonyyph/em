import { useCallback, useState } from "react";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
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
import { MetricCard } from "@/components/common/MetricCard";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { CycleAtlas } from "@/components/cycle/CycleAtlas";
import { InsightBlock } from "@/components/data/InsightBlock";
import { PhaseTimeline } from "@/components/data/PhaseTimeline";
import { getCurrentPhase } from "@/design/phase";
import { useTheme } from "@/design/theme";
import { phaseMeta, spacing } from "@/design/tokens";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { useAppStore } from "@/store/appStore";
import { describeCountdown, describeNextPeriod } from "@/utils/format/prediction";
import { dayjs } from "@/utils/date/dayjs";

/** What the explanation sheet is currently showing. */
type Explainer = { title: string; body: string };

export default function TodayScreen() {
  const { colors } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction, selectedCycleDay } = useCyclePredictions();

  const { ref: sheetRef, open: openSheet } = useAppSheet();
  const [explainer, setExplainer] = useState<Explainer | null>(null);

  // One sheet serves every "why does it say that" on the screen. Separate
  // sheets per card would each need their own ref and their own mounted
  // instance, for content that is never shown two at a time.
  const explain = useCallback(
    (next: Explainer) => {
      setExplainer(next);
      openSheet();
    },
    [openSheet]
  );

  const todayLogs = symptoms.filter((symptom) => symptom.date === selectedDate);
  const phase = getCurrentPhase(
    selectedDate,
    cycles,
    prediction,
    prediction.averagePeriodLength
  );
  const nextPeriod = describeNextPeriod(prediction);
  const recordedCycles = Math.max(cycles.length - 1, 0);

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Ẽm atlas"
          title="Your body, today"
          subtitle="A calm read on your cycle signals, without pretending estimates are certainty."
        />
      </Reveal>

      <Reveal index={1}>
        <CycleAtlas
          date={selectedDate}
          cycles={cycles}
          prediction={prediction}
          cycleDay={selectedCycleDay}
          onPressPhase={() =>
            explain({ title: phaseMeta[phase].label, body: phaseMeta[phase].description })
          }
        />
      </Reveal>

      <Reveal index={2} style={styles.actionRow}>
        <Link href={`/cycle/${selectedDate}`} asChild>
          <Button icon="create-outline" style={styles.logButton}>
            Log today
          </Button>
        </Link>
        <ConfidenceBadge
          confidence={prediction.confidence}
          onPress={() =>
            explain({
              title: getConfidenceLabel(prediction.confidence),
              body: getConfidenceExplanation(prediction.confidence)
            })
          }
        />
      </Reveal>

      <Reveal index={3}>
        <Section
          title="The next few days"
          description={
            prediction.nextPeriodRange
              ? "Your recent cycles vary enough that a single date would overstate what Ẽm knows, so this shows a span."
              : "Predictions sharpen as your history grows."
          }
        >
          <View style={styles.metrics}>
            <MetricCard
              label="Next period"
              value={nextPeriod.value}
              qualifier={nextPeriod.qualifier}
              detail={describeCountdown(prediction.nextPeriodStart)}
              phase="menstrual"
              icon="water-outline"
              onPress={() =>
                explain({
                  title: "How this date is worked out",
                  body: `Ẽm averages the length of your last ${recordedCycles} recorded cycle${
                    recordedCycles === 1 ? "" : "s"
                  } and counts forward from the start of the most recent one. It is arithmetic on your own history, not a model of your body — a cycle that runs long or short will move this date.`
                })
              }
            />
            <MetricCard
              label="Ovulation"
              value={dayjs(prediction.ovulationDay).format("MMM D")}
              qualifier="estimate"
              detail={describeCountdown(prediction.ovulationDay)}
              phase="ovulation"
              icon="sunny-outline"
              onPress={() =>
                explain({
                  title: "How this date is worked out",
                  body: "Ovulation is placed roughly fourteen days before the next expected period, which is the average across populations rather than a measurement of you. Logging LH tests, basal temperature or cervical mucus is what would turn this from an average into something personal."
                })
              }
            />
          </View>
        </Section>
      </Reveal>

      <Reveal index={4}>
        <Section title="Rhythm map">
          <PhaseTimeline active={phase} />
        </Section>
      </Reveal>

      <Reveal index={5}>
        <Section title="Today's useful note">
          <InsightBlock
            label="Pattern insight"
            signal={
              prediction.confidence === "high"
                ? "strong"
                : prediction.confidence === "medium"
                  ? "moderate"
                  : "early"
            }
            title={
              todayLogs.length > 0
                ? `${todayLogs.length} signal${todayLogs.length > 1 ? "s" : ""} logged today`
                : "A short log is enough"
            }
            body={
              todayLogs.length > 0
                ? "Saved locally on this device. Repeated logs around the same cycle day are what turn into pattern summaries."
                : "Start with flow, mood, or one body signal. Ẽm gets more personal without asking for a full diary."
            }
            detail={
              todayLogs.length > 0
                ? "A pattern needs the same signal to show up around the same cycle day across several cycles. One entry is a data point; three cycles of them is a pattern Ẽm can name."
                : "Logging nothing is a valid day. Ẽm will not treat a gap as a signal, and it will not nag — the predictions simply stay as wide as the evidence warrants."
            }
          />
          <InfoBanner
            title="Fertility estimates are not contraception"
            body="Ẽm can explain timing signals, but it should not be your only method for avoiding pregnancy."
            tone="warning"
          />
        </Section>
      </Reveal>

      <Reveal index={6}>
        <AppText
          variant="caption"
          color="textMuted"
          style={[styles.footnote, { borderTopColor: colors.separator }]}
        >
          Estimates are based on {recordedCycles} recorded cycle
          {recordedCycles === 1 ? "" : "s"}.
        </AppText>
      </Reveal>

      <AppSheet ref={sheetRef} title={explainer?.title}>
        <AppText variant="body" color="textSecondary">
          {explainer?.body}
        </AppText>
      </AppSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    marginTop: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  logButton: {
    flex: 1
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  footnote: {
    marginTop: spacing.xxl,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth
  }
});
