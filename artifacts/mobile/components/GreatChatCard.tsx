import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GREAT_CHAT_RULE } from "@/constants/greatChat";
import { useReplyStatus } from "@/context/ReplyStatusContext";
import { useColors } from "@/hooks/useColors";

/** The user's own Great Chat badge on their profile. Hidden when not earned. */
export function GreatChatCard() {
  const colors = useColors();
  const { greatChat } = useReplyStatus();

  if (!greatChat.earned) return null;

  const rows = [
    {
      label: `Replied within ${GREAT_CHAT_RULE.TIMELY_REPLY_HOURS} hours, last 2 weeks`,
      value: `${Math.round(greatChat.timelyReplyRate * 100)}%`,
    },
    {
      label: `Conversations with ${GREAT_CHAT_RULE.LONG_MIN_MESSAGES}+ messages`,
      value: String(greatChat.longConversations),
    },
    {
      label: "Matches who said Great, last 30 days",
      value: `${greatChat.greatRatings} of ${greatChat.raters}`,
    },
  ];

  return (
    <View style={[styles.card, { backgroundColor: colors.greatChatBg }]}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
          <Feather name="message-square" size={17} color={colors.greatChat} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.greatChat }]}>Great Chat</Text>
          <Text style={[styles.subtitle, { color: colors.greatChatText }]}>
            Everyone sees this badge on your profile
          </Text>
        </View>
      </View>
      <View style={[styles.stats, { backgroundColor: colors.background }]}>
        {rows.map((r) => (
          <View key={r.label} style={styles.row}>
            <Text style={[styles.rowLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
            <Text style={[styles.rowValue, { color: colors.foreground }]}>{r.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 16, gap: 12 },
  header: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  subtitle: { fontSize: 13 },
  stats: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, gap: 12 },
  rowLabel: { fontSize: 13, flex: 1 },
  rowValue: { fontSize: 15, fontWeight: "700", fontVariant: ["tabular-nums"] },
});
