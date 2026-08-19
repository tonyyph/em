import type { ReactNode } from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path } from "react-native-svg";
import { useTheme } from "@/design/theme";
import type { ThemeColors } from "@/design/palettes";

/**
 * Empty states, drawn rather than iconed.
 *
 * Each is a fragment of the same landscape the rest of the system is made of,
 * carrying one phase colour and no more. The grammar is deliberate: the neutral
 * strokes are what exists, the coloured stroke is what is missing, and nothing
 * is ever drawn broken, crossed out, or with a sad face. An empty state here
 * says "not yet", never "nothing" — which matters more than usual in an app
 * where the blank screen is often a person's first week of tracking.
 *
 * Sized at 90×72 so they sit inside a card at the scale of a large icon and
 * never take the card over.
 */

export type EmptyArtName =
  | "cycle"
  | "notes"
  | "patterns"
  | "reports"
  | "signals"
  | "moments"
  | "search"
  | "offline";

const WIDTH = 90;
const HEIGHT = 72;

type Drawing = (colors: ThemeColors) => ReactNode;

const drawings: Record<EmptyArtName, Drawing> = {
  // The landscape not yet formed: the dial's rings present but dashed, waiting
  // for a first logged period to make them solid.
  cycle: (colors) => (
    <>
      <Ellipse cx={45} cy={40} rx={30} ry={18} fill="none" stroke={colors.border} strokeWidth={2} />
      <Ellipse
        cx={45}
        cy={37}
        rx={16}
        ry={9}
        fill="none"
        stroke={colors.phases.menstrual}
        strokeWidth={2.2}
        strokeDasharray="2 4"
        opacity={0.7}
      />
      <Circle cx={45} cy={35} r={4} fill="none" stroke={colors.phases.menstrual} strokeWidth={2} />
    </>
  ),
  // A single mark waiting to settle onto the terrain.
  notes: (colors) => (
    <>
      <Path d="M12 46 C34 36 54 54 78 42" fill="none" stroke={colors.border} strokeWidth={2} />
      <Circle cx={52} cy={47} r={5} fill="none" stroke={colors.phases.pregnancy} strokeWidth={2.2} />
      <Line
        x1={52}
        y1={24}
        x2={52}
        y2={42}
        stroke={colors.phases.pregnancy}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </>
  ),
  // Strata with the trend line still dashed: the data is there, the meaning
  // is not yet.
  patterns: (colors) => (
    <>
      <G fill="none" stroke={colors.border} strokeWidth={2}>
        <Line x1={12} y1={32} x2={78} y2={32} />
        <Line x1={12} y1={44} x2={78} y2={44} />
        <Line x1={12} y1={56} x2={78} y2={56} />
      </G>
      <Path
        d="M12 44 C34 36 54 52 78 42"
        fill="none"
        stroke={colors.phases.luteal}
        strokeWidth={2.4}
        strokeDasharray="3 4"
        opacity={0.7}
      />
    </>
  ),
  reports: (colors) => (
    <>
      <G stroke={colors.border} strokeWidth={2} fill="none">
        <Line x1={24} y1={52} x2={24} y2={38} />
        <Line x1={38} y1={52} x2={38} y2={30} />
        <Line x1={52} y1={52} x2={52} y2={42} />
        <Line x1={66} y1={52} x2={66} y2={34} />
      </G>
      <Line x1={16} y1={52} x2={74} y2={52} stroke={colors.phases.ovulation} strokeWidth={2.2} />
    </>
  ),
  // Signals as a cluster: three untouched, one waiting to be chosen.
  signals: (colors) => (
    <>
      <G fill="none" stroke={colors.border} strokeWidth={2}>
        <Circle cx={30} cy={34} r={7} />
        <Circle cx={52} cy={34} r={7} />
        <Circle cx={41} cy={52} r={7} />
      </G>
      <Circle
        cx={60}
        cy={52}
        r={7}
        fill="none"
        stroke={colors.phases.follicular}
        strokeWidth={2.2}
      />
    </>
  ),
  moments: (colors) => (
    <>
      <Path d="M12 48 C34 40 54 54 78 44" fill="none" stroke={colors.border} strokeWidth={2} />
      <Circle cx={45} cy={36} r={9} fill="none" stroke={colors.phases.fertile} strokeWidth={2.2} />
      <Circle cx={45} cy={36} r={2.6} fill={colors.phases.fertile} />
    </>
  ),
  search: (colors) => (
    <>
      <Path d="M12 50 C34 42 54 56 78 46" fill="none" stroke={colors.border} strokeWidth={2} />
      <Circle cx={40} cy={32} r={12} fill="none" stroke={colors.phases.wellness} strokeWidth={2.4} />
      <Line
        x1={49}
        y1={41}
        x2={60}
        y2={52}
        stroke={colors.phases.wellness}
        strokeWidth={2.6}
        strokeLinecap="round"
      />
    </>
  ),
  // The contour continues past the break as a dashed line — the data is not
  // lost, it is simply on the other side of the connection.
  offline: (colors) => (
    <>
      <Path
        d="M10 40 C26 32 34 46 45 40"
        fill="none"
        stroke={colors.border}
        strokeWidth={2.4}
        strokeLinecap="round"
      />
      <Path
        d="M45 40 C56 34 64 48 80 40"
        fill="none"
        stroke={colors.warning}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeDasharray="3 5"
      />
      <Circle cx={45} cy={40} r={3} fill={colors.warning} />
    </>
  )
};

export const emptyArtNames = Object.keys(drawings) as EmptyArtName[];

export function EmptyArt({ name, width = WIDTH }: { name: EmptyArtName; width?: number }) {
  const { colors } = useTheme();
  const height = (width / WIDTH) * HEIGHT;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg width={width} height={height} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        {drawings[name](colors)}
      </Svg>
    </View>
  );
}
