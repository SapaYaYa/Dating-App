import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ChallengeCard } from "@/components/ChallengeCard";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const LEVELS = ["Spark", "Flame", "Blaze", "Inferno", "Legend"];
const XP_PER_LEVEL = 500;

export default function ChallengesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { totalPoints, level, currentStreak, challenges, completeChallenge, dailyLikes, earnLikes } = useApp();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  const xpInLevel = totalPoints % XP_PER_LEVEL;
  const levelName = LEVELS[Math.min(level - 1, LEVELS.length - 1)];
  const dailyChallenges = challenges.filter((c) => c.type === "daily");
  const weeklyChallenges = challenges.filter((c) => c.type === "weekly");

  const totalPointsToday = dailyChallenges.filter((c) => c.completed).reduce((s, c) => s + c.points, 0);
  const weeklyProgress = weeklyChallenges.filter((c) => c.completed).length;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Challenges</Text>
        <View style={[styles.streakBadge, { backgroundColor: colors.gold + "22" }]}>
          <Feather name="zap" size={14} color={colors.gold} />
          <Text style={[styles.streakText, { color: colors.gold }]}>{currentStreak} day streak</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}>
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.levelRow}>
            <View style={styles.levelInfo}>
              <Text style={[styles.levelBadge, { backgroundColor: colors.primary, color: colors.primaryForeground } as any]}>
                Lv. {level}
              </Text>
              <Text style={[styles.levelName, { color: colors.foreground }]}>{levelName}</Text>
            </View>
            <View style={styles.pointsInfo}>
              <Text style={[styles.pointsValue, { color: colors.foreground }]}>{totalPoints.toLocaleString()}</Text>
              <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>total XP</Text>
            </View>
          </View>

          <View style={styles.xpRow}>
            <View style={[styles.xpTrack, { backgroundColor: colors.secondary }]}>
              <View
                style={[
                  styles.xpFill,
                  { width: `${(xpInLevel / XP_PER_LEVEL) * 100}%` as any, backgroundColor: colors.gold },
                ]}
              />
            </View>
            <Text style={[styles.xpLabel, { color: colors.mutedForeground }]}>
              {xpInLevel}/{XP_PER_LEVEL} XP to Lv.{level + 1}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{dailyLikes}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Likes left</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{totalPointsToday}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Today's XP</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{weeklyProgress}/{weeklyChallenges.length}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Weekly done</Text>
            </View>
          </View>
        </View>

        <View style={[styles.earnSection, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" }]}>
          <View style={styles.earnRow}>
            <Feather name="heart" size={16} color={colors.accent} />
            <Text style={[styles.earnText, { color: colors.accent }]}>
              Earn +5 likes by completing challenges
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Daily Challenges</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Resets midnight</Text>
          </View>
          {dailyChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onComplete={() => {
                completeChallenge(challenge.id);
                earnLikes(challenge.id === "c3" ? 3 : 1);
              }}
            />
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Weekly Challenges</Text>
            <Text style={[styles.sectionSub, { color: colors.mutedForeground }]}>Resets Wednesday</Text>
          </View>
          {weeklyChallenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onComplete={() => {
                completeChallenge(challenge.id);
                earnLikes(challenge.id === "c6" ? 15 : challenge.id === "c9" ? 1 : 2);
              }}
            />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800" },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: { fontSize: 13, fontWeight: "700" },
  scroll: { paddingHorizontal: 20, gap: 20, paddingTop: 4 },
  statsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
  } as any,
  levelName: { fontSize: 18, fontWeight: "700" },
  pointsInfo: { alignItems: "flex-end" },
  pointsValue: { fontSize: 22, fontWeight: "800" },
  pointsLabel: { fontSize: 12 },
  xpRow: { gap: 6 },
  xpTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  xpFill: { height: "100%", borderRadius: 4 },
  xpLabel: { fontSize: 12 },
  statsRow: { flexDirection: "row", alignItems: "center" },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "700" },
  statLabel: { fontSize: 12 },
  statDivider: { width: 1, height: 40 },
  earnSection: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  earnRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  earnText: { fontSize: 13, fontWeight: "500" },
  section: { gap: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  sectionSub: { fontSize: 12 },
});
