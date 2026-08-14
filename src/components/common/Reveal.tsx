import { useEffect, type PropsWithChildren } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "@/design/theme";
import { REVEAL_RISE, curves, staggerDelay } from "@/design/motion";
import { motion } from "@/design/tokens";

type RevealProps = PropsWithChildren<{
  /** Position in a staggered sequence. Ignored when `delay` is given. */
  index?: number;
  /** Explicit delay in ms, for sequences this component cannot infer. */
  delay?: number;
  /** Rise distance in px. Larger for hero surfaces, never more than ~20. */
  distance?: number;
  style?: StyleProp<ViewStyle>;
}>;

/**
 * The entrance primitive.
 *
 * Wrapping a subtree in `<Reveal index={n}>` is the whole API for "this arrives
 * after the things above it". Screens compose their choreography by numbering
 * their blocks, and never by writing timing code.
 *
 * Reduce-motion is handled here rather than at the call site, which is the
 * point: the accessibility contract only holds if it is impossible to forget.
 * With it on, the element renders complete and in place — motion becomes
 * instant, never absent, so nothing is unreachable because animations are off.
 *
 * This is hand-rolled rather than built on Reanimated's `entering` layout
 * animations because those re-run on layout changes the app does not control,
 * and an entrance that replays when a parent reflows reads as a glitch.
 */
export function Reveal({
  children,
  index = 0,
  delay,
  distance = REVEAL_RISE,
  style
}: RevealProps) {
  const { reduceMotion } = useTheme();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withDelay(
      delay ?? staggerDelay(index),
      withTiming(1, {
        duration: motion.duration.considered,
        easing: Easing.bezier(...curves.enter)
      })
    );
    // The entrance runs once per mount. Re-running it when `index` shifts —
    // which happens whenever a list reorders — would restart animations on
    // items the user is already looking at.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * distance }]
  }));

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}
