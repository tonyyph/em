import { useEffect, useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import Animated, {
  Easing,
  FadeIn,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { AppText } from "@/components/common/AppText";
import { maxFontSizeMultiplier, useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion, radius, spacing, typography } from "@/design/tokens";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
};

/** How far the field travels when it rejects an entry, in px. */
const SHAKE = 5;

export function TextField({ label, error, helper, style, ...props }: TextFieldProps) {
  const { colors, reduceMotion } = useTheme();
  const [focused, setFocused] = useState(false);

  const focus = useSharedValue(0);
  const shake = useSharedValue(0);

  useEffect(() => {
    focus.value = reduceMotion
      ? focused || error
        ? 1
        : 0
      : withTiming(focused || error ? 1 : 0, {
          duration: motion.duration.quick,
          easing: Easing.bezier(...curves.settle)
        });
  }, [focus, focused, error, reduceMotion]);

  /**
   * A rejected entry moves.
   *
   * Colour alone is a weak signal for an error — it is the channel most likely
   * to be missed, by anyone glancing away and by anyone who does not separate
   * red from the surrounding warm palette easily. The movement is small and
   * happens once; it says "not that" without scolding.
   */
  useEffect(() => {
    if (!error || reduceMotion) {
      return;
    }
    shake.value = withSequence(
      withTiming(-SHAKE, { duration: 50 }),
      withTiming(SHAKE, { duration: 50 }),
      withTiming(-SHAKE / 2, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  }, [shake, error, reduceMotion]);

  const shellStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shake.value }],
    borderWidth: 1.5,
    borderColor: interpolateColor(
      focus.value,
      [0, 1],
      [colors.border, error ? colors.error : colors.focus]
    )
  }));

  return (
    <View style={styles.root}>
      <AppText variant="label" color="textSecondary" style={styles.label}>
        {label}
      </AppText>

      <Animated.View style={[styles.shell, { backgroundColor: colors.surface }, shellStyle]}>
        <TextInput
          allowFontScaling
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          placeholderTextColor={colors.textMuted}
          accessibilityHint={helper}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          style={[styles.input, typography.body, { color: colors.textPrimary }, style]}
          {...props}
        />
      </Animated.View>

      {error || helper ? (
        <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(motion.duration.quick)}>
          <AppText
            variant="caption"
            color={error ? "error" : "textMuted"}
            style={styles.helper}
          >
            {error ?? helper}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginTop: spacing.md
  },
  label: {
    marginBottom: spacing.xs
  },
  shell: {
    borderRadius: radius.md,
    // The border is always 1.5 and only its colour animates. Animating the
    // width instead would shift the text by half a pixel on every focus, which
    // reads as the field twitching.
    overflow: "hidden"
  },
  input: {
    minHeight: 52,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  helper: {
    marginTop: spacing.xxs
  }
});
