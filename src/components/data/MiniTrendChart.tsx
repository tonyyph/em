import { StyleSheet, View } from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { AppText } from "@/components/common/AppText";
import { colors, radius, spacing } from "@/design/tokens";

type MiniTrendChartProps = {
  title: string;
  values: number[];
  max?: number;
  color?: string;
};

export function MiniTrendChart({ title, values, max = Math.max(...values, 1), color = colors.brandAction }: MiniTrendChartProps) {
  const width = 280;
  const height = 112;
  const points = values.map((value, index) => {
    const x = 12 + (index / Math.max(values.length - 1, 1)) * (width - 24);
    const y = height - 18 - (value / max) * (height - 36);
    return { x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <View style={styles.root}>
      <AppText variant="cardTitle">{title}</AppText>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.chart}>
        {[0, 1, 2].map((line) => (
          <Line
            key={line}
            x1="12"
            x2={width - 12}
            y1={18 + line * 34}
            y2={18 + line * 34}
            stroke={colors.chartGrid}
            strokeWidth="1"
          />
        ))}
        <Path d={path} stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        {points.map((point, index) => (
          <Circle key={`${point.x}-${index}`} cx={point.x} cy={point.y} r="3.5" fill={color} />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.md
  },
  chart: {
    marginTop: spacing.sm
  }
});
