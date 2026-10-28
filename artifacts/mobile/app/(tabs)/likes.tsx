import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MOCK_PROFILES } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";
import { getHiddenProfileIds } from "@/utils/hiddenProfiles";
import { formatDistance } from "@/utils/distance";

const INITIAL_LIKES = MOCK_PROFILES.filter((p) => p.likesYou);

export default function LikesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [pendingLikes, setPendingLikes] = useState(INITIAL_LIKES);
  const [blocksLoaded, setBlocksLoaded] = useState(false);
  const [matchedName, setMatchedName] = useState("");
  const [matchedNote, setMatchedNote] = useState("");
  const [showMatch, setShowMatch] = useState(false);
  const matchAnim = useRef(new Animated.Value(0)).current;

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setBlocksLoaded(false);

      getHiddenProfileIds().then((blockedProfileIds) => {
        if (cancelled) return;
        const blocked = new Set(blockedProfileIds);
        setPendingLikes((profiles) =>
          profiles.filter((profile) => !blocked.has(profile.id)),
        );
        setBlocksLoaded(true);
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const handleLikeBack = (profileId: string, name: string, note?: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setPendingLikes((prev) => prev.filter((p) => p.id !== profileId));
    setMatchedName(name);
    setMatchedNote(note ?? "");
    setShowMatch(true);
    Animated.spring(matchAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
  };

  const handlePass = (profileId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPendingLikes((prev) => prev.filter((p) => p.id !== profileId));
  };

  const dismissMatch = () => {
    Animated.timing(matchAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowMatch(false);
      matchAnim.setValue(0);
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Likes You</Text>
        {blocksLoaded && pendingLikes.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
            <Text style={styles.countText}>{pendingLikes.length}</Text>
          </View>
        )}
      </View>

      {!blocksLoaded ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            Loading likes…
          </Text>
        </View>
      ) : pendingLikes.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={52} color={colors.border} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No new likes yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            When someone likes your profile you'll see them here
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.grid, { paddingBottom: bottomPad }]}
        >
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {pendingLikes.length} {pendingLikes.length === 1 ? "person" : "people"} liked your profile — like back to match!
          </Text>
          <View style={styles.gridRow}>
            {pendingLikes.map((profile) => (
              <View
                key={profile.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <TouchableOpacity
                  activeOpacity={0.92}
                  onPress={() => router.push(`/profile/${profile.id}`)}
                >
                  <Image source={{ uri: profile.images[0] }} style={styles.photo} />
                  {profile.verified && (
                    <View style={styles.verifiedBadge}>
                      <Feather name="check-circle" size={12} color="#fff" />
                    </View>
                  )}
                  {profile.likeNote && (
                    <View style={[styles.noteWrap, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
                      <Feather name="heart" size={10} color={colors.accent} />
                      <Text style={styles.noteText} numberOfLines={2}>
                        "{profile.likeNote}"
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.info}>
                  <Text style={[styles.name, { color: colors.foreground }]}>
                    {profile.name}, {profile.age}
                  </Text>
                  <Text style={[styles.distance, { color: colors.mutedForeground }]}>
                    {formatDistance(profile.distance)}
                  </Text>
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.passBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                    onPress={() => handlePass(profile.id)}
                    activeOpacity={0.8}
                  >
                    <Feather name="x" size={20} color={colors.mutedForeground} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.likeBtn, { backgroundColor: colors.accent }]}
                    onPress={() => handleLikeBack(profile.id, profile.name, profile.matchNote)}
                    activeOpacity={0.8}
                  >
                    <Feather name="heart" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {showMatch && (
        <Animated.View
          style={[
            styles.matchOverlay,
            {
              opacity: matchAnim,
              transform: [
                { scale: matchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
              ],
            },
          ]}
        >
          <View style={[styles.matchCard, { backgroundColor: colors.card }]}>
            <View style={[styles.matchIconWrap, { backgroundColor: colors.accent + "18" }]}>
              <Feather name="heart" size={36} color={colors.accent} />
            </View>
            <Text style={[styles.matchTitle, { color: colors.foreground }]}>It's a Match!</Text>
            <Text style={[styles.matchSub, { color: colors.mutedForeground }]}>
              You and {matchedName} both liked each other
            </Text>
            {matchedNote ? (
              <View style={[styles.matchNoteCard, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.matchNoteText, { color: colors.foreground }]}>"{matchedNote}"</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.matchBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                dismissMatch();
                router.push("/(tabs)/matches");
              }}
              activeOpacity={0.85}
            >
              <Text style={[styles.matchBtnText, { color: colors.primaryForeground }]}>
                Send a Message
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={dismissMatch} style={{ marginTop: 12 }}>
              <Text style={[styles.matchKeep, { color: colors.mutedForeground }]}>
                Keep browsing
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800" },
  countBadge: {
    minWidth: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  subtitle: { fontSize: 13, marginBottom: 16, lineHeight: 18 },
  grid: { padding: 16, gap: 12 },
  gridRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
  },
  photo: { width: "100%", height: 200, resizeMode: "cover" },
  verifiedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 4,
    alignItems: "flex-start",
    padding: 8,
  },
  noteText: {
    color: "#fff",
    fontSize: 10,
    fontStyle: "italic",
    flex: 1,
    lineHeight: 14,
  },
  info: { padding: 10, paddingBottom: 6 },
  name: { fontSize: 14, fontWeight: "700" },
  distance: { fontSize: 11, marginTop: 2 },
  actions: {
    flexDirection: "row",
    gap: 8,
    padding: 10,
    paddingTop: 0,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  passBtn: { borderWidth: 1 },
  likeBtn: {},
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 22, fontWeight: "700", textAlign: "center" },
  emptySub: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  matchCard: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    gap: 8,
  },
  matchIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  matchTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  matchSub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  matchNoteCard: {
    borderRadius: 12,
    padding: 14,
    width: "100%",
    alignItems: "center",
  },
  matchNoteText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
  matchBtn: {
    marginTop: 16,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  matchBtnText: { fontSize: 16, fontWeight: "700" },
  matchKeep: { fontSize: 14 },
});
