import { useState } from "react";
import { Alert, Pressable, Share, StyleSheet, Switch, View } from "react-native";
import { Link, type Href } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { SegmentedControl } from "@/components/common/SegmentedControl";
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

function ControlRow({
  icon,
  title,
  body,
  value,
  onValueChange,
  unavailable
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
  value: boolean;
  onValueChange?: (next: boolean) => void;
  /** Why this cannot be switched on yet. Renders instead of a live control. */
  unavailable?: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.controlRow, { borderBottomColor: colors.separator }]}>
      <Ionicons name={icon} size={21} color={colors.brandAction} />
      <View style={styles.controlCopy}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText variant="supporting" color="textSecondary">
          {body}
        </AppText>
        {unavailable ? (
          <View style={[styles.notYet, { backgroundColor: colors.surfaceMuted }]}>
            <AppText variant="caption" color="textMuted">
              {unavailable}
            </AppText>
          </View>
        ) : null}
      </View>
      {unavailable ? null : (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ true: colors.brandAction, false: colors.backgroundSunken }}
          thumbColor={colors.surface}
        />
      )}
    </View>
  );
}

function CareLink({
  href,
  icon,
  title,
  body
}: {
  href: Href;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  const { colors } = useTheme();

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.careLink,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            opacity: pressed ? 0.9 : 1
          }
        ]}
      >
        <View style={[styles.linkIcon, { backgroundColor: colors.brandActionSoft }]}>
          <Ionicons name={icon} size={19} color={colors.brandAction} />
        </View>
        <View style={styles.controlCopy}>
          <AppText variant="cardTitle">{title}</AppText>
          <AppText variant="supporting" color="textSecondary">
            {body}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </Link>
  );
}

export default function CareScreen() {
  const { colors } = useTheme();
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
      <AppHeader
        eyebrow="Care center"
        title="Privacy & support"
        subtitle="Health data controls are first-class here, not buried at the bottom of settings."
      />

      <InfoBanner
        title={configured ? "Cloud sync available" : "Anonymous local mode"}
        body={
          configured
            ? "Firebase credentials are present, so account actions will reach the network."
            : "No Firebase environment is configured, so everything stays on this device."
        }
      />

      <Section title="Appearance">
        <SegmentedControl
          value={preference}
          options={APPEARANCE}
          onChange={setPreference}
        />
      </Section>

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

      <Section title="Health data controls">
        <View
          style={[styles.panel, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
  controlRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: spacing.md
  },
  controlCopy: {
    flex: 1
  },
  notYet: {
    alignSelf: "flex-start",
    borderRadius: radius.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    marginTop: spacing.xs
  },
  links: {
    gap: spacing.sm
  },
  careLink: {
    minHeight: 76,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center"
  },
  accountGrid: {
    gap: spacing.sm
  }
});
