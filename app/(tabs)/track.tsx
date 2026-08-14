import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "expo-router";
import { StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  SlideInLeft
} from "react-native-reanimated";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { MetricCard } from "@/components/common/MetricCard";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { Tappable } from "@/components/common/Tappable";
import { asIconName } from "@/components/common/icon";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";
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

/** How long the "saved" acknowledgement stays before it clears itself. */
const ACK_DURATION = 2200;

export default function TrackScreen() {
  const { colors, elevation, reduceMotion } = useTheme();
  const selectedDate = useAppStore((state) => state.selectedDate);
  const symptoms = useAppStore((state) => state.symptoms);
  const upsertSymptom = useAppStore((state) => state.upsertSymptom);
  const removeSymptom = useAppStore((state) => state.removeSymptom);
  const { prediction } = useOvulation();

  const todayLogs = symptoms.filter((symptom) => symptom.date === selectedDate);
  const loggedTypes = new Set(todayLogs.map((symptom) => symptom.type));

  /**
   * The confirmation moment.
   *
   * Logging previously wrote to the store and looked identical either way, so
   * the only way to know it worked was to go looking for the row. This says so
   * once and then gets out of the way — a persistent banner would turn a
   * low-stakes daily action into something that needs dismissing.
   */
  const [acknowledgement, setAcknowledgement] = useState<string | null>(null);
  const ackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const acknowledge = useCallback((message: string) => {
    setAcknowledgement(message);
    if (ackTimer.current) {
      clearTimeout(ackTimer.current);
    }
    ackTimer.current = setTimeout(() => setAcknowledgement(null), ACK_DURATION);
  }, []);

  // Without this a log fired just before leaving the screen would set state on
  // an unmounted component when its timer came due.
  useEffect(
    () => () => {
      if (ackTimer.current) {
        clearTimeout(ackTimer.current);
      }
    },
    []
  );

  // One tap writes; a second tap takes it back. Anything logged from here is
  // recorded as mild, and the full modal is where severity gets refined.
  const quickToggle = (type: SymptomType) => {
    const existing = todayLogs.find((symptom) => symptom.type === type);
    const entry = findSymptom(type);

    if (existing) {
      Haptics.selectionAsync().catch(() => {});
      removeSymptom(existing.id);
      acknowledge(`${entry?.label ?? type} removed`);
      return;
    }

    // A write gets a firmer tap than an undo — the weight matches the
    // consequence, which is the rule the whole touch system follows.
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
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
    acknowledge(`${entry?.label ?? type} saved to ${dayjs(selectedDate).format("MMM D")}`);
  };

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Daily log"
          title="Log gently"
          subtitle="One honest signal beats a rushed full form."
        />
      </Reveal>

      <Reveal index={1}>
        <Link href={`/cycle/${selectedDate}`} asChild>
          <Tappable
            dense
            haptic="light"
            scale={0.99}
            accessibilityRole="button"
            accessibilityLabel={`Open the full log for ${dayjs(selectedDate).format("MMMM D")}`}
            style={[
              styles.hero,
              elevation.lifted,
              { backgroundColor: colors.surface, borderColor: colors.border }
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
          </Tappable>
        </Link>
      </Reveal>

      <Reveal index={2}>
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
                  icon={asIconName(entry.icon)}
                  selected={loggedTypes.has(type)}
                  onPress={() => quickToggle(type)}
                />
              );
            })}
          </View>

          {acknowledgement ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.quick)}
              exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.base)}
              style={[styles.ack, { backgroundColor: colors.bannerSuccess }]}
            >
              <Ionicons name="checkmark-circle" size={15} color={colors.success} />
              <AppText variant="caption" style={{ color: colors.success }}>
                {acknowledgement}
              </AppText>
            </Animated.View>
          ) : null}
        </Section>
      </Reveal>

      <Reveal index={3}>
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
      </Reveal>

      <Reveal index={4}>
        <Section title={`Logged on ${dayjs(selectedDate).format("MMM D")}`}>
          {todayLogs.length > 0 ? (
            <Animated.View
              layout={reduceMotion ? undefined : LinearTransition}
              style={[
                styles.logList,
                { backgroundColor: colors.surface, borderColor: colors.border }
              ]}
            >
              {todayLogs.map((symptom, index) => {
                const entry = findSymptom(symptom.type);
                return (
                  // Rows arrive and leave rather than appearing and vanishing,
                  // so the list visibly answers the chip that was just tapped.
                  <Animated.View
                    key={symptom.id}
                    layout={reduceMotion ? undefined : LinearTransition}
                    entering={
                      reduceMotion ? undefined : SlideInLeft.duration(motion.duration.base)
                    }
                    exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.quick)}
                  >
                    <Tappable
                      dense
                      haptic="selection"
                      accessibilityRole="button"
                      accessibilityLabel={`Remove ${entry?.label ?? symptom.type}`}
                      onPress={() => {
                        removeSymptom(symptom.id);
                        acknowledge(`${entry?.label ?? symptom.type} removed`);
                      }}
                      style={[
                        styles.logRow,
                        index > 0
                          ? {
                              borderTopWidth: StyleSheet.hairlineWidth,
                              borderTopColor: colors.separator
                            }
                          : undefined
                      ]}
                    >
                      <Ionicons
                        name={asIconName(entry?.icon ?? "ellipse-outline")}
                        size={17}
                        color={colors.textSecondary}
                      />
                      <AppText variant="label" style={styles.logLabel}>
                        {entry?.label ?? symptom.type.replace(/_/g, " ")}
                      </AppText>
                      <AppText variant="caption" color="textMuted">
                        {symptom.severity}
                      </AppText>
                      <Ionicons name="close" size={15} color={colors.textMuted} />
                    </Tappable>
                  </Animated.View>
                );
              })}
            </Animated.View>
          ) : (
            <InfoBanner
              title="Nothing logged yet today"
              body="There is no streak to break and no form to complete. Log what is true, when it is true."
            />
          )}
        </Section>
      </Reveal>

      <Reveal index={5}>
        <AppText variant="caption" color="textMuted" style={styles.footnote}>
          {symptomCatalog.length} signals available in the full log.
        </AppText>
      </Reveal>
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
  ack: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xxs,
    marginTop: spacing.sm,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6
  },
  metrics: {
    flexDirection: "row",
    gap: spacing.sm
  },
  logList: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    overflow: "hidden"
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
