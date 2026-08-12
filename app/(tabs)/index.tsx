import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { ConfidenceBadge } from "@/components/common/ConfidenceBadge";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { CycleAtlas } from "@/components/cycle/CycleAtlas";
import { InsightBlock } from "@/components/data/InsightBlock";
import { PhaseTimeline } from "@/components/data/PhaseTimeline";
import { getCurrentPhase } from "@/design/phase";
import { useTheme } from "@/design/theme";
import { spacing } from "@/design/tokens";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { useAppStore } from "@/store/appStore";
import { describeCountdown, describeNextPeriod } from "@/utils/format/prediction";
import { dayjs } from "@/utils/date/dayjs";

export default function TodayScreen() {
  const { colors } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction, selectedCycleDay } = useCyclePredictions();

  const todayLogs = symptoms.filter((symptom) => symptom.date === selectedDate);
  const phase = getCurrentPhase(
    selectedDate,
    cycles,
    prediction,
    prediction.averagePeriodLength
  );
  const nextPeriod = describeNextPeriod(prediction);

  return (
    <Screen>
      <AppHeader
        eyebrow="Ẽm atlas"
        title="Your body, today"
        subtitle="A calm read on your cycle signals, without pretending estimates are certainty."
      />

      <CycleAtlas
        date={selectedDate}
        cycles={cycles}
        prediction={prediction}
        cycleDay={selectedCycleDay}
      />

      <View style={styles.actionRow}>
        <Link href={`/cycle/${selectedDate}`} asChild>
          <Button icon="create-outline" style={styles.logButton}>
            Log today
          </Button>
        </Link>
        <ConfidenceBadge confidence={prediction.confidence} />
      </View>

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
          />
          <MetricCard
            label="Ovulation"
            value={dayjs(prediction.ovulationDay).format("MMM D")}
            qualifier="estimate"
            detail={describeCountdown(prediction.ovulationDay)}
            phase="ovulation"
            icon="sunny-outline"
          />
        </View>
      </Section>

      <Section title="Rhythm map">
        <PhaseTimeline active={phase} />
      </Section>

      <Section title="Today’s useful note">
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
        />
        <InfoBanner
          title="Fertility estimates are not contraception"
          body="Ẽm can explain timing signals, but it should not be your only method for avoiding pregnancy."
          tone="warning"
        />
      </Section>

      <AppText
        variant="caption"
        color="textMuted"
        style={[styles.footnote, { borderTopColor: colors.separator }]}
      >
        Estimates are based on {Math.max(cycles.length - 1, 0)} recorded cycle
        {cycles.length - 1 === 1 ? "" : "s"}.
      </AppText>
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
