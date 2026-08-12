import type { GestureResponderEvent } from "react-native";
import { Platform, Pressable, StyleSheet, View, type ColorValue } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/design/theme";
import { layout, radius, spacing } from "@/design/tokens";

const iconFor =
  (name: keyof typeof Ionicons.glyphMap, activeName: keyof typeof Ionicons.glyphMap) =>
  function TabIcon({ color, focused }: { color: ColorValue; focused: boolean }) {
    return <Ionicons name={focused ? activeName : name} size={23} color={color} />;
  };

/**
 * Logging is the one thing the app asks of someone every day, so it gets the
 * only raised control in the bar rather than sitting as a fifth equal icon.
 */
/** The subset of the navigator's button props this control actually needs. */
type TabBarButtonProps = {
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityState?: { selected?: boolean };
};

function LogTabButton({ onPress, accessibilityState }: TabBarButtonProps) {
  const { colors, elevation } = useTheme();
  const focused = accessibilityState?.selected;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel="Log today"
      onPress={(event) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        onPress?.(event);
      }}
      style={styles.logTab}
    >
      <View
        style={[
          styles.logButton,
          elevation.raised,
          {
            backgroundColor: focused ? colors.brandActionPressed : colors.brandAction,
            borderColor: colors.surface
          }
        ]}
      >
        <Ionicons name="add" size={26} color={colors.textOnAction} />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const { colors, elevation } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandAction,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontFamily: "BeVietnamPro_600SemiBold",
          fontSize: 10.5,
          letterSpacing: 0.2
        },
        tabBarStyle: {
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          minHeight: layout.tabBarHeight,
          paddingTop: spacing.xs,
          paddingBottom: Platform.OS === "ios" ? 0 : spacing.xs,
          ...elevation.sheet
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Today", tabBarIcon: iconFor("compass-outline", "compass") }}
      />
      <Tabs.Screen
        name="calendar"
        options={{ title: "Calendar", tabBarIcon: iconFor("calendar-outline", "calendar") }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: "",
          tabBarButton: (props) => <LogTabButton {...props} />
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: "Insights", tabBarIcon: iconFor("analytics-outline", "analytics") }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Care",
          tabBarIcon: iconFor("shield-checkmark-outline", "shield-checkmark")
        }}
      />

      <Tabs.Screen name="ovulation" options={{ href: null }} />
      <Tabs.Screen name="pregnancy" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  logButton: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18
  }
});
