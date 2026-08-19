import { View, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "@/design/theme";
import { emMark } from "./marks";
import { emMarkSquare } from "./svg";

const SQUARE = emMarkSquare();

type EmMarkProps = {
  /** Side of the square the mark is drawn in, in points. */
  size?: number;
  /** Defaults to the theme's brand action — oxblood by day, rose by night. */
  color?: string;
  style?: StyleProp<ViewStyle>;
  /**
   * The mark is decoration in almost every position it appears in, because the
   * screen around it already says the name. Set this only where the mark is the
   * sole thing identifying the app — the splash, and nowhere else so far.
   */
  label?: string;
};

/**
 * The Ẽm mark.
 *
 * The same two strokes the app icon, the launch screen and the App Store
 * listing are cut from — imported from `marks.ts` rather than redrawn, so the
 * mark in the sign-in header is provably the same object as the one on the home
 * screen and cannot drift from it.
 *
 * Drawn in a square viewBox fitted to the mark's own bounds, so `size` means
 * the ink and not the padding around it.
 */
export function EmMark({ size = 28, color, style, label }: EmMarkProps) {
  const { colors } = useTheme();
  const tint = color ?? colors.brandAction;

  return (
    <View
      style={[{ width: size, height: size }, style]}
      accessible={label !== undefined}
      accessibilityRole={label !== undefined ? "image" : undefined}
      accessibilityLabel={label}
      accessibilityElementsHidden={label === undefined}
      importantForAccessibility={label === undefined ? "no-hide-descendants" : "yes"}
    >
      <Svg width={size} height={size} viewBox={SQUARE.viewBox}>
        {emMark.map((stroke) => (
          <Path
            key={stroke.d}
            d={stroke.d}
            fill="none"
            stroke={tint}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    </View>
  );
}
