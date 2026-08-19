import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path } from "react-native-svg";
import { useTheme } from "@/design/theme";
import type { ThemeColors } from "@/design/palettes";
import { radius } from "@/design/tokens";
import { emMark } from "./marks";
import { emMarkSquare } from "./svg";

/**
 * Hero artwork for the screens that carry weight.
 *
 * Same landscape grammar as everything else, each piece tuned to one meaning —
 * and each defined as much by what it refuses. No padlock on the auth screen,
 * no crown or gold on premium, no thermometers or ovum on ovulation, no fetus
 * diagram on pregnancy. Those are the clichés of the category, and an app whose
 * whole argument is calm honesty cannot open with them.
 *
 * 380×180 and cropped with `slice`, so the drawing bleeds off both edges at any
 * card width rather than letterboxing.
 */

export type MomentArtName = "auth" | "premium" | "ovulation" | "pregnancy";

const WIDTH = 380;
const HEIGHT = 180;
const SQUARE = emMarkSquare();

type Drawing = (colors: ThemeColors) => ReactNode;

const drawings: Record<MomentArtName, Drawing> = {
  // Sheltering contours close around the mark. Safety drawn as an embrace
  // rather than as a lock, which is also the honest picture: the protection
  // here is that the data stays on the device, not that a door is bolted.
  auth: (colors) => (
    <>
      <G fill="none" stroke={colors.atmosphereLines[1]} strokeWidth={2}>
        <Path d="M190 30 C120 30 74 78 74 138 C74 150 76 162 80 172" />
        <Path d="M190 30 C260 30 306 78 306 138 C306 150 304 162 300 172" />
      </G>
      <G fill="none" stroke={colors.atmosphereLines[0]} strokeWidth={2}>
        <Path d="M190 58 C142 58 110 92 110 138 C110 150 112 162 116 172" />
        <Path d="M190 58 C238 58 270 92 270 138 C270 150 268 162 264 172" />
      </G>
      <Svg x={157} y={86} width={66} height={66} viewBox={SQUARE.viewBox}>
        {emMark.map((stroke) => (
          <Path
            key={stroke.d}
            d={stroke.d}
            fill="none"
            stroke={colors.brandAction}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </>
  ),
  // More strata, and links drawn between the points on them: the value being
  // sold is connection between signals over time, so that is literally what is
  // drawn. Deliberately not a tier badge.
  premium: (colors) => (
    <>
      <G fill="none" strokeWidth={2}>
        <Path
          d="M-6 120 C60 100 120 140 190 118 C260 96 320 128 386 108"
          stroke={colors.phases.follicular}
          opacity={0.55}
        />
        <Path
          d="M-6 96 C60 76 120 116 190 94 C260 72 320 104 386 84"
          stroke={colors.phases.fertile}
          opacity={0.5}
        />
        <Path
          d="M-6 144 C60 124 120 164 190 142 C260 120 320 152 386 132"
          stroke={colors.phases.ovulation}
          opacity={0.5}
        />
        <Path
          d="M-6 72 C60 52 120 92 190 70 C260 48 320 80 386 60"
          stroke={colors.phases.luteal}
          opacity={0.45}
        />
      </G>
      <G stroke={colors.brandAction} strokeWidth={1.4} opacity={0.6}>
        <Line x1={120} y1={103} x2={190} y2={94} />
        <Line x1={190} y1={94} x2={262} y2={118} />
      </G>
      <G fill={colors.brandAction}>
        <Circle cx={120} cy={103} r={4.5} />
        <Circle cx={190} cy={94} r={6} />
        <Circle cx={262} cy={118} r={4.5} />
      </G>
    </>
  ),
  // A crest, with the halo widening around it. The rings are the uncertainty:
  // the peak is where the estimate points, and the two faint rings are how
  // wide that estimate really is.
  ovulation: (colors) => (
    <>
      <G fill="none" strokeWidth={2}>
        <Path
          d="M-6 150 C90 148 150 92 190 92 C230 92 290 148 386 150"
          stroke={colors.atmosphereLines[1]}
        />
        <Path
          d="M-6 165 C90 163 150 112 190 112 C230 112 290 163 386 165"
          stroke={colors.atmosphereLines[0]}
        />
        <Path
          d="M-6 135 C90 133 150 70 190 70 C230 70 290 133 386 135"
          stroke={colors.phases.fertile}
          opacity={0.55}
        />
      </G>
      <Circle cx={190} cy={70} r={9} fill={colors.phases.fertile} />
      <Circle
        cx={190}
        cy={70}
        r={18}
        fill="none"
        stroke={colors.phases.fertile}
        strokeWidth={1.4}
        opacity={0.4}
      />
      <Circle
        cx={190}
        cy={70}
        r={27}
        fill="none"
        stroke={colors.phases.fertile}
        strokeWidth={1}
        opacity={0.2}
      />
    </>
  ),
  // A warm centre held inside widening rings. Abstraction, not anatomy — the
  // week-by-week states reuse this same nest rather than illustrating a body.
  pregnancy: (colors) => (
    <>
      <Ellipse
        cx={190}
        cy={150}
        rx={150}
        ry={70}
        fill="none"
        stroke={colors.atmosphereLines[1]}
        strokeWidth={2}
      />
      <Ellipse
        cx={190}
        cy={150}
        rx={108}
        ry={52}
        fill="none"
        stroke={colors.atmosphereLines[0]}
        strokeWidth={2}
      />
      <Ellipse
        cx={190}
        cy={150}
        rx={68}
        ry={36}
        fill="none"
        stroke={colors.phases.pregnancy}
        strokeWidth={2}
        opacity={0.6}
      />
      <Circle cx={190} cy={150} r={16} fill={colors.phases.pregnancy} opacity={0.9} />
      <Circle cx={190} cy={150} r={7} fill={colors.phaseSoft.pregnancy} />
    </>
  )
};

export const momentArtNames = Object.keys(drawings) as MomentArtName[];

type MomentArtProps = {
  name: MomentArtName;
  height?: number;
  style?: StyleProp<ViewStyle>;
  /**
   * Artwork that carries information rather than mood gets a label. Only
   * `ovulation` does today: its peak and halo are a second telling of the
   * estimate, and a screen reader that skips it loses that.
   */
  label?: string;
};

export function MomentArt({ name, height = 132, style, label }: MomentArtProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.root, { height, backgroundColor: colors.surfaceMuted }, style]}
      accessible={label !== undefined}
      accessibilityRole={label !== undefined ? "image" : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={label === undefined}
      importantForAccessibility={label === undefined ? "no-hide-descendants" : "yes"}
      pointerEvents="none"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {drawings[name](colors)}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: "100%",
    borderRadius: radius.lg,
    overflow: "hidden"
  }
});
