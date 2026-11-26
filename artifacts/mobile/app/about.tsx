import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GentooPair } from "@/components/Gentoo";
import { STORY_PARAGRAPHS, STORY_TITLE } from "@/constants/story";
import { useColors } from "@/hooks/useColors";

/** "Why Gentoo?": the story behind the name and the penguin. */
export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Why Gentoo?</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
        <View style={styles.art}>
          <GentooPair size={180} />
        </View>
        <Text style={[styles.h2, { color: colors.foreground }]} accessibilityRole="header">
          {STORY_TITLE}
        </Text>
        {STORY_PARAGRAPHS.map((p) => (
          <Text key={p} style={[styles.body, { color: colors.mutedForeground }]}>
            {p}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 24, gap: 14, alignItems: "center" },
  art: { marginVertical: 12 },
  h2: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  body: { fontSize: 17, lineHeight: 26, textAlign: "center", maxWidth: 360 },
});
