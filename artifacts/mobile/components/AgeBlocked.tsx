import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

/** Shown instead of the app when the phone's app store says the person is under 18. */
export function AgeBlocked() {
  const colors = useColors();
  const store = Platform.OS === "android" ? "Google Play" : "Apple";
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]} accessibilityRole="alert">
      <View style={[styles.icon, { backgroundColor: colors.ice }]}>
        <Feather name="lock" size={28} color={colors.foreground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>Gentoo is for adults only</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        You must be 18 or older to use Gentoo, and your {store} account says you're under 18.
      </Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        If that's a mistake, update the age on your {store} account, then open Gentoo again.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 14 },
  icon: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  title: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  body: { fontSize: 15, lineHeight: 22, textAlign: "center" },
});
