import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue
} from "react-native-reanimated";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from "react-native-svg";
import { AppText } from "@/components/common/AppText";
import { Tappable } from "@/components/common/Tappable";
import { getCurrentPhase } from "@/design/phase";
import { useTheme } from "@/design/theme";
import { curves } from "@/design/motion";
import { motion, phaseMeta, radius, spacing } from "@/design/tokens";
import type { PhaseName } from "@/design/palettes";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import { sortCyclesByStartDate } from "@/utils/algorithms/cyclePrediction";
import { dayjs } from "@/utils/date/dayjs";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 232;
const CENTER = SIZE / 2;
const RING_R = 86;
const RING_W = 13;
/** How far either side of the ring a touch still counts as grabbing it. */
const SCRUB_TOLERANCE = 34;

type CycleAtlasProps = {
  date: string;
  cycles: Cycle[];
  prediction: CyclePrediction;
  cycleDay?: number;
  /** Opens the fuller explanation of the phase the dial is showing. */
  onPressPhase?: () => void;
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

const arcLength = (r: number, sweep: number) => 2 * Math.PI * r * (Math.min(sweep, 359.9) / 360);

/**
 * Which cycle day a touch at (x, y) lands on, or null if the touch is too far
 * from the ring to be aimed at it. Runs on the UI thread during a drag, so it
 * is a worklet and takes plain numbers rather than closing over component
 * state.
 */
const dayFromTouch = (x: number, y: number, cycleLength: number) => {
  "worklet";
  const dx = x - CENTER;
  const dy = y - CENTER;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (Math.abs(distance - RING_R) > SCRUB_TOLERANCE) {
    return null;
  }
  const degrees = ((Math.atan2(dy, dx) * 180) / Math.PI + 90 + 360) % 360;
  return Math.min(cycleLength, Math.max(1, Math.round((degrees / 360) * cycleLength)));
};

type SegmentProps = {
  phase: PhaseName;
  from: number;
  to: number;
  active: boolean;
  /** 0 → 1 across the whole dial; each arc claims a slice of it. */
  draw: SharedValue<number>;
  order: number;
  count: number;
};

/**
 * One phase arc.
 *
 * Extracted because each arc needs its own `useAnimatedProps`, and hooks cannot
 * be called from inside the segment loop.
 *
 * The arc draws itself by retracting a dash the length of the arc — the same
 * trick a plotter uses, and the reason the ring reads as being inked onto the
 * page rather than switched on.
 */
function Segment({ phase, from, to, active, draw, order, count }: SegmentProps) {
  const sweep = to - from;
  const length = arcLength(RING_R, sweep);

  // Arcs are laid down one after another rather than all at once, each taking
  // the last 40% of its own window so consecutive arcs overlap slightly and the
  // ring reads as one continuous stroke instead of four separate ones.
  const start = (order / count) * 0.6;
  const end = start + 0.4;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: interpolate(
      draw.value,
      [start, end],
      [length, 0],
      Extrapolation.CLAMP
    )
  }));

  return (
    <AnimatedPath
      d={arcPath(RING_R, from, to)}
      stroke={`url(#grad-${phase})`}
      strokeWidth={RING_W}
      strokeLinecap="butt"
      fill="none"
      opacity={active ? 1 : 0.42}
      strokeDasharray={[length, length]}
      animatedProps={animatedProps}
    />
  );
}

/**
 * The cycle as a dial.
 *
 * Arc spans are derived from the prediction rather than fixed: a 24-day cycle
 * and a 34-day cycle genuinely look different here, which matters because the
 * ring is the first thing that tells someone whether the app understands them.
 * Geometry follows the algorithm — ovulation lands 14 days before the next
 * period, the fertile window spans the five days before it plus one after.
 *
 * The ring is also the app's one scrubbable surface: dragging around it walks
 * through the cycle day by day, with a selection tick at each day, and lifting
 * returns the dial to today. It is a read-only inspection, so there is nothing
 * to undo and no state left behind.
 */
export function CycleAtlas({
  date,
  cycles,
  prediction,
  cycleDay,
  onPressPhase
}: CycleAtlasProps) {
  const { colors, elevation, reduceMotion } = useTheme();

  const cycleLength = Math.max(prediction.averageCycleLength, 14);
  const periodLength = Math.min(prediction.averagePeriodLength, cycleLength - 4);

  // Sorted rather than trusting array order: the store appends on upsert and
  // loads whatever order the repository hands back, so the last element is not
  // reliably the most recent cycle — and every day the dial shows is measured
  // from this date.
  const lastStart = sortCyclesByStartDate(cycles).at(-1)?.startDate ?? date;
  const todayCycleDay = Math.min(
    cycleLength,
    Math.max(1, cycleDay ?? dayjs(date).diff(dayjs(lastStart), "day") + 1)
  );

  /** Non-null only while a finger is on the ring. */
  const [scrubbedDay, setScrubbedDay] = useState<number | null>(null);
  const shownDay = scrubbedDay ?? todayCycleDay;

  // The dial describes whichever day is being shown, so scrubbing to next week
  // answers "what phase will I be in" rather than just moving a dot.
  const shownDate = dayjs(lastStart).add(shownDay - 1, "day").format("YYYY-MM-DD");
  const phase = getCurrentPhase(shownDate, cycles, prediction, prediction.averagePeriodLength);
  const meta = phaseMeta[phase];

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

  const progressAngle = toAngle(shownDay - 0.5);

  const draw = useSharedValue(reduceMotion ? 1 : 0);
  // The marker travels from the top of the dial to today's position, so the
  // ring reads as a clock face being wound rather than as a static chart.
  const travel = useSharedValue(reduceMotion ? 1 : 0);
  const halo = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      draw.value = 1;
      travel.value = 1;
      halo.value = 0;
      return;
    }

    draw.value = withTiming(1, {
      duration: motion.duration.deliberate,
      easing: Easing.bezier(...curves.enter)
    });
    travel.value = withTiming(1, {
      duration: motion.duration.deliberate,
      easing: Easing.out(Easing.cubic)
    });
    // A slow breath under the marker. Long enough that it never reads as a
    // notification badge asking to be dealt with.
    halo.value = withRepeat(
      withTiming(1, { duration: 2400, easing: Easing.bezier(...curves.settle) }),
      -1,
      true
    );
  }, [draw, travel, halo, reduceMotion]);

  const markerProps = useAnimatedProps(() => {
    const angle = progressAngle * travel.value;
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      cx: CENTER + RING_R * Math.cos(radians),
      cy: CENTER + RING_R * Math.sin(radians)
    };
  }, [progressAngle]);

  const haloProps = useAnimatedProps(() => {
    const angle = progressAngle * travel.value;
    const radians = ((angle - 90) * Math.PI) / 180;
    return {
      cx: CENTER + RING_R * Math.cos(radians),
      cy: CENTER + RING_R * Math.sin(radians),
      r: 9 + halo.value * 7,
      opacity: (1 - halo.value) * 0.5
    };
  }, [progressAngle]);

  const coreStyle = useAnimatedStyle(() => ({
    opacity: interpolate(draw.value, [0, 0.35, 1], [0, 0, 1], Extrapolation.CLAMP)
  }));

  /**
   * The day the gesture last reported, kept on the UI thread.
   *
   * A pan fires many times per day-width of travel, so the crossing to JS is
   * filtered here rather than in `applyScrub`: only an actual change of day
   * costs a hop, and the tick can no longer double-fire — putting that check
   * inside a `setState` updater would, since React may run an updater more than
   * once for a single update and a haptic is a side effect.
   */
  const lastScrubbedDay = useSharedValue(-1);

  const applyScrub = useCallback((day: number) => {
    Haptics.selectionAsync().catch(() => {});
    setScrubbedDay(day);
  }, []);

  const clearScrub = useCallback(() => setScrubbedDay(null), []);

  /**
   * Touches are resolved against the ring's geometry rather than against child
   * views: 28 invisible wedges would be the alternative, and they would have to
   * be rebuilt every time the predicted cycle length changed.
   */
  const track = (x: number, y: number) => {
    "worklet";
    const day = dayFromTouch(x, y, cycleLength);
    if (day !== null && day !== lastScrubbedDay.value) {
      lastScrubbedDay.value = day;
      runOnJS(applyScrub)(day);
    }
  };

  const scrub = Gesture.Pan()
    .onBegin((event) => {
      "worklet";
      track(event.x, event.y);
    })
    .onUpdate((event) => {
      "worklet";
      track(event.x, event.y);
    })
    .onFinalize(() => {
      "worklet";
      lastScrubbedDay.value = -1;
      runOnJS(clearScrub)();
    });

  const ovulationMark = polar(RING_R, bounds.ovulation);
  const isScrubbing = scrubbedDay !== null;

  const phaseCopy = (
    <>
      <View style={styles.phaseRow}>
        <View style={[styles.swatch, { backgroundColor: colors.phases[phase] }]} />
        <AppText variant="sectionTitle" style={styles.phaseLabel}>
          {meta.label}
        </AppText>
        {onPressPhase ? (
          <Ionicons name="chevron-forward" size={15} color={colors.textMuted} />
        ) : null}
      </View>
      <AppText variant="supporting" color="textSecondary" style={styles.description}>
        {meta.description}
      </AppText>
    </>
  );

  return (
    <View
      style={[
        styles.root,
        elevation.raised,
        { backgroundColor: colors.surface, borderColor: colors.border }
      ]}
    >
      <GestureDetector gesture={scrub}>
        <View
          style={styles.visual}
          accessibilityRole="adjustable"
          accessibilityLabel={`Day ${shownDay} of an estimated ${cycleLength} day cycle. Current phase: ${meta.label}.`}
          accessibilityHint="Drag around the ring to inspect another day of the cycle"
        >
          <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
            <Defs>
              {/*
                Each arc carries a gentle sheen rather than a flat fill. The
                gradient runs between two opacities of the same phase colour, so
                it adds depth without inventing a colour the palette has not
                already checked for contrast.
              */}
              {segments.map((segment) => (
                <LinearGradient
                  key={segment.key}
                  id={`grad-${segment.key}`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <Stop offset="0" stopColor={colors.phases[segment.key]} stopOpacity={1} />
                  <Stop offset="1" stopColor={colors.phases[segment.key]} stopOpacity={0.72} />
                </LinearGradient>
              ))}
            </Defs>

            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RING_R}
              stroke={colors.backgroundSunken}
              strokeWidth={RING_W}
              fill="none"
            />

            {segments.map((segment, index) => (
              <Segment
                key={segment.key}
                phase={segment.key}
                from={segment.from}
                to={segment.to}
                active={phase === segment.key}
                draw={draw}
                order={index}
                count={segments.length}
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
              animatedProps={haloProps}
              fill={colors.phases[phase] ?? colors.brandAction}
            />
            <AnimatedCircle
              animatedProps={markerProps}
              r={isScrubbing ? 11 : 9}
              fill={colors.phases[phase] ?? colors.brandAction}
              stroke={colors.surface}
              strokeWidth={4}
            />
          </Svg>

          <Animated.View style={[styles.core, coreStyle]} pointerEvents="none">
            <AppText variant="eyebrow" color="textMuted">
              {isScrubbing ? "Day" : "Today"}
            </AppText>
            <AppText variant="heroMetric" style={styles.dayNumber}>
              {shownDay}
            </AppText>
            <AppText variant="caption" color="textMuted">
              of ~{cycleLength}
            </AppText>
          </Animated.View>
        </View>
      </GestureDetector>

      {onPressPhase ? (
        <Tappable
          dense
          haptic="selection"
          scale={0.99}
          onPress={onPressPhase}
          accessibilityRole="button"
          accessibilityLabel={`${meta.label}. Read what this phase means`}
          style={styles.copy}
        >
          {phaseCopy}
        </Tappable>
      ) : (
        <View style={styles.copy}>{phaseCopy}</View>
      )}
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
    // Sized to the SVG exactly. `Gesture.Pan` reports `event.x`/`event.y`
    // relative to the view it is attached to, and `dayFromTouch` measures them
    // against the SVG's own centre — a view that stretched to the card's width
    // would offset every touch by half the difference, which is wider than the
    // ring's grab tolerance and put the scrub on the wrong day.
    width: SIZE,
    height: SIZE,
    alignSelf: "center",
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
  phaseLabel: {
    flex: 1
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
