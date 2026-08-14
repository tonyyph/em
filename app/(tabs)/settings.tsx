import { useState } from "react";
import { Alert, Share, StyleSheet, View } from "react-native";
import { AppHeader } from "@/components/common/AppHeader";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { SegmentedControl } from "@/components/common/SegmentedControl";
import { CareLink } from "@/components/settings/CareLink";
import { ControlRow } from "@/components/settings/ControlRow";
import { useTheme, useThemePreference, type ThemePreference } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";
import type { HealthGoal } from "@/domain/entities/cycle";
import { authService } from "@/services/firebase/authService";
import { useAppStore } from "@/store/appStore";

const GOALS: { value: HealthGoal; label: string }[] = [
  { value: "tracking", label: "Tracking" },
  { value: "ttc", label: "Trying" },
  { value: "pregnancy", label: "Pregnancy" },
  { value: "contraception", label: "Avoiding" },
  { value: "menopause", label: "Menopause" }
];

const APPEARANCE: { value: ThemePreference; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" }
];

export default function CareScreen() {
  const { colors, elevation } = useTheme();
  const { preference, setPreference } = useThemePreference();

  const cycleConfig = useAppStore((state) => state.cycleConfig);
  const updateCycleConfig = useAppStore((state) => state.updateCycleConfig);
  const cycles = useAppStore((state) => state.cycles);
  const symptoms = useAppStore((state) => state.symptoms);
  const setCycles = useAppStore((state) => state.setCycles);
  const setSymptoms = useAppStore((state) => state.setSymptoms);

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const configured = authService.isConfigured();

  const exportData = async () => {
    const payload = JSON.stringify({ cycles, symptoms, cycleConfig }, null, 2);
    await Share.share({ message: payload, title: "Ẽm data export" });
  };

  const deleteData = () => {
    Alert.alert(
      "Delete all local data?",
      `This removes ${cycles.length} cycle${cycles.length === 1 ? "" : "s"} and ${symptoms.length} symptom log${symptoms.length === 1 ? "" : "s"} from this device. It cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setCycles([]);
            setSymptoms([]);
          }
        }
      ]
    );
  };

  return (
    <Screen>
      <Reveal index={0}>
        <AppHeader
          eyebrow="Care center"
          title="Privacy & support"
          subtitle="Health data controls are first-class here, not buried at the bottom of settings."
        />
      </Reveal>

      <Reveal index={1}>
        <InfoBanner
          title={configured ? "Cloud sync available" : "Anonymous local mode"}
          body={
            configured
              ? "Firebase credentials are present, so account actions will reach the network."
              : "No Firebase environment is configured, so everything stays on this device."
          }
        />
      </Reveal>

      <Reveal index={2}>
        <Section title="Appearance">
          <SegmentedControl value={preference} options={APPEARANCE} onChange={setPreference} />
        </Section>
      </Reveal>

      <Reveal index={3}>
        <Section
          title="Mode"
          description="Ẽm records this but does not yet change the app around it."
        >
          <View style={styles.chips}>
            {GOALS.map((goal) => (
              <Chip
                key={goal.value}
                label={goal.label}
                selected={cycleConfig.goal === goal.value}
                onPress={() => updateCycleConfig({ goal: goal.value })}
              />
            ))}
          </View>
        </Section>
      </Reveal>

      <Reveal index={4}>
        <Section title="Health data controls">
          <View
            style={[
              styles.panel,
              elevation.raised,
              { backgroundColor: colors.surface, borderColor: colors.border }
            ]}
          >
            <ControlRow
              icon="phone-portrait-outline"
              title="Anonymous mode"
              body="Data stays on this device."
              value
              unavailable="Always on — there is no sync layer to turn off yet"
            />
            <ControlRow
              icon="finger-print-outline"
              title="Biometric lock"
              body="Require Face ID or a fingerprint to open Ẽm."
              value={false}
              unavailable="Needs a native build with expo-local-authentication wired up"
            />
            <ControlRow
              last
              icon="notifications-outline"
              title="Cycle reminders"
              body="Period, fertile-window and daily-log nudges."
              value={remindersEnabled}
              onValueChange={async (next) => {
                if (!next) {
                  setRemindersEnabled(false);
                  return;
                }
                const { notificationService } = await import(
                  "@/services/notifications/notificationService"
                );
                const granted = await notificationService.requestPermissions();
                setRemindersEnabled(Boolean(granted));
              }}
            />
          </View>
        </Section>
      </Reveal>

      <Reveal index={5}>
        <Section title="Journeys">
          <View style={styles.links}>
            <CareLink
              href="/pregnancy"
              icon="heart-outline"
              title="Pregnancy mode"
              body="Week, trimester, due date and checklist."
            />
            <CareLink
              href="/ovulation"
              icon="sparkles-outline"
              title="Fertility detail"
              body="Estimated fertile window with clear safety language."
            />
            <CareLink
              href="/insights"
              icon="document-text-outline"
              title="Patterns & reports"
              body="Cycle trends, and where the doctor report will live."
            />
          </View>
        </Section>
      </Reveal>

      <Reveal index={6}>
        <Section title="Not built yet">
          <InfoBanner
            title="AI assistant is not connected"
            body="The product surface is designed, but no model is called from the app. Better an honest gap than fake medical intelligence."
            tone="warning"
          />
          <InfoBanner
            title="Premium is scoped, not sold"
            body="Detailed reports, partner sharing and advanced charts need purchase infrastructure first."
          />
        </Section>
      </Reveal>

      <Reveal index={7}>
        <Section title="Account actions">
          <View style={styles.accountGrid}>
            <Button variant="secondary" icon="download-outline" onPress={exportData}>
              Export data as JSON
            </Button>
            <Button variant="destructive" icon="trash-outline" onPress={deleteData}>
              Delete local data
            </Button>
          </View>
        </Section>
      </Reveal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs
  },
  panel: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md
  },
  links: {
    gap: spacing.sm
  },
  accountGrid: {
    gap: spacing.sm
  }
});
