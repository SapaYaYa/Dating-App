import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GhostIcon } from "@/components/GhostIcon";
import { SLOW_REPLY_RULE } from "@/constants/replyBadge";
import { useReplyStatus } from "@/context/ReplyStatusContext";
import { useColors } from "@/hooks/useColors";

/** The user's own badge or warning, shown on their profile. Hidden when clear. */
export function ReplyStatusCard() {
  const colors = useColors();
  const { status, unanswered, messagedMatches, repliesToClear } = useReplyStatus();

  if (status === "clear") return null;

  const isBadge = status === "badge";
  const pct = messagedMatches > 0 ? Math.round((unanswered / messagedMatches) * 100) : 0;
  const thresholdPct = Math.round(SLOW_REPLY_RULE.BADGE_MIN_SHARE * 100);

  return (
    <View style={[styles.card, { backgroundColor: colors.slowReplyBg }]}>
      <View style={styles.header}>
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isBadge ? colors.slowReply : colors.background },
          ]}
        >
          <GhostIcon size={19} color={isBadge ? "#fff" : colors.slowReply} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.slowReplyTitle }]}>
            {isBadge ? "Slow to reply" : `${unanswered} matches are waiting on you`}
          </Text>
          <Text style={[styles.subtitle, { color: colors.slowReplyText }]}>
            {isBadge ? "Your matches can see this badge" : "Reply or unmatch to avoid the badge"}
          </Text>
        </View>
      </View>

      <View style={[styles.stats, { backgroundColor: colors.background }]}>
        <Text style={[styles.statsLabel, { color: colors.mutedForeground }]}>LAST 2 WEEKS</Text>
        <Text style={[styles.statsLine, { color: colors.foreground }]}>
          {unanswered} of {messagedMatches} matches unanswered ({pct}%)
        </Text>
        <View style={[styles.track, { backgroundColor: colors.secondary }]}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: colors.slowReply }]} />
          <View style={[styles.marker, { left: `${thresholdPct}%`, backgroundColor: colors.foreground }]} />
        </View>
        <Text style={[styles.statsHint, { color: colors.mutedForeground }]}>
          The line marks {thresholdPct}%. The badge applies above it with{" "}
          {SLOW_REPLY_RULE.BADGE_MIN_UNANSWERED} or more unanswered.
        </Text>
      </View>

      {isBadge && (
        <Text style={[styles.todo, { color: colors.slowReplyText }]}>
          To remove it, reply to {repliesToClear} more {repliesToClear === 1 ? "match" : "matches"}, or
          unmatch.
        </Text>
      )}

      <TouchableOpacity
        onPress={() => router.push("/waiting")}
        style={[styles.button, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
      >
        <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>See matches</Text>
      </TouchableOpacity>
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
  stats: { borderRadius: 12, padding: 12, gap: 8 },
  statsLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 0.4 },
  statsLine: { fontSize: 15, fontWeight: "600" },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  marker: { position: "absolute", top: 0, bottom: 0, width: 2 },
  statsHint: { fontSize: 12, lineHeight: 17 },
  todo: { fontSize: 14, lineHeight: 20 },
  button: { height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  buttonText: { fontSize: 15, fontWeight: "600" },
});
