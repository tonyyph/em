import { StyleSheet, View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";
import type { Cycle, CyclePrediction } from "@/domain/entities/cycle";
import { AppText } from "@/components/common/AppText";
import { getCurrentPhase } from "@/design/phase";
import { colors, phaseMeta, radius, spacing } from "@/design/tokens";
import { dayjs } from "@/utils/date/dayjs";

type CycleAtlasProps = {
  date: string;
  cycles: Cycle[];
  prediction: CyclePrediction;
  cycleDay?: number;
};

const polar = (cx: number, cy: number, r: number, angle: number) => {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(radians), y: cy + r * Math.sin(radians) };
};

const arcPath = (cx: number, cy: number, r: number, start: number, end: number) => {
  const startPoint = polar(cx, cy, r, end);
  const endPoint = polar(cx, cy, r, start);
  const largeArcFlag = end - start <= 180 ? "0" : "1";
  return `M ${startPoint.x} ${startPoint.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${endPoint.x} ${endPoint.y}`;
};

export function CycleAtlas({ date, cycles, prediction, cycleDay }: CycleAtlasProps) {
  const phase = getCurrentPhase(date, cycles, prediction, prediction.averagePeriodLength);
  const currentPhase = phaseMeta[phase];
  const safeCycleDay = cycleDay ?? Math.max(1, dayjs(date).diff(dayjs(cycles.at(-1)?.startDate ?? date), "day") + 1);
  const progressAngle = Math.min(355, Math.max(4, (safeCycleDay / prediction.averageCycleLength) * 360));
  const marker = polar(104, 104, 76, progressAngle);
  const fertileStart = Math.max(0, prediction.averageCycleLength - 19);
  const fertileEnd = Math.min(prediction.averageCycleLength, prediction.averageCycleLength - 13);
  const fertileStartAngle = (fertileStart / prediction.averageCycleLength) * 360;
  const fertileEndAngle = (fertileEnd / prediction.averageCycleLength) * 360;

  return (
    <View style={styles.root}>
      <View style={styles.visual}>
        <Svg width="208" height="208" viewBox="0 0 208 208" accessibilityLabel="Cycle atlas visualization">
          <Circle cx="104" cy="104" r="86" fill="#FFFDF9" stroke={colors.border} strokeWidth="1" />
          <Path d={arcPath(104, 104, 76, 0, 65)} stroke={colors.phases.menstrual} strokeWidth="14" strokeLinecap="round" fill="none" />
          <Path d={arcPath(104, 104, 76, 65, fertileStartAngle)} stroke={colors.phases.follicular} strokeWidth="14" strokeLinecap="round" fill="none" />
          <Path d={arcPath(104, 104, 76, fertileStartAngle, fertileEndAngle)} stroke={colors.phases.fertile} strokeWidth="14" strokeLinecap="round" fill="none" />
          <Path d={arcPath(104, 104, 76, fertileEndAngle, 360)} stroke={colors.phases.luteal} strokeWidth="14" strokeLinecap="round" fill="none" />
          <G opacity="0.7">
            {Array.from({ length: 12 }, (_, index) => {
              const angle = (index / 12) * 360;
              const a = polar(104, 104, 58, angle);
              const b = polar(104, 104, 64, angle);
              return <Line key={angle} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.separator} strokeWidth="1" />;
            })}
          </G>
          <Circle cx={marker.x} cy={marker.y} r="8" fill={currentPhase.color} stroke="#FFFDF9" strokeWidth="4" />
          <Circle cx="104" cy="104" r="44" fill={colors.backgroundMuted} />
          <SvgText x="104" y="100" textAnchor="middle" fontSize="13" fontWeight="700" fill={colors.textMuted}>
            Day
          </SvgText>
          <SvgText x="104" y="130" textAnchor="middle" fontSize="34" fontWeight="700" fill={colors.textPrimary}>
            {safeCycleDay}
          </SvgText>
        </Svg>
      </View>
      <View style={styles.copy}>
        <AppText variant="caption" color="textMuted">
          Current signal
        </AppText>
        <AppText variant="sectionTitle" style={styles.phase}>
          {currentPhase.label}
        </AppText>
        <AppText variant="supporting" color="textSecondary">
          {currentPhase.description}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    padding: spacing.lg,
    overflow: "hidden"
  },
  visual: {
    alignItems: "center",
    marginTop: spacing.xs
  },
  copy: {
    marginTop: spacing.md
  },
  phase: {
    marginTop: spacing.xs,
    marginBottom: spacing.xs
  }
});
