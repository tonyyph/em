import { useState } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "@/components/common/AppText";
import { maxFontSizeMultiplier, useTheme } from "@/design/theme";
import { radius, spacing, typography } from "@/design/tokens";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
};

export function TextField({ label, error, helper, style, ...props }: TextFieldProps) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error ? colors.error : focused ? colors.focus : colors.border;

  return (
    <View style={styles.root}>
      <AppText variant="label" color="textSecondary" style={styles.label}>
        {label}
      </AppText>
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
        style={[
          styles.input,
          typography.body,
          {
            color: colors.textPrimary,
            backgroundColor: colors.surface,
            borderColor,
            borderWidth: focused || error ? 1.5 : StyleSheet.hairlineWidth
          },
          style
        ]}
        {...props}
      />
      {error || helper ? (
        <AppText
          variant="caption"
          color={error ? "error" : "textMuted"}
          style={styles.helper}
        >
          {error ?? helper}
        </AppText>
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
  input: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  helper: {
    marginTop: spacing.xxs
  }
});
