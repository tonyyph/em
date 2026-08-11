import { StyleSheet, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Path, Rect, Stop, Line } from "react-native-svg";
import { AppText } from "@/components/common/AppText";
import { useTheme } from "@/design/theme";
import { radius, spacing } from "@/design/tokens";

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

export function MiniTrendChart({
  title,
  points,
  unit = "",
  color,
  band
}: MiniTrendChartProps) {
  const { colors } = useTheme();
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

  return (
    <View
      style={[styles.root, { backgroundColor: colors.surface, borderColor: colors.border }]}
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

        {areaPath ? <Path d={areaPath} fill="url(#area)" /> : null}
        <Path
          d={linePath}
          stroke={stroke}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {points.map((point, index) => (
          <Circle
            key={`${point.label ?? index}-${index}`}
            cx={x(index)}
            cy={y(point.value)}
            r={index === points.length - 1 ? 5 : 3.5}
            fill={index === points.length - 1 ? stroke : colors.surface}
            stroke={stroke}
            strokeWidth={2}
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
