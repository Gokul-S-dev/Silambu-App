import { Tabs } from "expo-router";
import { StyleSheet, Platform } from "react-native";

import { AppColors } from "@/constants/colors";
import { Icon } from "@/components/ui/Icon";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: AppColors.teal,
        tabBarInactiveTintColor: AppColors.muted,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Safety",
          tabBarLabel: "Safety",
          tabBarIcon: ({ color, focused }) => (
            <Icon name="shield" size={focused ? 23 : 21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: "Live GPS",
          tabBarLabel: "Location",
          tabBarIcon: ({ color, focused }) => (
            <Icon name="map-pin" size={focused ? 23 : 21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, focused }) => (
            <Icon name="bell" size={focused ? 23 : 21} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Guardian",
          tabBarLabel: "Guardian",
          tabBarIcon: ({ color, focused }) => (
            <Icon name="user" size={focused ? 23 : 21} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: Platform.OS === "ios" ? 88 : 70,
    backgroundColor: AppColors.surface,
    borderTopWidth: 1,
    borderTopColor: AppColors.line,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 10,
    shadowColor: AppColors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3,
  },
  tabItem: {
    paddingVertical: 4,
  },
});