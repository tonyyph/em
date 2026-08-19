import type { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Atmosphere } from "@/design/brand/Atmosphere";
import { useTheme } from "@/design/theme";
import { layout, spacing } from "@/design/tokens";

type ScreenProps = PropsWithChildren<{
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}>;

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
  }
});
