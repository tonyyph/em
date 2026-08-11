import type { PropsWithChildren } from "react";
import { ActivityIndicator, Pressable, StyleSheet, type PressableProps, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { AppText } from "./AppText";
import { colors, layout, motion, radius, spacing } from "@/design/tokens";

type ButtonVariant = "primary" | "secondary" | "tonal" | "text" | "destructive";

type ButtonProps = PropsWithChildren<
  PressableProps & {
    variant?: ButtonVariant;
    loading?: boolean;
    style?: ViewStyle;
  }
>;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled,
  style,
  accessibilityLabel,
  ...props
}: ButtonProps) {
  const scale = useSharedValue(1);
  const isDisabled = disabled || loading;
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(scale.value, motion.spring) }]
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (typeof children === "string" ? children : undefined)}
      disabled={isDisabled}
      onPressIn={(event) => {
        scale.value = motion.pressScale;
        props.onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = 1;
        props.onPressOut?.(event);
      }}
      style={[
        styles.base,
    variantStyles[variant],
        isDisabled ? styles.disabled : undefined,
        animatedStyle,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "destructive" ? colors.surface : colors.brandAction} />
      ) : (
        <AppText
          variant="label"
          color={variant === "primary" || variant === "destructive" ? "surface" : variant === "text" ? "brandAction" : "textPrimary"}
          style={styles.text}
        >
          {children}
        </AppText>
      )}
    </AnimatedPressable>
  );
}

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.brandAction
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border
  },
  tonal: {
    backgroundColor: colors.surfaceWarm
  },
  text: {
    backgroundColor: "transparent",
    paddingHorizontal: spacing.sm
  },
  destructive: {
    backgroundColor: colors.destructive
  }
});

const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row"
  },
  disabled: {
    opacity: 0.48
  },
  text: {
    textAlign: "center"
  }
});
