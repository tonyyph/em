import { useCallback, useMemo, useState } from "react";
import { StyleSheet } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { AppSheet, useAppSheet } from "@/components/common/AppSheet";
import { AppText } from "@/components/common/AppText";
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
import { InsightBlock } from "@/components/data/InsightBlock";
import { MiniTrendChart, type TrendPoint } from "@/components/data/MiniTrendChart";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useTheme } from "@/design/theme";
import { spacing } from "@/design/tokens";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { useAppStore } from "@/store/appStore";
import { getCycleLengthSeries } from "@/utils/algorithms/cyclePrediction";
import { dayjs } from "@/utils/date/dayjs";

/** Two starts make one gap, so a trend needs at least three recorded cycles. */
const MIN_CYCLES_FOR_TREND = 3;

type Explainer = { title: string; body: string };

export default function InsightsScreen() {
  const { colors } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction } = useCyclePredictions();

  const { ref: sheetRef, open: openSheet } = useAppSheet();
  const [explainer, setExplainer] = useState<Explainer | null>(null);

  const explain = useCallback(
    (next: Explainer) => {
      setExplainer(next);
      openSheet();
    },
    [openSheet]
  );

  // Derived from the same helper the prediction uses, so the chart and the
  // headline average can never disagree.
  const points = useMemo<TrendPoint[]>(
    () =>
      // The series carries each length's own start date. Indexing back into the
      // cycles instead would label every point with the wrong month as soon as
      // the history outgrew the sample window or contained one implausible gap.
      getCycleLengthSeries(cycles).map((entry) => ({
        value: entry.value,
        label: dayjs(entry.startDate).format("MMM")
      })),
    [cycles]
  );

  const hasTrend = points.length >= MIN_CYCLES_FOR_TREND - 1;

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Patterns"
          title="Insights"
          subtitle="Plain-language summaries, with the confidence shown beside every claim."
        />
      </Reveal>

      <Reveal index={1} style={styles.metrics}>
        <MetricCard
          label="Average cycle"
          value={`${prediction.averageCycleLength}d`}
          detail={getConfidenceLabel(prediction.confidence)}
          phase="luteal"
          icon="repeat-outline"
          onPress={() =>
            explain({
              title: "Average cycle length",
              body: `The mean gap between your recorded period starts, across ${points.length} measured cycle${
                points.length === 1 ? "" : "s"
              }. Recent cycles count for more than old ones, so a change in your body shows up here before it would in a plain average.`
            })
          }
        />
        <MetricCard
          label="Variation"
          value={`±${prediction.irregularityDays}d`}
          qualifier={prediction.irregularityDays >= 5 ? "irregular" : "steady"}
          detail="Standard deviation"
          phase={prediction.irregularityDays >= 5 ? "ovulation" : "follicular"}
          icon="pulse-outline"
          onPress={() =>
            explain({
              title: "Variation",
              body: "How far your cycles typically stray from their own average. Past about five days Ẽm stops naming a single predicted date and widens to a span instead — not because something is wrong, but because a single date would be claiming more than the numbers support."
            })
          }
        />
      </Reveal>

      <Reveal index={2}>
        <Section
          title="Cycle story"
          action={
            <ConfidenceBadge
              confidence={prediction.confidence}
              compact
              onPress={() =>
                explain({
                  title: getConfidenceLabel(prediction.confidence),
                  body: getConfidenceExplanation(prediction.confidence)
                })
              }
            />
          }
        >
          {hasTrend ? (
            <MiniTrendChart
              title="Cycle length over time"
              points={points}
              unit="d"
              color={colors.phases.luteal}
              band={{
                from: prediction.averageCycleLength - prediction.irregularityDays,
                to: prediction.averageCycleLength + prediction.irregularityDays,
                label: "typical range"
              }}
            />
          ) : (
            <EmptyState
              art="patterns"
              title="Not enough cycles to draw a trend"
              body={`Ẽm needs at least ${MIN_CYCLES_FOR_TREND} recorded period starts before it can compare cycle to cycle. It will not invent a line from ${points.length + 1}.`}
            />
          )}
        </Section>
      </Reveal>

      <Reveal index={3}>
        <Section title="Health notes">
          <InsightBlock
            label="Prediction transparency"
            signal={
              prediction.confidence === "high"
                ? "strong"
                : prediction.confidence === "medium"
                  ? "moderate"
                  : "early"
            }
            title={
              prediction.nextPeriodRange
                ? "Your next estimate is shown as a range"
                : "Your next estimate is based on recent starts"
            }
            body={
              prediction.nextPeriodRange
                ? `Recent cycles vary by about ${prediction.irregularityDays} days. Above that threshold Ẽm widens to a span instead of naming one day it cannot justify.`
                : "Ẽm weights recent cycles more heavily than old ones. If variation grows past five days, it switches to showing a range."
            }
            detail="Widening is not the app giving up. A span you can trust is more useful than a date you cannot, and narrowing it again takes nothing but more recorded cycles."
          />
          <InsightBlock
            label="Symptoms"
            signal={symptoms.length >= 8 ? "moderate" : "early"}
            title={
              symptoms.length >= 8
                ? "Symptom history is forming"
                : "Not enough symptom history yet"
            }
            body={`${symptoms.length} log${symptoms.length === 1 ? "" : "s"} so far. Pattern detection stays quiet until the same signal repeats around the same cycle day several times.`}
            detail="Staying quiet is deliberate. Naming a pattern from two entries would be reading noise, and a wrong pattern is worse than none — it changes what you expect of your own body."
          />
        </Section>
      </Reveal>

      <Reveal index={4}>
        <Section title="Doctor report">
          <InfoBanner
            title="PDF export is not built yet"
            body="This is designed but not implemented — it needs file generation and a share sheet before it can be switched on."
          />
        </Section>
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
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
