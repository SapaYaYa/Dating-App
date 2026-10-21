import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColorScheme } from "react-native";

import { ReplyStatusSheet } from "@/components/ReplyStatusSheet";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 68,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
      }}
    >
      {/* Redirect-only route; keep it reachable but out of the tab bar. */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen
        name="discover"
        options={{
          tabBarIcon: ({ color }) => <Feather name="layers" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="likes"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Feather name={focused ? "heart" : "heart"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          tabBarIcon: ({ color }) => <Feather name="message-circle" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          tabBarIcon: ({ color }) => <Feather name="users" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          tabBarIcon: ({ color }) => <Feather name="award" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
        }}
      />
    </Tabs>
    <ReplyStatusSheet />
    </>
  );
}
