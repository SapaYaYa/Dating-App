import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GreatChatPill, hasGreatChatBadge } from "@/components/GreatChatBadge";
import { MOCK_PROFILES } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { isProfileHidden } from "@/utils/hiddenProfiles";
import { formatDistance } from "@/utils/distance";
import ReportModal, { hasReported } from "@/components/ReportModal";

const { width: W } = Dimensions.get("window");

export default function ProfileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { useLike } = useApp();
  const [liked, setLiked] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [blockStatusLoaded, setBlockStatusLoaded] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const profile = MOCK_PROFILES.find((p) => p.id === id) ?? MOCK_PROFILES[0];
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  useEffect(() => {
    hasReported(profile.id).then(setAlreadyReported);
  }, [profile.id]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setBlockStatusLoaded(false);

      isProfileHidden(profile.id).then((blocked) => {
        if (cancelled) return;
        setIsBlocked(blocked);
        setBlockStatusLoaded(true);
        if (blocked) router.replace("/(tabs)/discover");
      });

      return () => {
        cancelled = true;
      };
    }, [profile.id]),
  );

  const handleLike = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    useLike();
    setLiked(true);
    setTimeout(() => router.back(), 400);
  };

  const handleMoreOptions = () => {
    if (alreadyReported) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [`Report ${profile.name}`, "Cancel"],
          destructiveButtonIndex: 0,
          cancelButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) setReportModalVisible(true);
        }
      );
    } else {
      Alert.alert(
        "Options",
        undefined,
        [
          {
            text: `Report ${profile.name}`,
            style: "destructive",
            onPress: () => setReportModalVisible(true),
          },
          { text: "Cancel", style: "cancel" },
        ],
        { cancelable: true }
      );
    }
  };

  if (!blockStatusLoaded || isBlocked) {
    return <View style={[styles.root, { backgroundColor: colors.background }]} />;
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.backBtn, { top: insets.top + (Platform.OS === "web" ? 67 : 16) }]}
        onPress={() => router.back()}
      >
        <Feather name="x" size={20} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.moreBtn, { top: insets.top + (Platform.OS === "web" ? 67 : 16) }]}
        onPress={handleMoreOptions}
        disabled={alreadyReported}
      >
        {alreadyReported ? (
          <Feather name="flag" size={16} color="rgba(255,255,255,0.5)" />
        ) : (
          <Feather name="more-horizontal" size={20} color="#fff" />
        )}
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 100 }}>
        <View style={styles.photoSection}>
          <Image source={{ uri: profile.images[0] }} style={styles.mainPhoto} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.75)"]} style={styles.photoGradient}>
            <View style={styles.basicInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.profileName}>{profile.name}, {profile.age}</Text>
                {profile.verified && <Feather name="check-circle" size={18} color="#fff" />}
              </View>
              <Text style={styles.profileOccupation}>{profile.occupation}</Text>
              {hasGreatChatBadge(profile.badges) && (
                <View style={styles.greatChatRow}>
                  <GreatChatPill />
                </View>
              )}
              <View style={styles.distanceRow}>
                <Feather name="map-pin" size={13} color="rgba(255,255,255,0.75)" />
                <Text style={styles.distanceText}>{formatDistance(profile.distance)}</Text>
              </View>
              {alreadyReported && (
                <View style={styles.reportedBadge}>
                  <Feather name="flag" size={11} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.reportedText}>Reported</Text>
                </View>
              )}
            </View>
          </LinearGradient>
        </View>

        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={[styles.spotifyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.spotifyRow}>
              <View style={[styles.spotifyIcon, { backgroundColor: colors.spotify + "22" }]}>
                <Feather name="music" size={16} color={colors.spotify} />
              </View>
              <View>
                <Text style={[styles.spotifyLabel, { color: colors.mutedForeground }]}>Listening now</Text>
                <Text style={[styles.spotifyTrack, { color: colors.foreground }]}>
                  {profile.spotify.song}
                </Text>
                <Text style={[styles.spotifyArtist, { color: colors.mutedForeground }]}>
                  {profile.spotify.artist}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>About</Text>
            <Text style={[styles.bioText, { color: colors.foreground }]}>{profile.bio}</Text>
          </View>

          <View style={styles.questionsSection}>
            {profile.profileQuestions.map((pq, i) => (
              <View key={i} style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.questionLabel, { color: colors.mutedForeground }]}>{pq.question}</Text>
                <Text style={[styles.questionAnswer, { color: colors.foreground }]}>{pq.answer}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.interestsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Interests</Text>
            <View style={styles.tagsWrap}>
              {profile.interests.map((tag) => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
                  <Text style={[styles.tagText, { color: colors.foreground }]}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.instagramCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.igHeader}>
              <Feather name="instagram" size={16} color={colors.foreground} />
              <Text style={[styles.igUsername, { color: colors.foreground }]}>{profile.instagram.username}</Text>
              <Text style={[styles.igPosts, { color: colors.mutedForeground }]}>· {profile.instagram.posts} posts</Text>
            </View>
            <View style={styles.igGrid}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <View key={n} style={[styles.igCell, { backgroundColor: colors.secondary }]}>
                  <Feather name="image" size={20} color={colors.border} />
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.iceBreakerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Ask me about...</Text>
            {profile.iceBreakers.map((ib, i) => (
              <View key={i} style={[styles.ibItem, { borderBottomColor: colors.border, borderBottomWidth: i < profile.iceBreakers.length - 1 ? 1 : 0 }]}>
                <Feather name="message-circle" size={14} color={colors.mutedForeground} />
                <Text style={[styles.ibText, { color: colors.foreground }]}>{ib}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.actionBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: bottomPad + 12 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.actionBtn, styles.passBtn, { backgroundColor: colors.secondary }]}
        >
          <Feather name="x" size={24} color={colors.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLike}
          style={[styles.actionBtn, styles.likeBtn, { backgroundColor: liked ? colors.green : colors.accent }]}
        >
          <Feather name="heart" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <ReportModal
        visible={reportModalVisible}
        profileId={profile.id}
        profileName={profile.name}
        onClose={() => {
          setReportModalVisible(false);
          hasReported(profile.id).then(setAlreadyReported);
        }}
        onBlocked={() => {
          setIsBlocked(true);
          router.replace("/(tabs)/discover");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  backBtn: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreBtn: {
    position: "absolute",
    right: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  photoSection: { height: W * 1.2, position: "relative" },
  mainPhoto: { width: "100%", height: "100%", resizeMode: "cover" },
  photoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: 32,
  },
  basicInfo: { gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  greatChatRow: { flexDirection: "row", marginTop: 4 },
  profileName: { color: "#fff", fontSize: 28, fontWeight: "700" },
  profileOccupation: { color: "rgba(255,255,255,0.85)", fontSize: 16 },
  distanceRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  distanceText: { color: "rgba(255,255,255,0.75)", fontSize: 13 },
  reportedBadge: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  reportedText: { color: "rgba(255,255,255,0.6)", fontSize: 12 },
  content: { padding: 16, gap: 12 },
  spotifyCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  spotifyRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  spotifyIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  spotifyLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  spotifyTrack: { fontSize: 15, fontWeight: "600", marginTop: 2 },
  spotifyArtist: { fontSize: 13 },
  bioCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  sectionLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  bioText: { fontSize: 15, lineHeight: 22 },
  questionsSection: { gap: 10 },
  questionCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 6 },
  questionLabel: { fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 },
  questionAnswer: { fontSize: 16, fontWeight: "500", lineHeight: 22 },
  interestsCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  tagText: { fontSize: 13, fontWeight: "500" },
  instagramCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  igHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  igUsername: { fontSize: 14, fontWeight: "600" },
  igPosts: { fontSize: 13 },
  igGrid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  igCell: {
    width: (W - 64) / 3,
    height: (W - 64) / 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iceBreakerCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 0 },
  ibItem: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  ibText: { fontSize: 14, flex: 1 },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingTop: 14,
    paddingHorizontal: 40,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  actionBtn: { alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  passBtn: { width: 56, height: 56, borderRadius: 28 },
  likeBtn: { width: 64, height: 64, borderRadius: 32 },
});
