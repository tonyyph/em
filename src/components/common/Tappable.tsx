import { useState, type ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useTheme } from "@/design/theme";
import { layout, motion } from "@/design/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Weight of the tap, matched to consequence rather than to how the control
 * looks. `selection` is for moving through options, `light` for ordinary
 * commits, `medium` for something the user cannot casually undo.
 */
export type HapticWeight = "none" | "selection" | "light" | "medium";

const fireHaptic = (weight: HapticWeight) => {
  switch (weight) {
    case "selection":
      Haptics.selectionAsync().catch(() => {});
      return;
    case "light":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      return;
    case "medium":
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      return;
    case "none":
    default:
  }
};

type TappableProps = Omit<PressableProps, "children" | "style"> & {
  children?: ReactNode;
  haptic?: HapticWeight;
  /** Press scale. Large surfaces need less of it — a card at 0.975 looks broken. */
  scale?: number;
  /** Ground shown while held. Defaults to no change. */
  pressedColor?: string;
  /** Skips the 48px minimum. Only for targets that sit inside a larger one. */
  dense?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Every tappable surface in the app goes through this.
 *
 * The reason it exists is consistency rather than convenience. Perceived polish
 * tracks how uniformly an app answers touch, so a screen where the button
 * responds and the card next to it does not reads as unfinished — the user
 * notices the surface that stayed still, not the one that moved. Routing every
 * touch through one component makes "responds correctly" the default and an
 * unresponsive surface the thing you have to go out of your way to build.
 *
 * Reduce-motion drops the scale but keeps the haptic and the pressed ground, so
 * the touch is still acknowledged through two other channels.
 */
export function Tappable({
  children,
  haptic = "light",
  scale: pressScale = motion.pressScale,
  pressedColor,
  dense = false,
  disabled,
  onPress,
  style,
  ...props
}: TappableProps) {
  const { reduceMotion } = useTheme();
  const scale = useSharedValue(1);
  // Reanimated's animated styles have to be handed to the component as a plain
  // style entry; Pressable's render-prop `style` form would nest them one level
  // too deep for the worklet to be picked up. The pressed ground therefore
  // rides on React state instead — presses are far too infrequent for the
  // extra render to matter.
  const [isPressed, setIsPressed] = useState(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const setPressed = (pressed: boolean) => {
    if (pressedColor) {
      setIsPressed(pressed);
    }
    if (reduceMotion || disabled) {
      return;
    }
    scale.value = withSpring(pressed ? pressScale : 1, motion.spring);
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={(event) => {
        fireHaptic(haptic);
        onPress?.(event);
      }}
      style={[
        dense ? undefined : styles.target,
        style,
        isPressed && pressedColor ? { backgroundColor: pressedColor } : undefined,
        disabled ? styles.disabled : undefined,
        animatedStyle
      ]}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  target: {
    minHeight: layout.minTouchTarget,
    justifyContent: "center"
  },
  disabled: {
    opacity: 0.45
  }
});
