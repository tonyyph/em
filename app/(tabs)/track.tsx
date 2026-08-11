import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { useAppStore } from "@/store/appStore";
import { useOvulation } from "@/hooks/useOvulation";
import { symptomCatalog } from "@/domain/entities/symptom";
import { colors, radius, spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";

export default function TrackScreen() {
  const selectedDate = useAppStore((state) => state.selectedDate);
  const symptoms = useAppStore((state) => state.symptoms);
  const { prediction } = useOvulation();
  const recent = symptomCatalog.slice(0, 8);

  return (
    <Screen>
      <AppHeader
        eyebrow="Daily log"
        title="Log gently"
        subtitle="Frequent actions first, deeper details only when useful."
      />

      <Link href={`/cycle/${selectedDate}`} asChild>
        <Pressable accessibilityRole="button" style={styles.heroAction}>
          <View style={styles.heroIcon}>
            <Ionicons name="pulse-outline" size={24} color={colors.brandAction} />
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="cardTitle">Open today’s calm log</AppText>
            <AppText variant="supporting" color="textSecondary" style={styles.heroBody}>
              Flow, symptom, severity, and notes for {dayjs(selectedDate).format("MMM D")}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </Link>

      <Section title="Fertility context" description="Optional signals can improve your personal pattern over time.">
        <View style={styles.metrics}>
          <MetricCard label="Fertile window" value={dayjs(prediction.fertileWindowStart).format("MMM D")} detail={`to ${dayjs(prediction.fertileWindowEnd).format("MMM D")}`} tone="cool" />
          <MetricCard label="LH / BBT" value="Optional" detail="Not required" />
        </View>
      </Section>

      <Section title="Fast signals">
        <View style={styles.chipGrid}>
          {recent.map((symptom) => (
            <Chip key={symptom.type} label={symptom.label} />
          ))}
        </View>
      </Section>

      <Section title="Logged today">
        {symptoms.filter((symptom) => symptom.date === selectedDate).length > 0 ? (
          symptoms
            .filter((symptom) => symptom.date === selectedDate)
            .map((symptom) => (
              <View key={symptom.id} style={styles.logRow}>
                <AppText variant="label">{symptom.type.replace(/_/g, " ")}</AppText>
                <AppText variant="caption" color="textMuted">
                  {symptom.severity}
                </AppText>
              </View>
            ))
        ) : (
          <InfoBanner title="No pressure to complete everything" body="One honest signal is more useful than a rushed full form." />
        )}
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heroAction: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceWarm,
    alignItems: "center",
    justifyContent: "center"
  },
  heroCopy: {
    flex: 1
  },
  heroBody: {
    marginTop: spacing.xxs
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.md
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  logRow: {
    minHeight: 52,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  }
});
