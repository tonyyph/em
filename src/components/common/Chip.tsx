import { Pressable, StyleSheet, type ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { colors, layout, radius, spacing } from "@/design/tokens";

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({ label, selected, disabled, onPress, style }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        selected ? styles.selected : undefined,
        disabled ? styles.disabled : undefined,
        pressed ? styles.pressed : undefined,
        style
      ]}
    >
      <AppText variant="label" color={selected ? "surface" : "textPrimary"}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  selected: {
    borderColor: colors.brandAction,
    backgroundColor: colors.brandAction
  },
  disabled: {
    opacity: 0.45
  },
  pressed: {
    transform: [{ scale: 0.98 }]
  }
});
