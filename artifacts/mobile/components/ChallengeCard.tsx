import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import type { Challenge } from "@/constants/mockData";

interface Props {
  challenge: Challenge;
  onComplete?: () => void;
}

export function ChallengeCard({ challenge, onComplete }: Props) {
  const colors = useColors();
  const progressPct = (challenge.progress / challenge.total) * 100;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: challenge.completed ? colors.green : colors.border,
          borderWidth: challenge.completed ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconBg, { backgroundColor: challenge.completed ? colors.green + "22" : colors.secondary }]}>
          <Feather
            name={challenge.icon as any}
            size={18}
            color={challenge.completed ? colors.green : colors.mutedForeground}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.foreground }]}>{challenge.title}</Text>
          <Text style={[styles.desc, { color: colors.mutedForeground }]}>{challenge.description}</Text>
        </View>
        <View style={[styles.pointsBadge, { backgroundColor: colors.gold + "22" }]}>
          <Feather name="star" size={10} color={colors.gold} />
          <Text style={[styles.pointsText, { color: colors.gold }]}>{challenge.points}</Text>
        </View>
      </View>

      <View style={styles.progressRow}>
        <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressPct}%` as any,
                backgroundColor: challenge.completed ? colors.green : colors.primary,
              },
            ]}
          />
        </View>
        <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
          {challenge.progress}/{challenge.total}
        </Text>
      </View>

      {!challenge.completed && challenge.progress < challenge.total && onComplete && (
        <TouchableOpacity
          onPress={onComplete}
          style={[styles.claimBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.8}
        >
          <Text style={[styles.claimText, { color: colors.primaryForeground }]}>Mark Complete</Text>
        </TouchableOpacity>
      )}

      {challenge.completed && (
        <View style={styles.completedRow}>
          <Feather name="check-circle" size={14} color={colors.green} />
          <Text style={[styles.completedText, { color: colors.green }]}>Completed · +{challenge.points} pts</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  desc: {
    fontSize: 13,
  },
  pointsBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
    width: 32,
    textAlign: "right",
  },
  claimBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  claimText: {
    fontSize: 13,
    fontWeight: "600",
  },
  completedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  completedText: {
    fontSize: 13,
    fontWeight: "500",
  },
});
