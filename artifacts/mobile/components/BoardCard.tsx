import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Board } from "@/constants/mockData";

interface Props {
  board: Board;
  compact?: boolean;
}

export function BoardCard({ board, compact }: Props) {
  const colors = useColors();
  const [joined, setJoined] = useState(false);

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compact, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.8}
      >
        <Text style={styles.emoji}>{board.emoji}</Text>
        <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>
          {board.title}
        </Text>
        <Text style={[styles.compactMembers, { color: colors.mutedForeground }]}>
          {(board.members / 1000).toFixed(1)}k
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={styles.bigEmoji}>{board.emoji}</Text>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.foreground }]}>{board.title}</Text>
            {board.trending && (
              <View style={[styles.trendBadge, { backgroundColor: colors.accent + "22" }]}>
                <Feather name="trending-up" size={10} color={colors.accent} />
                <Text style={[styles.trendText, { color: colors.accent }]}>Trending</Text>
              </View>
            )}
          </View>
          <Text style={[styles.desc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {board.description}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Feather name="users" size={11} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                {board.members.toLocaleString()}
              </Text>
            </View>
            <View style={styles.stat}>
              <Feather name="message-square" size={11} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>
                {board.posts} posts
              </Text>
            </View>
          </View>
        </View>
      </View>
      <TouchableOpacity
        onPress={() => setJoined(!joined)}
        style={[
          styles.joinBtn,
          { backgroundColor: joined ? colors.secondary : colors.primary },
        ]}
        activeOpacity={0.8}
      >
        <Text style={[styles.joinText, { color: joined ? colors.foreground : colors.primaryForeground }]}>
          {joined ? "Joined" : "Join"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    gap: 12,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  bigEmoji: {
    fontSize: 32,
    marginTop: 2,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  trendBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  trendText: {
    fontSize: 10,
    fontWeight: "600",
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 2,
  },
  stat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  joinBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  joinText: {
    fontSize: 14,
    fontWeight: "600",
  },
  compact: {
    width: 120,
    borderRadius: 14,
    padding: 12,
    marginRight: 10,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  emoji: {
    fontSize: 28,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  compactMembers: {
    fontSize: 11,
  },
});
