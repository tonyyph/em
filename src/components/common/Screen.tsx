import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { colors, layout, spacing } from "@/design/tokens";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

function Atmosphere() {
  return (
    <View style={styles.atmosphere}>
      <View style={styles.wash} />
      <Svg width="100%" height="220" viewBox="0 0 390 220" style={styles.topography}>
        <Path d="M-10 52 C70 8 122 92 206 42 C280 -2 335 36 402 4" stroke="#E8D8C8" strokeWidth={1.2} fill="none" />
        <Path d="M-12 106 C62 70 116 132 194 96 C274 58 326 88 406 54" stroke="#E1D1C2" strokeWidth={0.9} fill="none" />
        <Path d="M-8 166 C72 118 136 194 218 142 C296 92 340 136 404 102" stroke="#EADFD5" strokeWidth={1} fill="none" />
      </Svg>
    </View>
  );
}

export function Screen({ children, scroll = true, padded = true, style, contentStyle }: ScreenProps) {
  const content = (
    <View style={[styles.content, padded ? styles.padded : undefined, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={[styles.root, style]} edges={["top", "left", "right"]}>
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
    flex: 1,
    backgroundColor: colors.background
  },
  scrollContent: {
    paddingBottom: layout.tabBarHeight + spacing.xl
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
    bottom: 0,
    left: 0,
    pointerEvents: "none"
  },
  wash: {
    position: "absolute",
    top: -40,
    left: 0,
    right: 0,
    height: 190,
    backgroundColor: "#F5E9DC"
  },
  topography: {
    position: "absolute",
    top: 0,
    opacity: 0.75
  }
});
