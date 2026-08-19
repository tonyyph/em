import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, G, Line, Path } from "react-native-svg";
import { useTheme } from "@/design/theme";
import type { ThemeColors } from "@/design/palettes";
import { radius } from "@/design/tokens";
import { emMark } from "./marks";
import { emMarkSquare } from "./svg";

/**
 * Onboarding, told as one landscape rather than five pictures.
 *
 * The same terrain runs through every scene: first it emerges, then it gains
 * signals, then memories settle into it, then one line rises out of it into
 * meaning, and finally the mark sits at its centre. Drawn as a continuous story
 * on purpose — five unrelated illustrations are the tell of an onboarding
 * assembled from stock art, and this app's first impression is the argument
 * that it was not.
 *
 * Illustration only. Every word stays app-rendered, because the copy is
 * translated and text baked into artwork is text that never gets translated.
 */

export type OnboardingSceneName = "rhythm" | "listen" | "moments" | "patterns" | "together";

const WIDTH = 206;
const HEIGHT = 240;
const SQUARE = emMarkSquare();

type Scene = { ground: keyof ThemeColors; draw: (colors: ThemeColors) => ReactNode };

const scenes: Record<OnboardingSceneName, Scene> = {
  // 01 — the landscape emerging: contours, and the first protected seed.
  rhythm: {
    ground: "surfaceWarm",
    draw: (colors) => (
      <>
        <G fill="none">
          <Path
            d="M-6 150 C40 132 78 168 116 150 C150 134 176 152 212 138"
            stroke={colors.atmosphereLines[1]}
            strokeWidth={1.3}
          />
          <Path
            d="M-6 178 C44 158 80 192 120 172 C158 154 180 172 212 158"
            stroke={colors.atmosphereLines[0]}
            strokeWidth={1.6}
          />
        </G>
        <Ellipse
          cx={103}
          cy={150}
          rx={58}
          ry={34}
          fill="none"
          stroke={colors.brandAction}
          strokeWidth={2}
          opacity={0.32}
        />
        <Ellipse
          cx={103}
          cy={146}
          rx={34}
          ry={20}
          fill="none"
          stroke={colors.brandAction}
          strokeWidth={2.4}
          opacity={0.6}
        />
        <Circle cx={103} cy={142} r={8} fill={colors.brandAction} />
      </>
    )
  },
  // 02 — the layers answer back: each logged signal shifts a stratum.
  listen: {
    ground: "surfaceCool",
    draw: (colors) => (
      <>
        <G fill="none" strokeWidth={2.4} strokeLinecap="round" opacity={0.85}>
          <Path d="M20 110 C70 98 130 122 186 108" stroke={colors.phases.menstrual} />
          <Path d="M20 134 C70 146 130 122 186 136" stroke={colors.phases.ovulation} />
          <Path d="M20 158 C70 146 130 170 186 156" stroke={colors.phases.follicular} />
          <Path d="M20 182 C70 194 130 170 186 184" stroke={colors.phases.fertile} />
        </G>
        <Circle cx={103} cy={128} r={6.5} fill={colors.brandAction} />
        <Circle
          cx={103}
          cy={128}
          r={13}
          fill="none"
          stroke={colors.brandAction}
          strokeWidth={1.4}
          opacity={0.4}
        />
      </>
    )
  },
  // 03 — notes and feelings settle into the terrain as embedded points.
  moments: {
    ground: "surfaceWarm",
    draw: (colors) => (
      <>
        <G fill="none" stroke={colors.atmosphereLines[1]} strokeWidth={1.4}>
          <Path d="M-6 120 C50 104 96 138 140 118 C176 102 198 116 212 108" />
          <Path d="M-6 156 C50 140 96 174 140 154 C176 138 198 152 212 144" />
          <Path d="M-6 192 C50 176 96 210 140 190 C176 174 198 188 212 180" />
        </G>
        <Circle cx={58} cy={128} r={7} fill={colors.phases.luteal} />
        <Circle cx={120} cy={150} r={7} fill={colors.phases.pregnancy} />
        <Circle cx={150} cy={126} r={6} fill={colors.phases.fertile} />
        <Circle cx={86} cy={182} r={6} fill={colors.phases.ovulation} />
      </>
    )
  },
  // 04 — one contour rises into meaning, with the estimate marked on it and a
  // dashed drop showing that the day is read off the line, not measured.
  patterns: {
    ground: "surfaceCool",
    draw: (colors) => (
      <>
        <G fill="none" stroke={colors.atmosphereLines[1]} strokeWidth={1.3}>
          <Path d="M-6 118 C50 102 96 136 140 116 C176 100 198 114 212 106" />
          <Path d="M-6 188 C50 172 96 206 140 186 C176 170 198 184 212 176" />
        </G>
        <Path
          d="M-6 153 C50 137 96 171 140 151 C176 135 198 149 212 141"
          stroke={colors.brandAction}
          strokeWidth={2.6}
          fill="none"
        />
        <Line
          x1={118}
          y1={60}
          x2={118}
          y2={149}
          stroke={colors.brandAction}
          strokeWidth={1.2}
          strokeDasharray="3 4"
          opacity={0.5}
        />
        <Circle
          cx={118}
          cy={157}
          r={7.5}
          fill={colors.brandAction}
          stroke={colors.background}
          strokeWidth={2.5}
        />
      </>
    )
  },
  // 05 — the mark takes the centre of the landscape it has been building. The
  // splash animation ends on this same position, so the two read as one move.
  together: {
    ground: "surfaceWarm",
    draw: (colors) => (
      <>
        <Path
          d="M-6 172 C50 156 96 190 140 170 C176 154 198 168 212 160"
          stroke={colors.atmosphereLines[0]}
          strokeWidth={1.4}
          fill="none"
        />
        <Circle
          cx={103}
          cy={130}
          r={52}
          fill="none"
          stroke={colors.brandAction}
          strokeWidth={1.2}
          opacity={0.18}
        />
        <Svg x={71} y={98} width={64} height={64} viewBox={SQUARE.viewBox}>
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
    )
  }
};

export const onboardingSceneNames = Object.keys(scenes) as OnboardingSceneName[];

type OnboardingArtProps = {
  name: OnboardingSceneName;
  height?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * The focal point of every scene sits in the upper half of the frame, which is
 * the contract that lets a screen put copy underneath the artwork without ever
 * covering the thing the scene is about.
 */
export function OnboardingArt({ name, height = 200, style }: OnboardingArtProps) {
  const { colors } = useTheme();
  const scene = scenes[name];
  const ground = colors[scene.ground];

  return (
    <View
      style={[
        styles.root,
        { height, backgroundColor: typeof ground === "string" ? ground : undefined },
        style
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {scene.draw(colors)}
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
