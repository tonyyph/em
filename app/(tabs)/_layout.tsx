import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { colors, elevation, layout } from "@/design/tokens";

const iconFor = (name: keyof typeof Ionicons.glyphMap) =>
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color} />;
  };

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandAction,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700" },
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: colors.surface,
          minHeight: layout.tabBarHeight,
          paddingTop: 8,
          paddingBottom: 10,
          ...elevation.sheet
        }
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Today", tabBarIcon: iconFor("compass-outline") }} />
      <Tabs.Screen name="calendar" options={{ title: "Calendar", tabBarIcon: iconFor("calendar-outline") }} />
      <Tabs.Screen name="track" options={{ title: "Log", tabBarIcon: iconFor("add-circle-outline") }} />
      <Tabs.Screen name="insights" options={{ title: "Insights", tabBarIcon: iconFor("analytics-outline") }} />
      <Tabs.Screen name="settings" options={{ title: "Care", tabBarIcon: iconFor("shield-checkmark-outline") }} />
      <Tabs.Screen name="ovulation" options={{ href: null }} />
      <Tabs.Screen name="pregnancy" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
    </Tabs>
  );
}
