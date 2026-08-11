import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "./AppText";
import type { PhaseName } from "@/design/palettes";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type ChipProps = {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  /** Tints the selected state with a phase colour instead of the brand colour. */
  phase?: PhaseName;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Chip({
  label,
  selected = false,
  disabled = false,
  icon,
  phase,
  onPress,
  style
}: ChipProps) {
  const { colors, reduceMotion } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const accent = phase ? colors.phases[phase] : colors.brandAction;
  const selectedGround = phase ? colors.phaseSoft[phase] : colors.brandActionSoft;

  const setPressed = (pressed: boolean) => {
    if (reduceMotion) {
      return;
    }
    scale.value = withSpring(pressed ? 0.96 : 1, motion.spring);
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      disabled={disabled || !onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      style={[
        styles.root,
        {
          backgroundColor: selected ? selectedGround : colors.surface,
          borderColor: selected ? accent : colors.border,
          borderWidth: selected ? 1.5 : StyleSheet.hairlineWidth
        },
        disabled ? styles.disabled : undefined,
        animatedStyle,
        style
      ]}
    >
      <View style={styles.inner}>
        {icon ? (
          <Ionicons name={icon} size={15} color={selected ? accent : colors.textSecondary} />
        ) : null}
        <AppText variant="label" style={{ color: selected ? accent : colors.textSecondary }}>
          {label}
        </AppText>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 44,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    justifyContent: "center"
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xxs
  },
  disabled: {
    opacity: 0.45
  }
});
