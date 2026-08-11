import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { AppText } from "@/components/common/AppText";
import { colors, layout, radius, spacing, typography } from "@/design/tokens";

type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helper?: string;
};

export function TextField({ label, error, helper, style, ...props }: TextFieldProps) {
  return (
    <View style={styles.root}>
      <AppText variant="label" color="textSecondary" style={styles.label}>
        {label}
      </AppText>
      <TextInput
        accessibilityLabel={label}
        accessibilityHint={helper}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : undefined, style]}
        {...props}
      />
      {error || helper ? (
        <AppText variant="caption" color={error ? "error" : "textMuted"} style={styles.message}>
          {error ?? helper}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    marginBottom: spacing.md
  },
  label: {
    marginBottom: spacing.xs
  },
  input: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.textPrimary,
    ...typography.body
  },
  inputError: {
    borderColor: colors.error
  },
  message: {
    marginTop: spacing.xs
  }
});
