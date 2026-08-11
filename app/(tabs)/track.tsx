import { Link } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";
import { findSymptom, symptomCatalog } from "@/domain/entities/symptom";
import type { SymptomType } from "@/domain/entities/symptom";
import { useOvulation } from "@/hooks/useOvulation";
import { useAppStore } from "@/store/appStore";
import { dayjs } from "@/utils/date/dayjs";

/** The signals people reach for most often, promoted out of the full catalog. */
const QUICK_TYPES: SymptomType[] = [
  "cramps",
  "fatigue",
  "headache",
  "bloating",
  "happy",
  "irritable",
  "sleep",
  "exercise"
];

export default function TrackScreen() {
  const { colors, elevation } = useTheme();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const symptoms = useAppStore((state) => state.symptoms);
  const upsertSymptom = useAppStore((state) => state.upsertSymptom);
  const removeSymptom = useAppStore((state) => state.removeSymptom);
  const { prediction } = useOvulation();

  const todayLogs = symptoms.filter((symptom) => symptom.date === selectedDate);
  const loggedTypes = new Set(todayLogs.map((symptom) => symptom.type));

  // One tap writes; a second tap takes it back. Anything logged from here is
  // recorded as mild, and the full modal is where severity gets refined.
  const quickToggle = (type: SymptomType) => {
    Haptics.selectionAsync().catch(() => {});
    const existing = todayLogs.find((symptom) => symptom.type === type);
    if (existing) {
      removeSymptom(existing.id);
      return;
    }
    const entry = findSymptom(type);
    const now = new Date().toISOString();
    upsertSymptom({
      id: `symptom-${selectedDate}-${type}`,
      date: selectedDate,
      type,
      category: entry?.category ?? "physical",
      severity: "mild",
      createdAt: now,
      updatedAt: now
    });
  };

  return (
    <Screen>
      <AppHeader
        eyebrow="Daily log"
        title="Log gently"
        subtitle="One honest signal beats a rushed full form."
      />

      <Link href={`/cycle/${selectedDate}`} asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open the full log for ${dayjs(selectedDate).format("MMMM D")}`}
          style={({ pressed }) => [
            styles.hero,
            elevation.raised,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.9 : 1
            }
          ]}
        >
          <View style={[styles.heroIcon, { backgroundColor: colors.brandActionSoft }]}>
            <Ionicons name="pulse-outline" size={22} color={colors.brandAction} />
          </View>
          <View style={styles.heroCopy}>
            <AppText variant="cardTitle">Open today’s full log</AppText>
            <AppText variant="supporting" color="textSecondary" style={styles.heroBody}>
              Period, symptoms, intensity and notes for{" "}
              {dayjs(selectedDate).format("MMM D")}
            </AppText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      </Link>

      <Section
        title="Quick signals"
        description="Tap to log, tap again to undo. Saved as mild — refine intensity in the full log."
      >
        <View style={styles.chipGrid}>
          {QUICK_TYPES.map((type) => {
            const entry = findSymptom(type);
            if (!entry) {
              return null;
            }
            return (
              <Chip
                key={type}
                label={entry.label}
                icon={entry.icon as never}
                selected={loggedTypes.has(type)}
                onPress={() => quickToggle(type)}
              />
            );
          })}
        </View>
      </Section>

      <Section
        title="Fertility context"
        description="Shown for orientation only — logging is never required here."
      >
        <View style={styles.metrics}>
          <MetricCard
            label="Fertile window"
            value={dayjs(prediction.fertileWindowStart).format("MMM D")}
            qualifier="estimate"
            detail={`to ${dayjs(prediction.fertileWindowEnd).format("MMM D")}`}
            phase="fertile"
            icon="leaf-outline"
          />
          <MetricCard
            label="LH / BBT"
            value="Optional"
            detail="Not required for predictions"
            icon="flask-outline"
          />
        </View>
      </Section>

      <Section title={`Logged on ${dayjs(selectedDate).format("MMM D")}`}>
        {todayLogs.length > 0 ? (
          <View
            style={[
              styles.logList,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            {todayLogs.map((symptom, index) => {
              const entry = findSymptom(symptom.type);
              return (
                <View
                  key={symptom.id}
                  style={[
                    styles.logRow,
                    index > 0
                      ? { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.separator }
                      : undefined
                  ]}
                >
                  <Ionicons
                    name={(entry?.icon ?? "ellipse-outline") as never}
                    size={17}
                    color={colors.textSecondary}
                  />
                  <AppText variant="label" style={styles.logLabel}>
                    {entry?.label ?? symptom.type.replace(/_/g, " ")}
                  </AppText>
                  <AppText variant="caption" color="textMuted">
                    {symptom.severity}
                  </AppText>
                </View>
              );
            })}
          </View>
        ) : (
          <InfoBanner
            title="Nothing logged yet today"
            body="There is no streak to break and no form to complete. Log what is true, when it is true."
          />
        )}
      </Section>

      <AppText variant="caption" color="textMuted" style={styles.footnote}>
        {symptomCatalog.length} signals available in the full log.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center"
  },
  heroCopy: {
    flex: 1
  },
  heroBody: {
    marginTop: spacing.xxs
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  logList: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md
  },
  logRow: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  logLabel: {
    flex: 1
  },
  footnote: {
    marginTop: spacing.lg,
    textAlign: "center"
  }
});
