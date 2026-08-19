import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { useTheme } from "@/design/theme";
import {
  ATMOSPHERE_VIEWBOX,
  FIELD_VIEWBOX,
  atmosphereContours,
  contourField,
  cornerContour,
  type AtmosphereLine
} from "./marks";

const lineOpacity = (line: AtmosphereLine, isDark: boolean) =>
  isDark ? line.darkOpacity : line.lightOpacity;

/**
 * The paper the app is printed on.
 *
 * A warm wash fades out of the top of every screen and three contours run
 * through it, like the ghost of a topographic map on letterpress stock. It is
 * the one purely decorative element in the system, so it stays faint and never
 * competes with content — in dark mode it drops to near-invisible, because a
 * texture that reads as "warm paper" by day reads as "smudge" by night.
 *
 * The contours are the same beziers the launch screen draws and the same family
 * the mark's tilde is cut from. That is the whole argument for pulling them out
 * of `Screen.tsx` and into the brand layer: the atmosphere is not decoration
 * that happens to sit behind screens, it is the identity, and it now has one
 * definition instead of a copy per surface.
 */
export function Atmosphere({ height = 280 }: { height?: number }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.atmosphere, { height }]} pointerEvents="none">
      <Svg
        width="100%"
        height={height}
        viewBox={`0 0 ${ATMOSPHERE_VIEWBOX.width} ${ATMOSPHERE_VIEWBOX.height}`}
        preserveAspectRatio="xMidYMin slice"
      >
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.atmosphereWash} stopOpacity={isDark ? 0.9 : 1} />
            <Stop
              offset="0.62"
              stopColor={colors.atmosphereWash}
              stopOpacity={isDark ? 0.4 : 0.55}
            />
            <Stop offset="1" stopColor={colors.atmosphereWash} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width={ATMOSPHERE_VIEWBOX.width}
          height={ATMOSPHERE_VIEWBOX.height}
          fill="url(#wash)"
        />
        {atmosphereContours.map((line) => (
          <Path
            key={line.d}
            d={line.d}
            stroke={colors.atmosphereLines[line.tone]}
            strokeWidth={line.width}
            fill="none"
            opacity={lineOpacity(line, isDark)}
          />
        ))}
      </Svg>
    </View>
  );
}

/**
 * The contour texture on its own, stretched to fill whatever it is put behind.
 *
 * No wash and no aspect ratio: a contour line has no correct proportions, so
 * this is free to be squashed into a wide card header or a tall hero without
 * looking wrong. Used where a surface wants the paper's grain without the
 * top-of-screen gradient that would fight the card's own ground.
 */
export function ContourField({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${FIELD_VIEWBOX.width} ${FIELD_VIEWBOX.height}`}
        preserveAspectRatio="none"
      >
        {contourField
          .filter((line) => lineOpacity(line, isDark) > 0)
          .map((line) => (
            <Path
              key={line.d}
              d={line.d}
              stroke={colors.atmosphereLines[line.tone]}
              strokeWidth={line.width}
              fill="none"
              opacity={lineOpacity(line, isDark)}
            />
          ))}
      </Svg>
    </View>
  );
}

/**
 * The nest, cropped to a card's top-right corner.
 *
 * An ornament rather than a texture — it gives an otherwise plain card the same
 * terrain grammar as the cycle dial without taking any room from the content.
 */
export function CornerContour({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.corner, style]} pointerEvents="none">
      <Svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${FIELD_VIEWBOX.width} ${FIELD_VIEWBOX.height}`}
        preserveAspectRatio="xMaxYMin slice"
      >
        {cornerContour.map((ring) => (
          <Path
            key={`${ring.rx}`}
            d={`M ${ring.cx - ring.rx} ${ring.cy} a ${ring.rx} ${ring.ry} 0 1 0 ${ring.rx * 2} 0 a ${ring.rx} ${ring.ry} 0 1 0 ${-ring.rx * 2} 0`}
            fill="none"
            stroke={colors.brandAction}
            strokeWidth={ring.width}
            opacity={0.22 * ring.opacity}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  atmosphere: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0
  },
  corner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 132,
    height: 66,
    overflow: "hidden"
  }
});
