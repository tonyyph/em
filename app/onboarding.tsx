import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  runOnJS,
  SlideInLeft,
  SlideInRight,
  SlideOutLeft,
  SlideOutRight,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import { Button } from "@/components/common/Button";
import { Chip } from "@/components/common/Chip";
import { InfoBanner } from "@/components/common/InfoBanner";
import { Reveal } from "@/components/common/Reveal";
import { Screen } from "@/components/common/Screen";
import { Tappable } from "@/components/common/Tappable";
import { EmMark } from "@/design/brand/EmMark";
import { OnboardingArt, type OnboardingSceneName } from "@/design/brand/OnboardingArt";
import { useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion, radius, spacing } from "@/design/tokens";
import type { HealthGoal } from "@/domain/entities/cycle";
import { useAppStore } from "@/store/appStore";

/**
 * The scene each slide is told over.
 *
 * Onboarding is three steps rather than five, so it draws three moments of the
 * five-part landscape: the terrain emerging, one contour rising into a reading
 * with its uncertainty shown, and the mark taking the centre of what has been
 * built. The two unused scenes stay in the brand layer for the longer flow.
 */
const SCENES: OnboardingSceneName[] = ["rhythm", "patterns", "together"];

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

/**
 * One bar of the progress rule.
 *
 * Extracted so each segment can own its own fill animation — a row of bars that
 * merely switch colour is the difference between an app that was designed and
 * one that was assembled.
 */
function ProgressSegment({ filled, reduceMotion }: { filled: boolean; reduceMotion: boolean }) {
  const { colors } = useTheme();
  const fill = useSharedValue(filled ? 1 : 0);

  useEffect(() => {
    fill.value = reduceMotion
      ? filled
        ? 1
        : 0
      : withTiming(filled ? 1 : 0, {
          duration: motion.duration.considered,
          easing: Easing.bezier(...curves.enter)
        });
  }, [fill, filled, reduceMotion]);

  const style = useAnimatedStyle(() => ({ transform: [{ scaleX: fill.value }] }));

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.separator }]}>
      <Animated.View
        style={[styles.progressFill, { backgroundColor: colors.brandAction }, style]}
      />
    </View>
  );
}

export default function OnboardingScreen() {
  const { colors, reduceMotion } = useTheme();
  const [index, setIndex] = useState(0);
  // Slides enter from the side they were travelling towards, so going back
  // genuinely reads as going back rather than as another forward step.
  const [goingBack, setGoingBack] = useState(false);
  const cycleConfig = useAppStore((state) => state.cycleConfig);
  const updateCycleConfig = useAppStore((state) => state.updateCycleConfig);

  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const go = useCallback((delta: number) => {
    setGoingBack(delta < 0);
    setIndex((current) => Math.min(SLIDES.length - 1, Math.max(0, current + delta)));
  }, []);

  // Swiping is how people expect to move through an intro, and an intro that
  // only responds to its own button is the first thing the app teaches them.
  const swipe = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((event) => {
      "worklet";
      if (event.translationX < -40) {
        runOnJS(go)(1);
      } else if (event.translationX > 40) {
        runOnJS(go)(-1);
      }
    });

  const entering = goingBack ? SlideInLeft : SlideInRight;
  const exiting = goingBack ? SlideOutRight : SlideOutLeft;

  return (
    <Screen scroll={false} padded={false} contentStyle={styles.root}>
      <View>
        <Reveal index={0}>
          <View style={styles.brandMark}>
            <EmMark size={26} />
            <AppText variant="label">Ẽm</AppText>
          </View>
        </Reveal>

        <Reveal index={1} style={styles.progressRow}>
          {SLIDES.map((item, position) => (
            <ProgressSegment
              key={item.eyebrow}
              filled={position <= index}
              reduceMotion={reduceMotion}
            />
          ))}
        </Reveal>
      </View>

      <GestureDetector gesture={swipe}>
        <Animated.View
          key={slide.eyebrow}
          entering={
            reduceMotion ? undefined : entering.duration(motion.duration.considered)
          }
          exiting={reduceMotion ? undefined : exiting.duration(motion.duration.base)}
          style={styles.copy}
        >
          <OnboardingArt name={SCENES[index]} height={168} style={styles.scene} />
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
              {GOALS.map((goal, position) => {
                const selected = cycleConfig.goal === goal.value;
                return (
                  // The goal cards are the one moment onboarding asks for a
                  // decision, so they arrive one after another rather than as a
                  // wall of five.
                  <Reveal key={goal.value} index={position} style={styles.goalSlot}>
                    <Tappable
                      haptic="selection"
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      accessibilityLabel={goal.label}
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
                    </Tappable>
                  </Reveal>
                );
              })}
            </View>
          ) : (
            <View style={styles.keyPoints}>
              {KEY_POINTS.map((item, position) => (
                <Reveal key={item} index={position + 1}>
                  <Chip label={item} />
                </Reveal>
              ))}
            </View>
          )}
        </Animated.View>
      </GestureDetector>

      <View style={styles.footer}>
        {isLast ? (
          <Animated.View
            entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.considered)}
            exiting={reduceMotion ? undefined : FadeOut.duration(motion.duration.quick)}
          >
            <InfoBanner
              title="Not a diagnostic tool"
              body="Ẽm supports personal tracking and helps you prepare for conversations with a clinician."
              tone="warning"
            />
          </Animated.View>
        ) : null}
        <Button onPress={() => (isLast ? router.replace("/auth/login") : go(1))}>
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
  scene: {
    marginBottom: spacing.lg
  },
  progressRow: {
    flexDirection: "row",
    gap: spacing.xxs,
    marginTop: spacing.xl
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: radius.full,
    overflow: "hidden"
  },
  progressFill: {
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
    // Grows from the left rather than the centre, so the rule reads as filling
    // in the direction of travel.
    transformOrigin: "left"
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
  goalSlot: {
    width: "47.5%"
  },
  goal: {
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
