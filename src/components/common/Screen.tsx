import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Defs, LinearGradient, Path, Rect, Stop } from "react-native-svg";
import { useTheme } from "@/design/theme";
import { layout, spacing } from "@/design/tokens";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

/**
 * The paper the app is printed on.
 *
 * A warm wash fades out of the top of every screen and three contour lines run
 * through it, like the ghost of a topographic map on letterpress stock. It is
 * the one purely decorative element in the system, so it stays faint and never
 * competes with content — in dark mode it drops to near-invisible, because a
 * texture that reads as "warm paper" by day reads as "smudge" by night.
 */
function Atmosphere() {
  const { colors, isDark } = useTheme();
  const [lineA, lineB, lineC] = colors.atmosphereLines;

  return (
    <View style={styles.atmosphere} pointerEvents="none">
      <Svg width="100%" height={280} viewBox="0 0 390 280" preserveAspectRatio="xMidYMin slice">
        <Defs>
          <LinearGradient id="wash" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.atmosphereWash} stopOpacity={isDark ? 0.9 : 1} />
            <Stop offset="0.62" stopColor={colors.atmosphereWash} stopOpacity={isDark ? 0.4 : 0.55} />
            <Stop offset="1" stopColor={colors.atmosphereWash} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Rect x="0" y="0" width="390" height="280" fill="url(#wash)" />
        <Path
          d="M-10 62 C70 18 122 102 206 52 C280 8 335 46 402 14"
          stroke={lineA}
          strokeWidth={1.2}
          fill="none"
          opacity={isDark ? 0.5 : 0.8}
        />
        <Path
          d="M-12 122 C62 86 116 148 194 112 C274 74 326 104 406 70"
          stroke={lineB}
          strokeWidth={0.9}
          fill="none"
          opacity={isDark ? 0.4 : 0.65}
        />
        <Path
          d="M-8 188 C72 140 136 216 218 164 C296 114 340 158 404 124"
          stroke={lineC}
          strokeWidth={1}
          fill="none"
          opacity={isDark ? 0.3 : 0.5}
        />
      </Svg>
    </View>
  );
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
  contentStyle
}: ScreenProps) {
  const { colors } = useTheme();

  const content = (
    <View style={[styles.content, padded ? styles.padded : undefined, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.root, { backgroundColor: colors.background }, style]}
      edges={["top", "left", "right"]}
    >
      <Atmosphere />
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: layout.tabBarHeight + spacing.xxl
  },
  content: {
    width: "100%",
    maxWidth: layout.maxContentWidth,
    alignSelf: "center"
  },
  padded: {
    paddingHorizontal: layout.gutter
  },
  atmosphere: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 280
  }
});
