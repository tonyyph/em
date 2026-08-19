import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion } from "@/design/tokens";
import { SPLASH_VIEWBOX, emMark, splashContours } from "@/design/brand/marks";
import { emMarkSquare } from "@/design/brand/svg";

const SQUARE = emMarkSquare();

/** Matches `imageWidth` in the expo-splash-screen config, so the handoff from
 * the native launch image to this overlay is a dissolve and not a jump. */
const MARK_SIZE = 160;

/**
 * The overlay is decoration with a deadline. Whatever happens to the animation,
 * it is gone by now and the app underneath is the app.
 */
const HARD_TIMEOUT = 1000;

const STAGE = {
  /** 1 · Appear — the mark fades up at 96%. */
  appear: 0,
  /** 2 · Settle — the e springs to full size, the tilde eases in above it. */
  settle: 140,
  tilde: 180,
  /** 3 · Contours expand outward from the centre. */
  contours: 300,
  /** 4 · The field opens: mark lifts away, ground clears. */
  open: 520
};

const OPEN_DURATION = motion.duration.considered;

type SplashOverlayProps = {
  /** Called once the overlay has finished, or once the deadline has passed. */
  onFinish: () => void;
};

/**
 * The launch animation.
 *
 * `expo-splash-screen` shows a static mark on a paper ground before any of this
 * exists — that layer is the dependable one, and it is what a user on a slow
 * cold start actually sees. This overlay picks the same mark up at the same
 * size and dissolves it into the first screen, so the app opens by continuing a
 * gesture rather than by cutting from a logo to a UI.
 *
 * Three things keep it from ever being in the way. It never gates readiness:
 * the app underneath is mounted and interactive the whole time, and this is
 * `pointerEvents="none"` on top of it. It has a hard deadline, so a dropped
 * animation frame or a backgrounded app cannot leave anyone stuck on a splash.
 * And with reduce-motion on, the whole storyboard collapses to a short
 * cross-fade — instant, not absent.
 */
export function SplashOverlay({ onFinish }: SplashOverlayProps) {
  const { colors, isDark, reduceMotion } = useTheme();

  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.96);
  const markLift = useSharedValue(0);
  const tilde = useSharedValue(0);
  const contours = useSharedValue(0);
  const ground = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      markOpacity.value = 1;
      markScale.value = 1;
      tilde.value = 1;
      contours.value = 1;
      ground.value = withTiming(0, { duration: motion.duration.quick }, (done) => {
        if (done) {
          runOnJS(onFinish)();
        }
      });
      return;
    }

    const enter = { easing: Easing.bezier(...curves.enter) };

    markOpacity.value = withTiming(1, { duration: motion.duration.quick, ...enter });
    markScale.value = withDelay(STAGE.settle, withSpring(1, motion.springSoft));
    tilde.value = withDelay(
      STAGE.tilde,
      withTiming(1, { duration: motion.duration.base, ...enter })
    );
    contours.value = withDelay(
      STAGE.contours,
      withTiming(1, { duration: motion.duration.considered, ...enter })
    );
    markLift.value = withDelay(
      STAGE.open,
      withTiming(1, { duration: OPEN_DURATION, ...enter })
    );

    // The ground is the last thing to go and the only stage that reports back:
    // once the paper has cleared there is nothing left of the overlay to see,
    // so that is the honest moment to unmount it.
    ground.value = withDelay(
      STAGE.open,
      withTiming(
        0,
        { duration: OPEN_DURATION, easing: Easing.bezier(...curves.exit) },
        (done) => {
          if (done) {
            runOnJS(onFinish)();
          }
        }
      )
    );
    // Runs once, on mount. A reduce-motion change mid-launch is not worth
    // restarting a 900ms animation for.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(onFinish, HARD_TIMEOUT);
    return () => clearTimeout(timer);
  }, [onFinish]);

  const groundStyle = useAnimatedStyle(() => ({ opacity: ground.value }));

  const contourStyle = useAnimatedStyle(() => ({
    opacity: contours.value,
    transform: [{ scale: 0.94 + contours.value * 0.06 }]
  }));

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value * (1 - markLift.value),
    transform: [
      { translateY: markLift.value * -18 },
      { scale: markScale.value + markLift.value * 0.04 }
    ]
  }));

  const tildeStyle = useAnimatedStyle(() => ({
    opacity: tilde.value,
    transform: [{ translateY: (1 - tilde.value) * -8 }]
  }));

  const [stem, accent] = emMark;

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: colors.background }, groundStyle]}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[StyleSheet.absoluteFill, contourStyle]}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${SPLASH_VIEWBOX.width} ${SPLASH_VIEWBOX.height}`}
          preserveAspectRatio="xMidYMid slice"
        >
          {splashContours
            .map((line) => ({ line, opacity: isDark ? line.darkOpacity : line.lightOpacity }))
            .filter(({ opacity }) => opacity > 0)
            .map(({ line, opacity }) => (
              <Path
                key={line.d}
                d={line.d}
                stroke={colors.atmosphereLines[line.tone]}
                strokeWidth={line.width}
                fill="none"
                opacity={opacity}
              />
            ))}
        </Svg>
      </Animated.View>

      <View style={styles.centre} pointerEvents="none">
        <Animated.View style={[styles.mark, markStyle]}>
          <Svg width={MARK_SIZE} height={MARK_SIZE} viewBox={SQUARE.viewBox}>
            <Path
              d={stem.d}
              fill="none"
              stroke={colors.brandAction}
              strokeWidth={stem.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Animated.View style={[StyleSheet.absoluteFill, tildeStyle]}>
            <Svg width={MARK_SIZE} height={MARK_SIZE} viewBox={SQUARE.viewBox}>
              <Path
                d={accent.d}
                fill="none"
                stroke={colors.brandAction}
                strokeWidth={accent.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10
  },
  centre: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE
  }
});
