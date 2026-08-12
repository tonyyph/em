import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming
} from "react-native-reanimated";
import { AppText } from "./AppText";
import { useTheme } from "@/design/theme";
import { motion, radius, spacing } from "@/design/tokens";

type SegmentedControlProps<T extends string> = {
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
};

const TRACK_PADDING = 4;

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange
}: SegmentedControlProps<T>) {
  const { colors, reduceMotion } = useTheme();
  const [trackWidth, setTrackWidth] = useState(0);

  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  const segmentWidth = trackWidth > 0 ? (trackWidth - TRACK_PADDING * 2) / options.length : 0;

  // The thumb slides; the labels only cross-fade. Animating both would read as
  // two competing motions across a very small area.
  const offset = useDerivedValue(() => {
    const target = index * segmentWidth;
    return reduceMotion
      ? withTiming(target, { duration: 0 })
      : withSpring(target, motion.spring);
  }, [index, segmentWidth, reduceMotion]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }]
  }));

  return (
    <View
      style={[styles.track, { backgroundColor: colors.backgroundSunken }]}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
      accessibilityRole="tablist"
    >
      {segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { width: segmentWidth, backgroundColor: colors.surface, borderColor: colors.border },
            thumbStyle
          ]}
        />
      ) : null}

      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => {
              if (selected) {
                return;
              }
              Haptics.selectionAsync().catch(() => {});
              onChange(option.value);
            }}
            style={styles.item}
          >
            <AppText
              variant="label"
              color={selected ? "textPrimary" : "textMuted"}
              numberOfLines={1}
            >
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    borderRadius: radius.md,
    padding: TRACK_PADDING
  },
  thumb: {
    position: "absolute",
    top: TRACK_PADDING,
    left: TRACK_PADDING,
    bottom: TRACK_PADDING,
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth
  },
  item: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxs
  }
});
