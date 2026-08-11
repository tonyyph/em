import { useMemo, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle
} from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = "primary" | "secondary" | "tonal" | "text" | "destructive";

/** Pressable allows a render-prop child; a button's label never is one. */
type ButtonProps = Omit<PressableProps, "children"> & {
  children?: ReactNode;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Suppresses the haptic tap — use for low-stakes, high-frequency controls. */
  silent?: boolean;
  style?: ViewStyle;
};

export function Button({
  variant = "primary",
  loading = false,
  icon,
  silent = false,
  disabled,
  children,
  style,
  onPress,
  ...props
}: ButtonProps) {
  const { colors, reduceMotion } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const setPressed = (pressed: boolean) => {
    if (reduceMotion) {
      return;
    }
    scale.value = withSpring(pressed ? motion.pressScale : 1, motion.spring);
  };

  const tone = useMemo(() => {
    switch (variant) {
      case "primary":
        return { background: colors.brandAction, text: "textOnAction" as const, border: "transparent" };
      case "secondary":
        return { background: colors.surface, text: "textPrimary" as const, border: colors.border };
      case "tonal":
        return { background: colors.brandActionSoft, text: "brandAction" as const, border: "transparent" };
      case "destructive":
        return { background: colors.destructive, text: "textOnAction" as const, border: "transparent" };
      case "text":
      default:
        return { background: "transparent", text: "brandAction" as const, border: "transparent" };
    }
  }, [variant, colors]);

  const isInactive = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isInactive), busy: loading }}
      disabled={isInactive}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={(event) => {
        if (!silent) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        }
        onPress?.(event);
      }}
      style={[
        styles.base,
        variant === "text" ? styles.textVariant : undefined,
        {
          backgroundColor: tone.background,
          borderColor: tone.border,
          borderWidth: variant === "secondary" ? StyleSheet.hairlineWidth : 0
        },
        isInactive ? styles.inactive : undefined,
        animatedStyle,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors[tone.text]} />
      ) : (
        <View style={styles.inner}>
          {icon ? <Ionicons name={icon} size={18} color={colors[tone.text]} /> : null}
          <AppText variant="label" color={tone.text}>
            {children}
          </AppText>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center"
  },
  textVariant: {
    minHeight: 44,
    paddingHorizontal: spacing.sm
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  inactive: {
    opacity: 0.45
  }
});
