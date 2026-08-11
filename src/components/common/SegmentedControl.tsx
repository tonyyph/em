import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "@/design/tokens";

type SegmentedControlProps<T extends string> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({ value, options, onChange }: SegmentedControlProps<T>) {
  return (
    <View style={styles.root}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.item, selected ? styles.selected : undefined]}
          >
            <AppText variant="label" color={selected ? "surface" : "textSecondary"}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    borderRadius: radius.md,
    backgroundColor: colors.backgroundMuted,
    padding: spacing.xxs,
    gap: spacing.xxs
  },
  item: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm
  },
  selected: {
    backgroundColor: colors.brandAction
  }
});
