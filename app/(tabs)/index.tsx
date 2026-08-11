import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/common/Screen";
import { AppText } from "@/components/common/AppText";
import { AppHeader } from "@/components/common/AppHeader";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Section } from "@/components/common/Section";
import { CycleAtlas } from "@/components/cycle/CycleAtlas";
import { PhaseTimeline } from "@/components/data/PhaseTimeline";
import { InsightBlock } from "@/components/data/InsightBlock";
import { useAppStore } from "@/store/appStore";
import { useCyclePredictions } from "@/hooks/useCyclePredictions";
import { getConfidenceLabel } from "@/design/phase";
import { colors, radius, spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";

export default function TodayScreen() {
  const cycles = useAppStore((state) => state.cycles);
  const selectedDate = useAppStore((state) => state.selectedDate);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction, selectedCycleDay } = useCyclePredictions();
  const todayLogs = symptoms.filter((symptom) => symptom.date === selectedDate);

  return (
    <Screen>
      <AppHeader
        eyebrow="Ẽm atlas"
        title="Your body, today"
        subtitle="A calm read on your cycle signals without pretending estimates are certainty."
      />

      <CycleAtlas date={selectedDate} cycles={cycles} prediction={prediction} cycleDay={selectedCycleDay} />

      <View style={styles.primaryActionRow}>
        <Link href={`/cycle/${selectedDate}`} asChild>
          <Pressable accessibilityRole="button" style={styles.logButton}>
            <Ionicons name="create-outline" size={20} color={colors.surface} />
            <AppText variant="label" color="surface">
              Log today
            </AppText>
          </Pressable>
        </Link>
        <View style={styles.signal}>
          <AppText variant="caption" color="textMuted">
            Confidence
          </AppText>
          <AppText variant="label">{getConfidenceLabel(prediction.confidence)}</AppText>
        </View>
      </View>

      <Section title="The next few days" description="Predictions update as your history grows. Irregular cycles show wider ranges.">
        <View style={styles.metrics}>
          <MetricCard label="Next period" value={dayjs(prediction.nextPeriodStart).format("MMM D")} detail={`${prediction.averagePeriodLength}d estimate`} tone="warm" />
          <MetricCard label="Ovulation" value={dayjs(prediction.ovulationDay).format("MMM D")} detail="Estimated" tone="cool" />
        </View>
      </Section>

      <Section title="Rhythm map">
        <PhaseTimeline active={prediction.confidence === "low" ? "wellness" : "luteal"} />
      </Section>

      <Section title="Today’s useful note">
        <InsightBlock
          label="Pattern insight"
          signal={prediction.confidence === "high" ? "strong" : prediction.confidence === "medium" ? "moderate" : "early"}
          title={todayLogs.length > 0 ? `${todayLogs.length} signal logged today` : "A short log is enough"}
          body={
            todayLogs.length > 0
              ? "Your symptoms are saved locally in this prototype state and will shape pattern summaries."
              : "Start with flow, mood, or one body signal. The app becomes more personal without asking for a full diary."
          }
        />
        <InfoBanner
          title="Fertility estimates are not contraception"
          body="Ẽm can explain timing signals, but it should not be used as the only method to avoid pregnancy."
          tone="warning"
        />
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  primaryActionRow: {
    marginTop: spacing.lg,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "stretch"
  },
  logButton: {
    flex: 1.35,
    minHeight: 58,
    borderRadius: radius.lg,
    backgroundColor: colors.brandAction,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  signal: {
    flex: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    justifyContent: "center"
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  }
});
