import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { Screen } from "@/components/common/Screen";
import { InfoBanner } from "@/components/common/InfoBanner";
import { useAppStore } from "@/store/appStore";
import type { HealthGoal } from "@/domain/entities/cycle";
import { colors, radius, spacing } from "@/design/tokens";

const slides = [
  {
    eyebrow: "Private by design",
    title: "A softer way to understand your rhythm",
    body: "Ẽm turns period, fertility, pregnancy, and wellbeing signals into a calm daily read."
  },
  {
    eyebrow: "No false certainty",
    title: "Predictions with visible confidence",
    body: "When your cycle is irregular, estimates become ranges instead of pretending one date is exact."
  },
  {
    eyebrow: "Choose your mode",
    title: "Start with what matters now",
    body: "You can change your goal later. Fertility estimates are educational and not contraception."
  }
];

const goals: { label: string; value: HealthGoal; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Track cycle", value: "tracking", icon: "compass-outline" },
  { label: "Trying to conceive", value: "ttc", icon: "sparkles-outline" },
  { label: "Pregnancy", value: "pregnancy", icon: "heart-outline" },
  { label: "Cycle awareness", value: "contraception", icon: "shield-outline" }
];

export default function OnboardingScreen() {
  const [index, setIndex] = useState(0);
  const updateCycleConfig = useAppStore((state) => state.updateCycleConfig);
  const cycleConfig = useAppStore((state) => state.cycleConfig);
  const slide = slides[index];
  const progress = useMemo(() => ((index + 1) / slides.length) * 100, [index]);

  return (
    <Screen scroll={false} contentStyle={styles.root}>
      <View>
        <View style={styles.brandMark}>
          <View style={styles.brandStem} />
          <AppText variant="label">Ẽm</AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.copy}>
        <AppText variant="caption" color="textMuted" style={styles.eyebrow}>
          {slide.eyebrow}
        </AppText>
        <AppText variant="display">{slide.title}</AppText>
        <AppText variant="body" color="textSecondary" style={styles.body}>
          {slide.body}
        </AppText>

        {index === 2 ? (
          <View style={styles.goalGrid}>
            {goals.map((goal) => {
              const selected = cycleConfig.goal === goal.value;
              return (
                <Pressable
                  key={goal.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateCycleConfig({ goal: goal.value })}
                  style={[styles.goal, selected ? styles.goalSelected : undefined]}
                >
                  <Ionicons name={goal.icon} size={22} color={selected ? colors.surface : colors.brandAction} />
                  <AppText variant="label" color={selected ? "surface" : "textPrimary"}>
                    {goal.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.keyPoints}>
            {["Local-first anonymous mode", "Cycle and pregnancy support", "Medically responsible language"].map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {index === 2 ? (
          <InfoBanner title="Not a diagnostic tool" body="Ẽm supports personal tracking and preparation for clinician conversations." tone="warning" />
        ) : null}
        <Button onPress={() => (index < slides.length - 1 ? setIndex(index + 1) : router.replace("/auth/login"))}>
          {index < slides.length - 1 ? "Continue" : "Set up Ẽm"}
        </Button>
        <Button variant="text" onPress={() => router.replace("/(tabs)")}>
          Continue anonymously
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: "space-between"
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  brandStem: {
    width: 16,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.brandAction,
    transform: [{ rotate: "18deg" }]
  },
  progressTrack: {
    marginTop: spacing.xl,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.separator,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.brandAction
  },
  copy: {
    gap: spacing.md
  },
  eyebrow: {
    textTransform: "uppercase"
  },
  body: {
    maxWidth: 340
  },
  keyPoints: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.sm
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.sm
  },
  goal: {
    width: "48%",
    minHeight: 104,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  goalSelected: {
    backgroundColor: colors.brandAction,
    borderColor: colors.brandAction
  },
  footer: {
    gap: spacing.sm
  }
});
