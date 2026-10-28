import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { CHAT_RATING_OPTIONS, type ChatRating } from "@/constants/greatChat";
import { useColors } from "@/hooks/useColors";

interface Props {
  name: string;
  /** Set once answered, to show a thank-you in place of the options. */
  answered: boolean;
  onRate: (rating: ChatRating) => void;
  onSkip: () => void;
}

/** "How's your conversation going?" Asked inside the chat, never as a pop-up. */
export function ChatRatingCard({ name, answered, onRate, onSkip }: Props) {
  const colors = useColors();

  if (answered) {
    return (
      <View style={[styles.card, styles.thanks, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Feather name="check-circle" size={16} color={colors.green} />
        <Text style={[styles.thanksText, { color: colors.mutedForeground }]}>
          Thanks! {name} won't see your answer.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.foreground }]}>
        How's your conversation with {name} going?
      </Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
        {name} won't see your answer.
      </Text>
      <View style={styles.options}>
        {CHAT_RATING_OPTIONS.map((o) => (
          <TouchableOpacity
            key={o.value}
            onPress={() => onRate(o.value)}
            style={[styles.option, { backgroundColor: colors.background, borderColor: colors.border }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`${o.label}: ${o.description}`}
          >
            <Text style={[styles.optionLabel, { color: colors.foreground }]}>{o.label}</Text>
            <Text style={[styles.optionDescription, { color: colors.mutedForeground }]}>
              {o.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity onPress={onSkip} style={styles.skip} accessibilityRole="button">
        <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Not now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 6, marginBottom: 12 },
  title: { fontSize: 15, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  options: { gap: 8, marginTop: 6 },
  option: { borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 12, gap: 2 },
  optionLabel: { fontSize: 15, fontWeight: "600" },
  optionDescription: { fontSize: 13 },
  skip: { alignSelf: "center", height: 40, justifyContent: "center", paddingHorizontal: 16 },
  skipText: { fontSize: 14, fontWeight: "500" },
  thanks: { flexDirection: "row", alignItems: "center", gap: 8 },
  thanksText: { fontSize: 14, flex: 1 },
});
