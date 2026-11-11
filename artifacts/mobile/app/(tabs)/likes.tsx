import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GentooPair, Gus, Pebble } from "@/components/Gentoo";
import { ProfileScroll } from "@/components/ProfileScroll";
import { ReportNoteSheet } from "@/components/ReportNoteSheet";
import { MOCK_CITY_PROFILES, MOCK_PROFILES, type Profile } from "@/constants/mockData";
import type { LikeTarget } from "@/constants/prompts";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";
import { formatProfileDistance } from "@/utils/discoverFilters";
import { getHiddenProfileIds } from "@/utils/hiddenProfiles";

// Likes come from any distance, including people in other cities.
const INITIAL_LIKES = [...MOCK_PROFILES, ...MOCK_CITY_PROFILES].filter((p) => p.likesYou);
const LOCAL_IDS = new Set(MOCK_PROFILES.map((p) => p.id));

// Likes whose note the user reported. Kept on the phone until reports reach
// the server for review.
const REPORTED_NOTES_KEY = "spark_reported_like_notes";

export default function LikesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [pendingLikes, setPendingLikes] = useState(INITIAL_LIKES);
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState<Profile | null>(null);
  const [matched, setMatched] = useState<Profile | null>(null);
  const [reporting, setReporting] = useState<Profile | null>(null);
  const [notice, setNotice] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  // Blocked or unmatched people, and likes whose note was reported, are hidden.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      Promise.all([getHiddenProfileIds(), AsyncStorage.getItem(REPORTED_NOTES_KEY).catch(() => null)]).then(
        ([hiddenIds, rawReported]) => {
          if (cancelled) return;
          let reported: string[] = [];
          try {
            const parsed: unknown = rawReported ? JSON.parse(rawReported) : [];
            if (Array.isArray(parsed)) reported = parsed.filter((x): x is string => typeof x === "string");
          } catch {}
          setPendingLikes((likes) => likes.filter((p) => !hiddenIds.includes(p.id) && !reported.includes(p.id)));
          setLoaded(true);
        },
      );
      return () => {
        cancelled = true;
      };
    }, []),
  );

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(t);
  }, [notice]);

  const remove = (id: string) => setPendingLikes((prev) => prev.filter((p) => p.id !== id));

  const likeBack = (profile: Profile) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    remove(profile.id);
    setOpen(null);
    setMatched(profile);
  };

  const pass = (profile: Profile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    remove(profile.id);
    setOpen(null);
  };

  const reportNote = async (profile: Profile) => {
    setReporting(null);
    remove(profile.id);
    setNotice(`Thanks. We'll review ${profile.name}'s note, and it's hidden for you.`);
    try {
      const raw = await AsyncStorage.getItem(REPORTED_NOTES_KEY);
      const list: string[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem(REPORTED_NOTES_KEY, JSON.stringify([...list, profile.id]));
    } catch {}
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Pebbles</Text>
        {loaded && pendingLikes.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.countText, { color: colors.accentForeground }]}>{pendingLikes.length}</Text>
          </View>
        )}
      </View>

      {notice ? (
        <View style={[styles.notice, { backgroundColor: colors.secondary }]} accessibilityLiveRegion="polite">
          <Text style={[styles.noticeText, { color: colors.foreground }]}>{notice}</Text>
        </View>
      ) : null}

      {!loaded ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>Loading pebbles…</Text>
        </View>
      ) : pendingLikes.length === 0 ? (
        <View style={styles.emptyState}>
          <Gus size={140} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No pebbles yet</Text>
          <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
            When someone gives a pebble to one of your photos or answers, you'll see it here.
          </Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
        >
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Tap someone to see their profile, then give a pebble back to match.
          </Text>
          {pendingLikes.map((profile) => (
            <View key={profile.id} style={[styles.card, { borderColor: colors.border }]}>
              <TouchableOpacity onPress={() => setOpen(profile)} activeOpacity={0.8} style={styles.cardTap}>
                <View style={styles.who}>
                  <Image source={{ uri: profile.images[0] }} style={styles.avatar} />
                  <View style={styles.whoText}>
                    <Text style={[styles.name, { color: colors.foreground }]}>
                      {profile.name}, {profile.age}
                    </Text>
                    <Text style={[styles.where, { color: colors.mutedForeground }]} numberOfLines={1}>
                      Lives in {profile.homeCity}
                      {LOCAL_IDS.has(profile.id) ? ` · ${formatProfileDistance(profile)}` : ""}
                    </Text>
                  </View>
                </View>
                <LikedItem target={profile.likedTarget} images={user?.images ?? []} prompts={user?.prompts ?? []} />
              </TouchableOpacity>
              {profile.likeNote ? (
                <View style={[styles.note, { backgroundColor: colors.card }]}>
                  <Text style={[styles.noteText, { color: colors.foreground }]}>{profile.likeNote}</Text>
                  <TouchableOpacity onPress={() => setReporting(profile)} style={styles.reportLink}>
                    <Text style={[styles.reportText, { color: colors.mutedForeground }]}>Report note</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Their full profile, opened from a like. Covers the tab bar so the actions stay visible. */}
      <Modal visible={!!open} animationType="slide" onRequestClose={() => setOpen(null)}>
        {open && (
          <View style={[styles.root, { backgroundColor: colors.background }]}>
            <View style={[styles.detailHeader, { paddingTop: topPad + 8 }]}>
              <TouchableOpacity onPress={() => setOpen(null)} style={styles.backBtn} accessibilityLabel="Back to Pebbles">
                <Feather name="arrow-left" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <Text style={[styles.detailTitle, { color: colors.foreground }]}>{open.name}</Text>
            </View>
            <ScrollView contentContainerStyle={[styles.detailScroll, { paddingBottom: insets.bottom + 120 }]}>
              <View style={[styles.likedCard, { backgroundColor: colors.accent + "14" }]}>
                <LikedItem target={open.likedTarget} images={user?.images ?? []} prompts={user?.prompts ?? []} large />
                {open.likeNote ? (
                  <View style={[styles.likedNote, { backgroundColor: colors.background }]}>
                    <Text style={[styles.noteText, { color: colors.foreground }]}>{open.likeNote}</Text>
                  </View>
                ) : null}
              </View>
              <ProfileScroll profile={open} hideDistance={!LOCAL_IDS.has(open.id)} />
            </ScrollView>
            <View
              style={[
                styles.detailActions,
                { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: insets.bottom + 20 },
              ]}
            >
              <TouchableOpacity
                onPress={() => pass(open)}
                style={[styles.passBtn, { borderColor: colors.border }]}
                accessibilityLabel={`Pass on ${open.name}`}
              >
                <Feather name="x" size={24} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => likeBack(open)}
                style={[styles.likeBackBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <Pebble size={24} fill={colors.primaryForeground} heart={colors.primary} shadow={false} />
                <Text style={[styles.likeBackText, { color: colors.primaryForeground }]}>Give a pebble back</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Modal>

      <Modal transparent visible={!!matched} animationType="fade" onRequestClose={() => setMatched(null)}>
        <View style={styles.matchOverlay}>
          <View style={[styles.matchCard, { backgroundColor: colors.card }]}>
            <GentooPair size={140} />
            <Text style={[styles.matchTitle, { color: colors.foreground }]}>It's a pair!</Text>
            <Text style={[styles.matchSub, { color: colors.mutedForeground }]}>
              You and {matched?.name} both gave a pebble.
            </Text>
            {matched?.matchNote ? (
              <View style={[styles.matchNoteCard, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.matchNoteText, { color: colors.foreground }]}>"{matched.matchNote}"</Text>
              </View>
            ) : null}
            <TouchableOpacity
              style={[styles.matchBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setMatched(null);
                router.push("/(tabs)/matches");
              }}
            >
              <Text style={[styles.matchBtnText, { color: colors.primaryForeground }]}>Say hi to {matched?.name}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMatched(null)} style={styles.matchSkip}>
              <Text style={[styles.matchSkipText, { color: colors.mutedForeground }]}>Back to Pebbles</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ReportNoteSheet
        name={reporting?.name ?? null}
        onReport={() => reporting && reportNote(reporting)}
        onClose={() => setReporting(null)}
      />
    </View>
  );
}

/** Which of your photos or answers they gave a pebble to. */
function LikedItem({
  target,
  images,
  prompts,
  large,
}: {
  target?: LikeTarget;
  images: string[];
  prompts: { question: string; answer: string }[];
  large?: boolean;
}) {
  const colors = useColors();
  if (!target) return null;
  const prompt = target.kind === "prompt" ? prompts[target.index] : undefined;
  const photo = target.kind === "photo" ? images[target.index] : undefined;
  return (
    <View style={[styles.liked, large && styles.likedLarge]}>
      {photo ? <Image source={{ uri: photo }} style={large ? styles.likedPhotoLarge : styles.likedPhoto} /> : null}
      <View style={styles.likedText}>
        <Text style={[styles.likedLabel, { color: colors.accent }]}>
          {target.kind === "photo" ? "PEBBLE FOR YOUR PHOTO" : "PEBBLE FOR YOUR ANSWER"}
        </Text>
        {prompt ? (
          <>
            <Text style={[styles.likedQuestion, { color: colors.mutedForeground }]}>{prompt.question}</Text>
            <Text style={[styles.likedAnswer, { color: colors.foreground }]}>{prompt.answer}</Text>
          </>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 20, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: "800" },
  countBadge: { minWidth: 26, height: 26, borderRadius: 13, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  countText: { color: "#fff", fontSize: 13, fontWeight: "700" },
  notice: { marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12 },
  noticeText: { fontSize: 14, lineHeight: 20 },
  subtitle: { fontSize: 14, marginBottom: 4 },
  list: { paddingHorizontal: 16, gap: 12 },
  card: { borderWidth: 1, borderRadius: 18, padding: 14, gap: 12 },
  cardTap: { gap: 12 },
  who: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  whoText: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "700" },
  where: { fontSize: 13 },
  liked: { flexDirection: "row", gap: 10, alignItems: "center" },
  likedLarge: { flexDirection: "column", alignItems: "stretch" },
  likedPhoto: { width: 64, height: 80, borderRadius: 10 },
  likedPhotoLarge: { width: "100%", height: 160, borderRadius: 12 },
  likedText: { flex: 1, gap: 3 },
  likedLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.3 },
  likedQuestion: { fontSize: 13 },
  likedAnswer: { fontSize: 15, fontWeight: "600" },
  note: { borderRadius: 14, padding: 12, gap: 4 },
  noteText: { fontSize: 15, lineHeight: 21 },
  reportLink: { alignSelf: "flex-start", height: 32, justifyContent: "center" },
  reportText: { fontSize: 13, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700" },
  emptySub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  detailHeader: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingBottom: 8 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  detailTitle: { fontSize: 18, fontWeight: "700" },
  detailScroll: { paddingHorizontal: 16, gap: 14 },
  likedCard: { borderRadius: 18, padding: 14, gap: 10 },
  likedNote: { borderRadius: 12, padding: 12 },
  detailActions: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  passBtn: { width: 56, height: 56, borderRadius: 28, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  likeBackBtn: { flex: 1, height: 56, borderRadius: 28, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  likeBackText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  matchOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 24 },
  matchCard: { width: "100%", borderRadius: 24, padding: 24, alignItems: "center", gap: 10 },
  matchIconWrap: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  matchTitle: { fontSize: 28, fontWeight: "800" },
  matchSub: { fontSize: 15, textAlign: "center" },
  matchNoteCard: { borderRadius: 12, padding: 14, width: "100%" },
  matchNoteText: { fontSize: 14, fontStyle: "italic", textAlign: "center", lineHeight: 20 },
  matchBtn: { marginTop: 8, width: "100%", height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  matchBtnText: { fontSize: 16, fontWeight: "600" },
  matchSkip: { height: 44, alignItems: "center", justifyContent: "center" },
  matchSkipText: { fontSize: 15 },
});
