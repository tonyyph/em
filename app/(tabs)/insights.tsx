import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { ConfidenceBadge, getConfidenceLabel } from "@/components/common/ConfidenceBadge";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { InsightBlock } from "@/components/data/InsightBlock";
import { MiniTrendChart, type TrendPoint } from "@/components/data/MiniTrendChart";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useTheme } from "@/design/theme";
import { spacing } from "@/design/tokens";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { useAppStore } from "@/store/appStore";
import { getCycleLengths, sortCyclesByStartDate } from "@/utils/algorithms/cyclePrediction";
import { dayjs } from "@/utils/date/dayjs";

/** Two starts make one gap, so a trend needs at least three recorded cycles. */
const MIN_CYCLES_FOR_TREND = 3;

export default function InsightsScreen() {
  const { colors } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction } = useCyclePredictions();

  // Derived from the same helper the prediction uses, so the chart and the
  // headline average can never disagree.
  const points = useMemo<TrendPoint[]>(() => {
    const sorted = sortCyclesByStartDate(cycles);
    const lengths = getCycleLengths(sorted);
    return lengths.map((value, index) => ({
      value,
      label: dayjs(sorted[index + 1]?.startDate ?? sorted[index].startDate).format("MMM")
    }));
  }, [cycles]);

  const hasTrend = points.length >= MIN_CYCLES_FOR_TREND - 1;

  return (
    <Screen>
      <AppHeader
        eyebrow="Patterns"
        title="Insights"
        subtitle="Plain-language summaries, with the confidence shown beside every claim."
      />

      <View style={styles.metrics}>
        <MetricCard
          label="Average cycle"
          value={`${prediction.averageCycleLength}d`}
          detail={getConfidenceLabel(prediction.confidence)}
          phase="luteal"
          icon="repeat-outline"
        />
        <MetricCard
          label="Variation"
          value={`±${prediction.irregularityDays}d`}
          qualifier={prediction.irregularityDays >= 5 ? "irregular" : "steady"}
          detail="Standard deviation"
          phase={prediction.irregularityDays >= 5 ? "ovulation" : "follicular"}
          icon="pulse-outline"
        />
      </View>

      <Section
        title="Cycle story"
        action={<ConfidenceBadge confidence={prediction.confidence} compact />}
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
            icon="analytics-outline"
            title="Not enough cycles to draw a trend"
            body={`Ẽm needs at least ${MIN_CYCLES_FOR_TREND} recorded period starts before it can compare cycle to cycle. It will not invent a line from ${points.length + 1}.`}
          />
        )}
      </Section>

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
        />
      </Section>

      <Section title="Doctor report">
        <InfoBanner
          title="PDF export is not built yet"
          body="This is designed but not implemented — it needs file generation and a share sheet before it can be switched on."
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  }
});
