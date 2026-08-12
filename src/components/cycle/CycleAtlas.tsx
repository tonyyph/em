import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
  Easing
} from "react-native-reanimated";
import Svg, { Circle, G, Line, Path } from "react-native-svg";
import { AppText } from "@/components/common/AppText";
import { getCurrentPhase } from "@/design/phase";
import { useTheme } from "@/design/theme";
import { motion, phaseMeta, radius, spacing } from "@/design/tokens";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import { dayjs } from "@/utils/date/dayjs";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const SIZE = 232;
const CENTER = SIZE / 2;
const RING_R = 86;
const RING_W = 13;

type CycleAtlasProps = {
  date: string;
  cycles: Cycle[];
  prediction: CyclePrediction;
  cycleDay?: number;
};

const polar = (r: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: CENTER + r * Math.cos(radians), y: CENTER + r * Math.sin(radians) };
};

const arcPath = (r: number, start: number, end: number) => {
  // A full circle cannot be expressed as a single arc — the start and end
  // points coincide and the renderer draws nothing.
  const sweep = Math.min(end - start, 359.9);
  const from = polar(r, start);
  const to = polar(r, start + sweep);
  return `M ${from.x} ${from.y} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${to.x} ${to.y}`;
};

/**
 * The cycle as a dial.
 *
 * Arc spans are derived from the prediction rather than fixed: a 24-day cycle
 * and a 34-day cycle genuinely look different here, which matters because the
 * ring is the first thing that tells someone whether the app understands them.
 * Geometry follows the algorithm — ovulation lands 14 days before the next
 * period, the fertile window spans the five days before it plus one after.
 */
export function CycleAtlas({ date, cycles, prediction, cycleDay }: CycleAtlasProps) {
  const { colors, elevation, reduceMotion } = useTheme();

  const phase = getCurrentPhase(date, cycles, prediction, prediction.averagePeriodLength);
  const meta = phaseMeta[phase];

  const cycleLength = Math.max(prediction.averageCycleLength, 14);
  const periodLength = Math.min(prediction.averagePeriodLength, cycleLength - 4);

  const lastStart = cycles.at(-1)?.startDate ?? date;
  const safeCycleDay = Math.min(
    cycleLength,
    Math.max(1, cycleDay ?? dayjs(date).diff(dayjs(lastStart), "day") + 1)
  );

  const toAngle = (day: number) => (Math.min(Math.max(day, 0), cycleLength) / cycleLength) * 360;

  const ovulationDay = cycleLength - 13;
  const bounds = {
    menstrualEnd: toAngle(periodLength),
    fertileStart: toAngle(Math.max(ovulationDay - 5, periodLength)),
    fertileEnd: toAngle(ovulationDay + 1),
    ovulation: toAngle(ovulationDay - 0.5)
  };

  const segments = [
    { key: "menstrual" as const, from: 0, to: bounds.menstrualEnd },
    { key: "follicular" as const, from: bounds.menstrualEnd, to: bounds.fertileStart },
    { key: "fertile" as const, from: bounds.fertileStart, to: bounds.fertileEnd },
    { key: "luteal" as const, from: bounds.fertileEnd, to: 360 }
  ].filter((segment) => segment.to - segment.from > 0.6);

  const progressAngle = toAngle(safeCycleDay - 0.5);
  const marker = polar(RING_R, progressAngle);

  // The marker travels from the top of the dial to today's position, so the
  // ring reads as a clock face being wound rather than as a static chart.
  const travel = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    travel.value = reduceMotion
      ? 1
      : withTiming(1, {
          duration: motion.duration.deliberate,
          easing: Easing.out(Easing.cubic)
        });
  }, [travel, reduceMotion, progressAngle]);

  const markerProps = useAnimatedProps(() => {
    const angle = progressAngle * travel.value;
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      cx: CENTER + RING_R * Math.cos(radians),
      cy: CENTER + RING_R * Math.sin(radians)
    };
  }, [progressAngle]);

  const ovulationMark = polar(RING_R, bounds.ovulation);

  return (
    <View
      style={[
        styles.root,
        elevation.raised,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
      accessibilityRole="image"
      accessibilityLabel={`Day ${safeCycleDay} of an estimated ${cycleLength} day cycle. Current phase: ${meta.label}.`}
    >
      <View style={styles.visual}>
        <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RING_R}
            stroke={colors.backgroundSunken}
            strokeWidth={RING_W}
            fill="none"
          />

          {segments.map((segment) => (
            <Path
              key={segment.key}
              d={arcPath(RING_R, segment.from, segment.to)}
              stroke={colors.phases[segment.key]}
              strokeWidth={RING_W}
              strokeLinecap="butt"
              fill="none"
              opacity={phase === segment.key ? 1 : 0.42}
            />
          ))}

          <G opacity={0.45}>
            {Array.from({ length: cycleLength }, (_, index) => {
              if (index % 7 !== 0) {
                return null;
              }
              const angle = toAngle(index);
              const a = polar(RING_R - RING_W / 2 - 5, angle);
              const b = polar(RING_R - RING_W / 2 - 10, angle);
              return (
                <Line
                  key={angle}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={colors.textMuted}
                  strokeWidth={1}
                />
              );
            })}
          </G>

          <Circle
            cx={ovulationMark.x}
            cy={ovulationMark.y}
            r={3}
            fill={colors.surface}
            opacity={0.9}
          />

          <AnimatedCircle
            animatedProps={markerProps}
            r={9}
            fill={colors.phases[phase] ?? colors.brandAction}
            stroke={colors.surface}
            strokeWidth={4}
          />
        </Svg>

        <View style={styles.core} pointerEvents="none">
          <AppText variant="eyebrow" color="textMuted">
            Day
          </AppText>
          <AppText variant="heroMetric" style={styles.dayNumber}>
            {safeCycleDay}
          </AppText>
          <AppText variant="caption" color="textMuted">
            of ~{cycleLength}
          </AppText>
        </View>
      </View>

      <View style={styles.copy}>
        <View style={styles.phaseRow}>
          <View style={[styles.swatch, { backgroundColor: colors.phases[phase] }]} />
          <AppText variant="sectionTitle">{meta.label}</AppText>
        </View>
        <AppText variant="supporting" color="textSecondary" style={styles.description}>
          {meta.description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.lg,
    overflow: "hidden"
  },
  visual: {
    alignItems: "center",
    justifyContent: "center"
  },
  core: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center"
  },
  dayNumber: {
    marginTop: -2,
    marginBottom: -4
  },
  copy: {
    marginTop: spacing.lg
  },
  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  swatch: {
    width: 8,
    height: 8,
    borderRadius: radius.full
  },
  description: {
    marginTop: spacing.xxs
  }
});
