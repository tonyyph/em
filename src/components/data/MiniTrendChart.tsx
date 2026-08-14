import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withTiming,
  type SharedValue
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop, Line } from "react-native-svg";
import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion, radius, spacing } from "@/design/tokens";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export type TrendPoint = {
  value: number;
  /** Short axis label, e.g. a cycle start date. */
  label?: string;
};

type MiniTrendChartProps = {
  title: string;
  points: TrendPoint[];
  unit?: string;
  color?: string;
  /**
   * A typical-range band drawn behind the line. Shows whether variation is
   * ordinary rather than leaving the reader to guess from the shape.
   */
  band?: { from: number; to: number; label?: string };
};

const WIDTH = 300;
const HEIGHT = 148;
const PAD_L = 30;
const PAD_R = 12;
const PAD_T = 14;
const PAD_B = 26;

type DotProps = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  stroke: string;
  /** 0 → 1 as the line is drawn; the dot appears once the line reaches it. */
  progress: SharedValue<number>;
  at: number;
};

/**
 * A point on the line.
 *
 * Its own component because each dot needs its own `useAnimatedProps`, and it
 * waits for the line to arrive rather than appearing with it — a dot that shows
 * up before the stroke reaches it gives away that the drawing is decoration
 * rather than the line actually being plotted.
 */
function Dot({ cx, cy, r, fill, stroke, progress, at }: DotProps) {
  const animatedProps = useAnimatedProps(() => {
    const shown = interpolate(progress.value, [at, at + 0.12], [0, 1], Extrapolation.CLAMP);
    return { r: r * shown, opacity: shown };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      animatedProps={animatedProps}
    />
  );
}

export function MiniTrendChart({ title, points, unit = "", color, band }: MiniTrendChartProps) {
  const { colors, elevation, reduceMotion } = useTheme();
  const stroke = color ?? colors.brandAction;

  const values = points.map((point) => point.value);
  // Pad the domain so the line never grazes the frame, and so a flat series
  // renders as a flat line in the middle rather than collapsing onto an edge.
  const rawMin = Math.min(...values, band?.from ?? Infinity);
  const rawMax = Math.max(...values, band?.to ?? -Infinity);
  const spread = Math.max(rawMax - rawMin, 4);
  const min = Math.floor(rawMin - spread * 0.2);
  const max = Math.ceil(rawMax + spread * 0.2);

  const plotW = WIDTH - PAD_L - PAD_R;
  const plotH = HEIGHT - PAD_T - PAD_B;

  const x = (index: number) =>
    PAD_L + (points.length <= 1 ? plotW / 2 : (index / (points.length - 1)) * plotW);
  const y = (value: number) => PAD_T + plotH - ((value - min) / (max - min)) * plotH;

  const linePath = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${x(index)} ${y(point.value)}`)
    .join(" ");
  const areaPath =
    points.length > 1
      ? `${linePath} L ${x(points.length - 1)} ${PAD_T + plotH} L ${x(0)} ${PAD_T + plotH} Z`
      : "";

  // The line is straight segments, so its length is exact arithmetic rather
  // than a measurement — no need to render it and ask the platform.
  const lineLength = points.reduce((total, point, index) => {
    if (index === 0) {
      return 0;
    }
    const dx = x(index) - x(index - 1);
    const dy = y(point.value) - y(points[index - 1].value);
    return total + Math.sqrt(dx * dx + dy * dy);
  }, 0);

  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }

    progress.value = withDelay(
      motion.duration.quick,
      withTiming(1, {
        duration: motion.duration.deliberate,
        easing: Easing.bezier(...curves.enter)
      })
    );
  }, [progress, reduceMotion]);

  const lineProps = useAnimatedProps(() => ({
    strokeDashoffset: (1 - progress.value) * lineLength
  }));

  // The fill under the line follows the line rather than leading it; ahead of
  // the stroke it would look like a shadow with nothing casting it.
  const areaProps = useAnimatedProps(() => ({
    opacity: interpolate(progress.value, [0.2, 1], [0, 1], Extrapolation.CLAMP)
  }));

  return (
    <View
      style={[
        styles.root,
        elevation.raised,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <View style={styles.head}>
        <AppText variant="cardTitle">{title}</AppText>
        {band?.label ? (
          <AppText variant="caption" color="textMuted">
            {band.label}
          </AppText>
        ) : null}
      </View>

      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={styles.chart}>
        <Defs>
          <LinearGradient id="area" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={stroke} stopOpacity={0.22} />
            <Stop offset="1" stopColor={stroke} stopOpacity={0} />
          </LinearGradient>
        </Defs>

        {band ? (
          <Rect
            x={PAD_L}
            y={y(band.to)}
            width={plotW}
            height={Math.max(y(band.from) - y(band.to), 1)}
            fill={stroke}
            opacity={0.07}
          />
        ) : null}

        {[max, Math.round((max + min) / 2), min].map((tick) => (
          <Line
            key={tick}
            x1={PAD_L}
            x2={WIDTH - PAD_R}
            y1={y(tick)}
            y2={y(tick)}
            stroke={colors.chartGrid}
            strokeWidth={1}
          />
        ))}

        {areaPath ? (
          <AnimatedPath d={areaPath} fill="url(#area)" animatedProps={areaProps} />
        ) : null}

        <AnimatedPath
          d={linePath}
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          strokeDasharray={[lineLength, lineLength]}
          animatedProps={lineProps}
        />

        {points.map((point, index) => (
          <Dot
            key={`${point.label ?? index}-${index}`}
            cx={x(index)}
            cy={y(point.value)}
            r={index === points.length - 1 ? 5 : 3.5}
            fill={index === points.length - 1 ? stroke : colors.surface}
            stroke={stroke}
            progress={progress}
            at={points.length <= 1 ? 0 : index / (points.length - 1)}
          />
        ))}
      </Svg>

      <View style={styles.axis}>
        <AppText variant="caption" color="textMuted">
          {points[0]?.label ?? ""}
        </AppText>
        <AppText variant="caption" color="textSecondary">
          {values[values.length - 1]}
          {unit} latest
        </AppText>
        <AppText variant="caption" color="textMuted">
          {points[points.length - 1]?.label ?? ""}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  chart: {
    marginTop: spacing.sm
  },
  axis: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs
  }
});
