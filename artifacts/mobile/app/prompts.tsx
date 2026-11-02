import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PromptsEditor, emptyPrompts } from "@/components/PromptsEditor";
import { PROMPT_RULES, promptsComplete, type PromptAnswer } from "@/constants/prompts";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

/** Edit your 3 prompt answers. All 3 must stay answered. */
export default function PromptsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [prompts, setPrompts] = useState<PromptAnswer[]>(() => {
    const current = (user?.prompts ?? []).slice(0, PROMPT_RULES.COUNT);
    return [...current, ...emptyPrompts()].slice(0, PROMPT_RULES.COUNT);
  });
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const complete = promptsComplete(prompts);

  const save = () => {
    if (!complete) return;
    updateUser({ prompts: prompts.map((p) => ({ question: p.question, answer: p.answer.trim() })) });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>My prompts</Text>
      </View>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
        <Text style={[styles.intro, { color: colors.mutedForeground }]}>
          People can like each answer and send a note about it. All 3 need an answer.
        </Text>
        <PromptsEditor value={prompts} onChange={setPrompts} />
      </ScrollView>
      <View style={[styles.footer, { borderTopColor: colors.border, paddingBottom: insets.bottom + 20, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={save}
          disabled={!complete}
          style={[styles.save, { backgroundColor: colors.primary, opacity: complete ? 1 : 0.4 }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 20, gap: 14 },
  intro: { fontSize: 14, lineHeight: 20 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  save: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveText: { fontSize: 16, fontWeight: "600" },
});
