import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SafetyTips } from "@/components/SafetyTips";
import { openLegal } from "@/constants/legal";
import { useColors } from "@/hooks/useColors";

/** Profile > Privacy & Safety: the safety tips and how to report or block. */
export default function SafetyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Privacy & Safety</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
        <Text style={[styles.h2, { color: colors.foreground }]}>Dating safely on Gentoo</Text>
        <SafetyTips />

        <Text style={[styles.h2, { color: colors.foreground }]}>Reporting and blocking</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>
            In any chat, tap the menu (•••) to report, block or unmatch someone. You can also report a person from
            their profile, and report a note someone sent with a pebble. Reporting someone also blocks them, so
            you won't see each other again.
          </Text>
        </View>

        <Text style={[styles.h2, { color: colors.foreground }]}>Legal</Text>
        <View style={[styles.card, styles.links, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {([
            ["terms", "Terms of Service"],
            ["privacy", "Privacy Policy"],
            ["guidelines", "Community Guidelines"],
          ] as const).map(([page, label], i) => (
            <TouchableOpacity
              key={page}
              onPress={() => openLegal(page)}
              style={[styles.linkRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
              accessibilityRole="link"
            >
              <Text style={[styles.linkText, { color: colors.foreground }]}>{label}</Text>
              <Feather name="external-link" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 20, gap: 14 },
  h2: { fontSize: 18, fontWeight: "800", marginTop: 6 },
  card: { borderRadius: 14, borderWidth: 1, padding: 14 },
  body: { fontSize: 14, lineHeight: 20 },
  links: { paddingVertical: 0 },
  linkRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 48 },
  linkText: { fontSize: 15, fontWeight: "600" },
});
