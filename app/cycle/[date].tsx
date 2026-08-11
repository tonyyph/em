import { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { TextField } from "@/components/forms/TextField";
import type { FlowIntensity } from "@/domain/entities/cycle";
import type { SymptomCategory, SymptomSeverity } from "@/domain/entities/symptom";
import { symptomCatalog } from "@/domain/entities/symptom";
import { useAppStore } from "@/store/appStore";
import { colors, radius, spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";

const flows: { label: string; value: FlowIntensity; detail: string }[] = [
  { label: "Spotting", value: "spotting", detail: "Trace" },
  { label: "Light", value: "light", detail: "Manageable" },
  { label: "Medium", value: "medium", detail: "Typical" },
  { label: "Heavy", value: "heavy", detail: "Noticeable" }
];
const severities: { label: string; value: SymptomSeverity }[] = [
  { label: "Mild", value: "mild" },
  { label: "Moderate", value: "moderate" },
  { label: "Severe", value: "severe" }
];
const categories: { label: string; value: SymptomCategory }[] = [
  { label: "Body", value: "physical" },
  { label: "Mood", value: "mental" },
  { label: "Habits", value: "behavior" },
  { label: "Pregnancy", value: "pregnancy" }
];

export default function CycleDetailScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const upsertCycle = useAppStore((state) => state.upsertCycle);
  const upsertSymptom = useAppStore((state) => state.upsertSymptom);
  const [flow, setFlow] = useState<FlowIntensity>("medium");
  const [severity, setSeverity] = useState<SymptomSeverity>("mild");
  const [category, setCategory] = useState<SymptomCategory>("physical");
  const [selectedSymptomType, setSelectedSymptomType] = useState(symptomCatalog[0].type);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);
  const selectedSymptom = symptomCatalog.find((symptom) => symptom.type === selectedSymptomType) ?? symptomCatalog[0];
  const filteredSymptoms = useMemo(
    () => symptomCatalog.filter((symptom) => symptom.category === category),
    [category]
  );

  const save = () => {
    const now = new Date().toISOString();
    upsertCycle({
      id: `local-cycle-${date}`,
      startDate: date,
      endDate: date,
      flow,
      notes,
      createdAt: now,
      updatedAt: now
    });
    upsertSymptom({
      id: `local-symptom-${date}-${selectedSymptom.type}`,
      date,
      type: selectedSymptom.type,
      category: selectedSymptom.category,
      severity,
      notes,
      createdAt: now,
      updatedAt: now
    });
    setSaved(true);
    setTimeout(() => router.back(), 420);
  };

  return (
    <Screen>
      <AppHeader
        eyebrow="Daily entry"
        title={dayjs(date).format("MMM D")}
        subtitle="A compact log that respects your time and preserves context."
        actionLabel="Close log"
        actionIcon="close"
        onActionPress={() => router.back()}
      />

      {saved ? <InfoBanner title="Saved" body="Your log has been added to the local cycle history." tone="success" /> : null}

      <Section title="Flow" description="Choose the closest match. You can edit later.">
        <View style={styles.flowGrid}>
          {flows.map((item) => {
            const selected = flow === item.value;
            return (
              <Button key={item.value} variant={selected ? "primary" : "secondary"} onPress={() => setFlow(item.value)} style={styles.flowButton}>
                {item.label}
              </Button>
            );
          })}
        </View>
      </Section>

      <Section title="Symptoms" description="Progressive groups prevent an endless wall of chips.">
        <SegmentedControl value={category} options={categories} onChange={setCategory} />
        <View style={styles.symptomGrid}>
          {filteredSymptoms.map((symptom) => (
            <Chip
              key={symptom.type}
              label={symptom.label}
              selected={selectedSymptom.type === symptom.type}
              onPress={() => setSelectedSymptomType(symptom.type)}
              style={styles.symptomChip}
            />
          ))}
        </View>
      </Section>

      <Section title="Intensity">
        <View style={styles.severityRow}>
          {severities.map((item) => (
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

      <Section title="Private note">
        <TextField
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          helper="Avoid storing emergency or diagnostic details here. Bring urgent symptoms to a clinician."
          style={styles.notes}
        />
      </Section>

      <View style={styles.footer}>
        <Button onPress={save}>Save daily log</Button>
        <AppText variant="caption" color="textMuted" style={styles.footerNote}>
          Data is local in anonymous mode. Cloud sync requires Firebase configuration.
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flowGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  flowButton: {
    width: "47%"
  },
  symptomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.md
  },
  symptomChip: {
    marginBottom: spacing.xs
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
    textAlignVertical: "top",
    borderColor: colors.border,
    borderRadius: radius.lg
  },
  footer: {
    marginTop: spacing.xl,
    gap: spacing.sm
  },
  footerNote: {
    textAlign: "center"
  }
});
