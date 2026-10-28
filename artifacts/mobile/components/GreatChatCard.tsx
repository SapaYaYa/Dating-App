import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useReplyStatus } from "@/context/ReplyStatusContext";
import { useColors } from "@/hooks/useColors";

/**
 * The user's own Great Chat badge on their profile. Hidden when not earned.
 * Deliberately shows no numbers: they would reveal the rule and let people
 * work out who rated their conversation less than Great.
 */
export function GreatChatCard() {
  const colors = useColors();
  const { greatChat } = useReplyStatus();

  if (!greatChat.earned) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.greatChatBg }]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
        <Feather name="message-square" size={17} color={colors.greatChat} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.greatChat }]}>Great Chat</Text>
        <Text style={[styles.body, { color: colors.greatChatText }]}>
          Your matches say they enjoy talking with you. Everyone sees this badge on your profile.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 16, fontWeight: "700" },
  body: { fontSize: 14, lineHeight: 20 },
});
