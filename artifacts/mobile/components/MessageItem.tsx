import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GhostBadgeDot } from "@/components/GhostIcon";
import { GreatChatDot, hasGreatChatBadge } from "@/components/GreatChatBadge";
import { hasSlowToReplyBadge } from "@/components/SlowToReplyNotice";
import { useColors } from "@/hooks/useColors";
import type { Match } from "@/constants/mockData";

interface Props {
  match: Match;
  onPress: () => void;
}

export function MessageItem({ match, onPress }: Props) {
  const colors = useColors();
  const hasUnread = match.unreadCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.container, { borderBottomColor: colors.border }]}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <Image source={{ uri: match.profile.images[0] }} style={styles.avatar} />
        {hasSlowToReplyBadge(match.profile.badges) ? (
          <GhostBadgeDot />
        ) : hasGreatChatBadge(match.profile.badges) ? (
          <GreatChatDot />
        ) : (
          <View style={[styles.onlineDot, { backgroundColor: colors.green }]} />
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.foreground, fontWeight: hasUnread ? "700" : "600" }]}>
            {match.profile.name}
          </Text>
          <Text style={[styles.time, { color: colors.mutedForeground }]}>{match.lastMessageTime}</Text>
        </View>

        <View style={styles.row}>
          {match.hasIceBreaker ? (
            <Text style={[styles.iceBreaker, { color: colors.accent }]}>Send an ice-breaker</Text>
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.lastMessage, { color: hasUnread ? colors.foreground : colors.mutedForeground, fontWeight: hasUnread ? "600" : "400" }]}
            >
              {match.lastMessage}
            </Text>
          )}
          {hasUnread && (
            <View style={[styles.badge, { backgroundColor: colors.accent }]}>
              <Text style={styles.badgeText}>{match.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  name: {
    fontSize: 15,
  },
  time: {
    fontSize: 12,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  iceBreaker: {
    fontSize: 14,
    fontWeight: "500",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },
});
