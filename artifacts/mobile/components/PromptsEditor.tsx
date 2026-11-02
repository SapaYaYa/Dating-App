import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PROMPT_LIST, PROMPT_RULES, type PromptAnswer } from "@/constants/prompts";
import { useColors } from "@/hooks/useColors";

/** Always 3 slots; an empty question means the slot hasn't been picked yet. */
export function emptyPrompts(): PromptAnswer[] {
  return Array.from({ length: PROMPT_RULES.COUNT }, () => ({ question: "", answer: "" }));
}

interface Props {
  value: PromptAnswer[];
  onChange: (value: PromptAnswer[]) => void;
}

/** Pick 3 prompts from the list and answer each. Used at sign-up and on Profile. */
export function PromptsEditor({ value, onChange }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [picking, setPicking] = useState<number | null>(null);
  const slots = Array.from({ length: PROMPT_RULES.COUNT }, (_, i) => value[i] ?? { question: "", answer: "" });
  const used = slots.map((s) => s.question).filter(Boolean);

  const update = (index: number, change: Partial<PromptAnswer>) =>
    onChange(slots.map((s, i) => (i === index ? { ...s, ...change } : s)));

  return (
    <View style={styles.slots}>
      {slots.map((slot, i) =>
        slot.question ? (
          <View key={i} style={[styles.filled, { borderColor: colors.border }]}>
            <View style={styles.filledHeader}>
              <Text style={[styles.question, { color: colors.foreground }]}>{slot.question}</Text>
              <TouchableOpacity onPress={() => setPicking(i)} style={styles.change} accessibilityLabel={`Change prompt ${i + 1}`}>
                <Text style={[styles.changeText, { color: colors.mutedForeground }]}>Change</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
              placeholder="Write your answer..."
              placeholderTextColor={colors.mutedForeground}
              value={slot.answer}
              onChangeText={(t) => update(i, { answer: t.slice(0, PROMPT_RULES.ANSWER_MAX) })}
              maxLength={PROMPT_RULES.ANSWER_MAX}
              multiline
              accessibilityLabel={`Your answer to: ${slot.question}`}
            />
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {slot.answer.length}/{PROMPT_RULES.ANSWER_MAX}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            key={i}
            onPress={() => setPicking(i)}
            style={[styles.empty, { borderColor: colors.border, backgroundColor: colors.card }]}
            activeOpacity={0.8}
          >
            <View style={[styles.plus, { backgroundColor: colors.primary }]}>
              <Feather name="plus" size={16} color={colors.primaryForeground} />
            </View>
            <View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Select a prompt</Text>
              <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
                Prompt {i + 1} of {PROMPT_RULES.COUNT}
              </Text>
            </View>
          </TouchableOpacity>
        ),
      )}

      <Modal transparent animationType="slide" visible={picking !== null} onRequestClose={() => setPicking(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPicking(null)} accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <Text style={[styles.sheetTitle, { color: colors.foreground }]}>Choose a prompt</Text>
          <ScrollView>
            {PROMPT_LIST.filter((q) => !used.includes(q)).map((q) => (
              <TouchableOpacity
                key={q}
                onPress={() => {
                  if (picking !== null) update(picking, { question: q, answer: slots[picking].question === q ? slots[picking].answer : "" });
                  setPicking(null);
                }}
                style={[styles.choice, { borderBottomColor: colors.border }]}
              >
                <Text style={[styles.choiceText, { color: colors.foreground }]}>{q}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  slots: { gap: 12 },
  empty: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1.5, borderStyle: "dashed", borderRadius: 16, padding: 18 },
  plus: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 15, fontWeight: "700" },
  emptySub: { fontSize: 13 },
  filled: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 8 },
  filledHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  question: { flex: 1, fontSize: 14, fontWeight: "700" },
  change: { height: 32, paddingHorizontal: 8, justifyContent: "center" },
  changeText: { fontSize: 13, fontWeight: "600" },
  input: { minHeight: 72, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, textAlignVertical: "top" },
  count: { alignSelf: "flex-end", fontSize: 12 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { maxHeight: "75%", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12 },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3 },
  sheetTitle: { fontSize: 20, fontWeight: "800", marginHorizontal: 20, marginTop: 12, marginBottom: 8 },
  choice: { minHeight: 52, justifyContent: "center", paddingHorizontal: 20, borderBottomWidth: StyleSheet.hairlineWidth },
  choiceText: { fontSize: 15 },
});
