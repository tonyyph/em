import { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Switch, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeOut, LinearTransition } from "react-native-reanimated";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { TextField } from "@/components/forms/TextField";
import { asIconName } from "@/components/common/icon";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";
import type { FlowIntensity } from "@/domain/entities/cycle";
import type { SymptomCategory, SymptomSeverity, SymptomType } from "@/domain/entities/symptom";
import { symptomsByCategory } from "@/domain/entities/symptom";
import { useAppStore } from "@/store/appStore";
import { flowOn, isPeriodDay } from "@/utils/algorithms/periodLog";
import { dayjs } from "@/utils/date/dayjs";

const FLOWS: { label: string; value: FlowIntensity }[] = [
  { label: "Spotting", value: "spotting" },
  { label: "Light", value: "light" },
  { label: "Medium", value: "medium" },
  { label: "Heavy", value: "heavy" }
];

const SEVERITIES: { label: string; value: SymptomSeverity }[] = [
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" }
];

// The `pregnancy` category has no catalog entries — pregnancy tracking lives on
// its own screen — so offering it here would open an empty tab.
const CATEGORIES: { label: string; value: SymptomCategory }[] = [
  { label: "Body", value: "physical" },
  { label: "Mood", value: "mental" },
  { label: "Habits", value: "behavior" }
];

export default function CycleDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { colors, reduceMotion } = useTheme();

  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const setPeriodDay = useAppStore((state) => state.setPeriodDay);
  const upsertSymptom = useAppStore((state) => state.upsertSymptom);
  const removeSymptom = useAppStore((state) => state.removeSymptom);

  const existing = useMemo(
    () => symptoms.filter((symptom) => symptom.date === date),
    [symptoms, date]
  );

  const [bleeding, setBleeding] = useState(() => isPeriodDay(cycles, date));
  const [flow, setFlow] = useState<FlowIntensity>(() => flowOn(cycles, date) ?? "medium");
  const [category, setCategory] = useState<SymptomCategory>("physical");
  const [selected, setSelected] = useState<Set<SymptomType>>(
    () => new Set(existing.map((symptom) => symptom.type))
  );
  const [severity, setSeverity] = useState<SymptomSeverity>(
    () => existing[0]?.severity ?? "mild"
  );
  const [notes, setNotes] = useState(() => existing.find((s) => s.notes)?.notes ?? "");
  const [saved, setSaved] = useState(false);

  const visible = useMemo(() => symptomsByCategory(category), [category]);

  // Leaving the screen before the confirmation finishes would otherwise fire a
  // navigation on an unmounted component.
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (dismissTimer.current) {
        clearTimeout(dismissTimer.current);
      }
    },
    []
  );

  const toggle = (type: SymptomType) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const save = () => {
    const now = new Date().toISOString();

    setPeriodDay(date, bleeding ? flow : undefined);

    // Reconcile rather than append: anything deselected since opening the
    // screen is removed, so the log reflects the final state of the form.
    for (const symptom of existing) {
      if (!selected.has(symptom.type)) {
        removeSymptom(symptom.id);
      }
    }

    for (const type of selected) {
      const entry = visible.find((item) => item.type === type);
      const previous = existing.find((symptom) => symptom.type === type);
      upsertSymptom({
        id: previous?.id ?? `symptom-${date}-${type}`,
        date,
        type,
        category: entry?.category ?? previous?.category ?? "physical",
        severity,
        notes: notes || undefined,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now
      });
    }

    // A save is the one thing on this screen that cannot be taken back by
    // tapping again, so it gets the notification haptic rather than an impact.
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setSaved(true);
    // Long enough for the confirmation to register as an answer, short enough
    // that it never feels like waiting.
    dismissTimer.current = setTimeout(() => router.back(), 520);
  };

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Daily entry"
          title={dayjs(date).format("dddd, MMM D")}
          subtitle="Log only what is true today. A short entry is more useful than a complete one."
          actionLabel="Close log"
          actionIcon="close"
          onActionPress={() => router.back()}
        />
      </Reveal>

      {saved ? (
        <Animated.View
          entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.quick)}
        >
          <InfoBanner title="Saved" body="Added to your local history." tone="success" />
        </Animated.View>
      ) : null}

      <Reveal index={1}>
        <Section
          title="Period"
          description="Only turn this on for days you actually bled — it is what every prediction is built from."
        >
          <View
            style={[
              styles.switchRow,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <View style={styles.switchCopy}>
              <AppText variant="cardTitle">Bleeding today</AppText>
              <AppText variant="caption" color="textMuted">
                {bleeding ? "Counted as a period day" : "Not a period day"}
              </AppText>
            </View>
            <Switch
              value={bleeding}
              onValueChange={(next) => {
                Haptics.selectionAsync().catch(() => {});
                setBleeding(next);
              }}
              accessibilityLabel="Bleeding today"
              trackColor={{ true: colors.brandAction, false: colors.backgroundSunken }}
              thumbColor={colors.surface}
            />
          </View>

          {/*
            The flow chips are a consequence of the switch above them, so they
            unfold from it rather than appearing fully formed — the movement is
            what ties the two together.
          */}
          {bleeding ? (
            <Animated.View
              entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}
              exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.quick)}
              style={styles.flowGrid}
            >
              {FLOWS.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  phase="menstrual"
                  selected={flow === item.value}
                  onPress={() => setFlow(item.value)}
                  style={styles.flowChip}
                />
              ))}
            </Animated.View>
          ) : null}
        </Section>
      </Reveal>

      <Reveal index={2}>
        <Section title="Symptoms" description="Pick as many as apply.">
          <SegmentedControl value={category} options={CATEGORIES} onChange={setCategory} />
          {/*
            Keyed on the category so switching tabs re-enters the grid. Without
            it the chips swap contents in place and the segmented control looks
            like it did nothing.
          */}
          <Animated.View
            key={category}
            entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}
            style={styles.symptomGrid}
          >
            {visible.map((symptom) => (
              <Chip
                key={symptom.type}
                label={symptom.label}
                icon={asIconName(symptom.icon)}
                selected={selected.has(symptom.type)}
                onPress={() => toggle(symptom.type)}
              />
            ))}
          </Animated.View>
        </Section>
      </Reveal>

      {selected.size > 0 ? (
        <Animated.View
          layout={reduceMotion ? undefined : LinearTransition}
          entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.base)}
          exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.quick)}
        >
          <Section
            title="Intensity"
            description={`Applied to all ${selected.size} selected signal${selected.size > 1 ? "s" : ""}.`}
          >
            <View style={styles.severityRow}>
              {SEVERITIES.map((item) => (
                <Chip
                  key={item.value}
                  label={item.label}
                  selected={severity === item.value}
                  onPress={() => setSeverity(item.value)}
                  style={styles.severityChip}
                />
              ))}
            </View>
          </Section>
        </Animated.View>
      ) : null}

      <Reveal index={3}>
        <Section title="Private note">
          <TextField
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            placeholder="Anything worth remembering about today"
            helper="Bring urgent symptoms to a clinician rather than storing them here."
            style={styles.notes}
          />
        </Section>
      </Reveal>

      <View style={styles.footer}>
        <Button onPress={save} icon="checkmark">
          Save daily log
        </Button>
        <AppText variant="caption" color="textMuted" style={styles.footerNote}>
          Stored on this device. Cloud sync requires Firebase configuration.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    minHeight: 64,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  switchCopy: {
    flex: 1
  },
  flowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  flowChip: {
    flexGrow: 1
  },
  symptomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md
  },
  severityRow: {
    flexDirection: "row",
    gap: spacing.xs
  },
  severityChip: {
    flex: 1
  },
  notes: {
    minHeight: 108,
    textAlignVertical: "top"
  },
  footer: {
    marginTop: spacing.xxl,
    gap: spacing.sm
  },
  footerNote: {
    textAlign: "center"
  }
});
