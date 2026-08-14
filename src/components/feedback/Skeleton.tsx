import { useEffect } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { useTheme } from "@/design/theme";
import { curves, staggerDelay } from "@/design/motion";
import { radius, spacing } from "@/design/tokens";

type SkeletonProps = {
  width?: ViewStyle["width"];
  height?: number;
  /** Matches the radius of whatever this is standing in for. */
  round?: number;
  style?: ViewStyle;
};

/**
 * A placeholder that breathes.
 *
 * The pulse runs between two warm grounds already in the palette rather than
 * the usual grey sweep — a neutral shimmer on `#FBF6EF` paper reads as a smudge
 * for the same reason the shadows in `theme.tsx` are brown rather than black.
 *
 * Opacity carries the pulse instead of a translating highlight band: the band
 * needs a mask to stay inside rounded corners, and on a warm ground the effect
 * it buys is close to invisible anyway.
 */
export function Skeleton({ width = "100%", height = 16, round, style }: SkeletonProps) {
  const { colors, reduceMotion } = useTheme();
  const pulse = useSharedValue(reduceMotion ? 1 : 0.45);

  useEffect(() => {
    if (reduceMotion) {
      pulse.value = 1;
      return;
    }

    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.bezier(...curves.settle) }),
      -1,
      true
    );
  }, [pulse, reduceMotion]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  return (
    <Animated.View
      accessibilityRole="progressbar"
      accessibilityLabel="Loading"
      style={[
        {
          width,
          height,
          borderRadius: round ?? radius.sm,
          backgroundColor: colors.surfaceMuted
        },
        style,
        animatedStyle
      ]}
    />
  );
}

/**
 * The shape a card takes while its data is still arriving. Screens use this
 * instead of assembling their own bars, so every loading state in the app has
 * the same rhythm.
 */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <Skeleton width="42%" height={12} />
      <Skeleton width="72%" height={26} style={styles.title} />
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? "58%" : "100%"}
          height={13}
          style={{ marginTop: index === 0 ? spacing.md : spacing.xs }}
        />
      ))}
    </View>
  );
}

/** A run of skeleton cards, staggered the way the real content will arrive. */
export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={{ opacity: 1 - staggerDelay(index) / 900 }}>
          <SkeletonCard />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg
  },
  title: {
    marginTop: spacing.xs
  },
  list: {
    gap: spacing.sm
  }
});
