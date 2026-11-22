import { Feather } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HELP_SECTIONS, SUPPORT_EMAIL } from "@/constants/help";
import { useColors } from "@/hooks/useColors";

/** Profile > Help & Support: common questions and a way to email us. */
export default function HelpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [open, setOpen] = useState<string | null>(null);

  const appVersion = Constants.expoConfig?.version ?? "unknown";

  const contact = () => {
    const subject = "Gentoo help";
    const body = `\n\n---\nApp version ${appVersion} (${Platform.OS})`;
    Linking.openURL(
      `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    ).catch(() => {});
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Help & Support</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
        {HELP_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.h2, { color: colors.foreground }]}>{section.title}</Text>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.topics.map((topic, i) => {
                const expanded = open === topic.question;
                return (
                  <View
                    key={topic.question}
                    style={i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}
                  >
                    <TouchableOpacity
                      onPress={() => setOpen(expanded ? null : topic.question)}
                      style={styles.qRow}
                      accessibilityRole="button"
                      accessibilityState={{ expanded }}
                    >
                      <Text style={[styles.question, { color: colors.foreground }]}>{topic.question}</Text>
                      <Feather name={expanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
                    </TouchableOpacity>
                    {expanded && (
                      <Text style={[styles.answer, { color: colors.mutedForeground }]}>{topic.answer}</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={[styles.contact, { backgroundColor: colors.ice }]}>
          <Text style={[styles.h2, { color: colors.foreground }]}>Still need help?</Text>
          <Text style={[styles.body, { color: colors.foreground }]}>
            Email us at {SUPPORT_EMAIL} and we'll get back to you. To report someone, use the menu (•••) in your
            chat or on their profile instead, so we can act on it faster.
          </Text>
          <TouchableOpacity
            onPress={contact}
            style={[styles.btn, { backgroundColor: colors.brand }]}
            accessibilityRole="button"
          >
            <Feather name="mail" size={16} color={colors.brandForeground} />
            <Text style={[styles.btnText, { color: colors.brandForeground }]}>Contact us</Text>
          </TouchableOpacity>
          <Text style={[styles.version, { color: colors.mutedForeground }]}>Gentoo version {appVersion}</Text>
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
  scroll: { padding: 20, gap: 18 },
  section: { gap: 8 },
  h2: { fontSize: 18, fontWeight: "800" },
  card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  qRow: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50, paddingVertical: 10 },
  question: { flex: 1, fontSize: 15, fontWeight: "600" },
  answer: { fontSize: 14, lineHeight: 20, paddingBottom: 14 },
  contact: { borderRadius: 14, padding: 16, gap: 10 },
  body: { fontSize: 14, lineHeight: 20 },
  btn: { flexDirection: "row", gap: 8, borderRadius: 999, minHeight: 48, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 15, fontWeight: "800" },
  version: { fontSize: 12, textAlign: "center" },
});
