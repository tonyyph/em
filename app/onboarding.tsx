import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Screen } from "@/components/common/Screen";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";
import type { HealthGoal } from "@/domain/entities/cycle";
import { useAppStore } from "@/store/appStore";

const SLIDES = [
  {
    eyebrow: "Private by design",
    title: "A softer way to understand your rhythm",
    body: "Ẽm turns period, fertility, pregnancy and wellbeing signals into one calm daily read."
  },
  {
    eyebrow: "No false certainty",
    title: "Predictions that admit what they don’t know",
    body: "When your cycle is irregular, Ẽm widens to a range instead of pretending one date is exact."
  },
  {
    eyebrow: "Choose your mode",
    title: "Start with what matters now",
    body: "You can change this later. Fertility estimates are educational, and never contraception."
  }
];

/** Mirrors the full `HealthGoal` union — Care offers menopause, so this must too. */
const GOALS: { label: string; value: HealthGoal; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: "Track my cycle", value: "tracking", icon: "compass-outline" },
  { label: "Trying to conceive", value: "ttc", icon: "sparkles-outline" },
  { label: "I'm pregnant", value: "pregnancy", icon: "heart-outline" },
  { label: "Cycle awareness", value: "contraception", icon: "shield-outline" },
  { label: "Perimenopause", value: "menopause", icon: "moon-outline" }
];

const KEY_POINTS = [
  "Local-first anonymous mode",
  "Cycle and pregnancy support",
  "Medically responsible language"
];

export default function OnboardingScreen() {
  const { colors, reduceMotion } = useTheme();
  const [index, setIndex] = useState(0);
  const cycleConfig = useAppStore((state) => state.cycleConfig);
  const updateCycleConfig = useAppStore((state) => state.updateCycleConfig);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  return (
    <Screen scroll={false} padded={false} contentStyle={styles.root}>
      <View>
        <View style={styles.brandMark}>
          <View style={[styles.brandStem, { backgroundColor: colors.brandAction }]} />
          <AppText variant="label">Ẽm</AppText>
        </View>

        <View style={styles.progressRow}>
          {SLIDES.map((item, position) => (
            <View
              key={item.eyebrow}
              style={[
                styles.progressSegment,
                {
                  backgroundColor:
                    position <= index ? colors.brandAction : colors.separator
                }
              ]}
            />
          ))}
        </View>
      </View>

      <Animated.View
        key={slide.eyebrow}
        entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.considered)}
        exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.quick)}
        style={styles.copy}
      >
        <AppText variant="eyebrow" color="textMuted">
          {slide.eyebrow}
        </AppText>
        <AppText variant="display" style={styles.title}>
          {slide.title}
        </AppText>
        <AppText variant="body" color="textSecondary" style={styles.body}>
          {slide.body}
        </AppText>

        {isLast ? (
          <View style={styles.goalGrid}>
            {GOALS.map((goal) => {
              const selected = cycleConfig.goal === goal.value;
              return (
                <Pressable
                  key={goal.value}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  onPress={() => updateCycleConfig({ goal: goal.value })}
                  style={[
                    styles.goal,
                    {
                      backgroundColor: selected ? colors.brandAction : colors.surface,
                      borderColor: selected ? colors.brandAction : colors.border
                    }
                  ]}
                >
                  <Ionicons
                    name={goal.icon}
                    size={20}
                    color={selected ? colors.textOnAction : colors.brandAction}
                  />
                  <AppText
                    variant="label"
                    color={selected ? "textOnAction" : "textPrimary"}
                    numberOfLines={2}
                  >
                    {goal.label}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <View style={styles.keyPoints}>
            {KEY_POINTS.map((item) => (
              <Chip key={item} label={item} />
            ))}
          </View>
        )}
      </Animated.View>

      <View style={styles.footer}>
        {isLast ? (
          <InfoBanner
            title="Not a diagnostic tool"
            body="Ẽm supports personal tracking and helps you prepare for conversations with a clinician."
            tone="warning"
          />
        ) : null}
        <Button
          onPress={() => (isLast ? router.replace("/auth/login") : setIndex(index + 1))}
        >
          {isLast ? "Set up Ẽm" : "Continue"}
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
    paddingBottom: spacing.lg,
    justifyContent: "space-between"
  },
  brandMark: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  brandStem: {
    width: 14,
    height: 32,
    borderRadius: radius.full,
    transform: [{ rotate: "18deg" }]
  },
  progressRow: {
    flexDirection: "row",
    gap: spacing.xxs,
    marginTop: spacing.xl
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: radius.full
  },
  copy: {
    paddingVertical: spacing.xl
  },
  title: {
    marginTop: spacing.sm
  },
  body: {
    marginTop: spacing.sm,
    maxWidth: 360
  },
  keyPoints: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
    marginTop: spacing.lg
  },
  goalGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg
  },
  goal: {
    width: "47.5%",
    minHeight: 96,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    justifyContent: "space-between"
  },
  footer: {
    gap: spacing.xs
  }
});
