import { Link, type Href } from "expo-router";
import { Pressable, StyleSheet, Switch, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppHeader } from "@/components/common/AppHeader";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Screen } from "@/components/common/Screen";
import { Section } from "@/components/common/Section";
import { useAppStore } from "@/store/appStore";
import { authService } from "@/services/firebase/authService";
import { colors, radius, spacing } from "@/design/tokens";

export default function CareScreen() {
  const cycleConfig = useAppStore((state) => state.cycleConfig);
  const updateCycleConfig = useAppStore((state) => state.updateCycleConfig);

  return (
    <Screen>
      <AppHeader eyebrow="Care center" title="Privacy & support" subtitle="Health data controls are first-class, not buried at the bottom of settings." />
      <InfoBanner
        title={authService.isConfigured() ? "Cloud sync available" : "Anonymous local mode"}
        body={authService.isConfigured() ? "Firebase credentials are present. Use account actions carefully." : "No Firebase env is configured, so account and cloud sync actions stay unavailable."}
      />

      <Section title="Mode">
        <View style={styles.chips}>
          {[
            ["tracking", "Tracking"],
            ["ttc", "Trying"],
            ["pregnancy", "Pregnancy"],
            ["menopause", "Menopause"]
          ].map(([value, label]) => (
            <Chip
              key={value}
              label={label}
              selected={cycleConfig.goal === value}
              onPress={() => updateCycleConfig({ goal: value as typeof cycleConfig.goal })}
            />
          ))}
        </View>
      </Section>

      <Section title="Health data controls">
        <View style={styles.panel}>
          <ControlRow icon="phone-portrait-outline" title="Anonymous Mode" body="Keep data local on this device." value />
          <ControlRow icon="finger-print-outline" title="Biometric lock" body="Requires native setup before release." value={false} />
          <ControlRow icon="notifications-outline" title="Cycle reminders" body="Period, fertile-window, and daily log reminders." value={false} />
          <Button
            variant="tonal"
            onPress={async () => {
              const { notificationService } = await import("@/services/notifications/notificationService");
              await notificationService.requestPermissions();
            }}
            style={styles.panelAction}
          >
            Configure reminders
          </Button>
        </View>
      </Section>

      <Section title="Journeys">
        <View style={styles.links}>
          <CareLink href="/pregnancy" icon="heart-outline" title="Pregnancy mode" body="Week, trimester, due date, and checklist." />
          <CareLink href="/ovulation" icon="sparkles-outline" title="Fertility detail" body="Estimated fertile window with clear safety language." />
          <CareLink href="/reports" icon="document-text-outline" title="Doctor report" body="Export surface and premium report state." />
        </View>
      </Section>

      <Section title="AI and Premium">
        <View style={styles.panel}>
          <InfoBanner
            title="AI assistant is not connected yet"
            body="The product state is designed, but no LLM backend is called from the app. This avoids fake medical intelligence."
            tone="warning"
          />
          <InfoBanner
            title="Premium value is scoped"
            body="Detailed reports, AI, partner sharing, and advanced charts require purchase infrastructure before launch."
          />
        </View>
      </Section>

      <Section title="Account actions">
        <View style={styles.accountGrid}>
          <Button variant="secondary">Export JSON</Button>
          <Button variant="destructive">Delete data</Button>
        </View>
      </Section>
    </Screen>
  );
}

function ControlRow({ icon, title, body, value }: { icon: keyof typeof Ionicons.glyphMap; title: string; body: string; value: boolean }) {
  return (
    <View style={styles.controlRow}>
      <Ionicons name={icon} size={22} color={colors.brandAction} />
      <View style={styles.controlCopy}>
        <AppText variant="cardTitle">{title}</AppText>
        <AppText variant="supporting" color="textSecondary">{body}</AppText>
      </View>
      <Switch value={value} disabled />
    </View>
  );
}

function CareLink({ href, icon, title, body }: { href: Href; icon: keyof typeof Ionicons.glyphMap; title: string; body: string }) {
  return (
    <Link href={href} asChild>
      <Pressable style={styles.careLink} accessibilityRole="button">
        <Ionicons name={icon} size={22} color={colors.brandAction} />
        <View style={styles.controlCopy}>
          <AppText variant="cardTitle">{title}</AppText>
          <AppText variant="supporting" color="textSecondary">{body}</AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
    </Link>
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
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md
  },
  controlRow: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.separator,
    paddingBottom: spacing.md
  },
  controlCopy: {
    flex: 1
  },
  panelAction: {
    alignSelf: "stretch"
  },
  links: {
    gap: spacing.sm
  },
  careLink: {
    minHeight: 78,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  accountGrid: {
    gap: spacing.sm
  }
});
