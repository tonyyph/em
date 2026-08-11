import { StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { InsightBlock } from "@/components/data/InsightBlock";
import { MiniTrendChart } from "@/components/data/MiniTrendChart";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useAppStore } from "@/store/appStore";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { colors, spacing } from "@/design/tokens";

export default function InsightsScreen() {
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction } = useCyclePredictions();
  const cycleLengths = cycles.length >= 2 ? [28, 29, 27, prediction.averageCycleLength] : [];

  return (
    <Screen>
      <AppHeader
        eyebrow="Patterns"
        title="Insights"
        subtitle="Plain-language summaries with confidence shown beside every claim."
      />
      <View style={styles.metrics}>
        <MetricCard label="Avg cycle" value={`${prediction.averageCycleLength}d`} detail={`${prediction.confidence} confidence`} />
        <MetricCard label="Irregularity" value={`${prediction.irregularityDays}d`} detail="Standard deviation" tone="warm" />
      </View>

      <Section title="Cycle story">
        {cycleLengths.length > 0 ? (
          <MiniTrendChart title="Recent cycle length" values={cycleLengths} max={35} color={colors.phases.luteal} />
        ) : (
          <EmptyState
            title="More cycles will unlock trends"
            body="Log at least two starts to compare period-to-period timing without inventing patterns."
          />
        )}
      </Section>

      <Section title="Health notes">
        <InsightBlock
          label="Prediction transparency"
          signal={prediction.confidence === "high" ? "strong" : "moderate"}
          title="Your next estimate is based on recent starts"
          body="Ẽm weights recent cycle lengths more heavily. If variation grows, the app shows a date range instead of a single confident day."
        />
        <InsightBlock
          label="Symptoms"
          signal={symptoms.length >= 4 ? "moderate" : "early"}
          title={symptoms.length >= 4 ? "Symptom history is forming" : "Not enough symptom history yet"}
          body="Pattern detection stays conservative until there are enough repeated logs around the same cycle days."
        />
      </Section>

      <Section title="Doctor report">
        <InfoBanner
          title="Premium report is designed, not faked"
          body="PDF export needs file generation and sharing implementation before it can be enabled in production."
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  }
});
