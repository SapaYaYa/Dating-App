import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { PROFILE_QUESTIONS } from "@/constants/mockData";

const MAX_PHOTOS = 8;
const MIN_PHOTOS = 3;
const SCREEN_W = Dimensions.get("window").width;
const GRID_PAD = 20;
const GRID_GAP = 8;
const PHOTO_SIZE = (SCREEN_W - GRID_PAD * 2 - GRID_GAP * 2) / 3;

const SCHEDULED_QUESTIONS = [
  { question: PROFILE_QUESTIONS[0], daysLeft: 0, answer: "Farmers market then cooking something new" },
  { question: PROFILE_QUESTIONS[3], daysLeft: 3, answer: "" },
  { question: PROFILE_QUESTIONS[6], daysLeft: 7, answer: "" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout, updateUser, verificationStatus } = useAuth();
  const { totalPoints, level, currentStreak } = useApp();
  const scheme = useColorScheme();
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [matchNote, setMatchNote] = useState(user?.matchNote ?? "");
  const [spotifyConnected, setSpotifyConnected] = useState(true);
  const [instagramConnected, setInstagramConnected] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  const handleLogout = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/auth/login");
  };

  const handleRemovePhoto = (index: number) => {
    const currentImages = user?.images ?? [];
    if (currentImages.length <= MIN_PHOTOS) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const updated = currentImages.filter((_, i) => i !== index);
    updateUser({ images: updated });
  };

  const handleAddPhoto = async () => {
    const currentImages = user?.images ?? [];
    if (currentImages.length >= MAX_PHOTOS) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      updateUser({ images: [...currentImages, result.assets[0].uri] });
    }
  };

  const profileCompletion = 78;

  return (
    <ScrollView
      style={[styles.root, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.scroll, { paddingTop: topPad + 12, paddingBottom: bottomPad }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.foreground }]}>Profile</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
          <Feather name="settings" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarWrap}>
          {user?.images[0] ? (
            <Image source={{ uri: user.images[0] }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.secondary }]}>
              <Feather name="user" size={38} color={colors.mutedForeground} />
            </View>
          )}
          <TouchableOpacity
            style={[
              styles.editAvatarBtn,
              { backgroundColor: (user?.images.length ?? 0) >= MAX_PHOTOS ? colors.secondary : colors.primary },
            ]}
            onPress={handleAddPhoto}
            activeOpacity={0.8}
          >
            <Feather
              name={(user?.images.length ?? 0) >= MAX_PHOTOS ? "check" : "camera"}
              size={14}
              color={(user?.images.length ?? 0) >= MAX_PHOTOS ? colors.mutedForeground : colors.primaryForeground}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.photoCount, { color: colors.mutedForeground }]}>
          {user?.images.length ?? 0}/{MAX_PHOTOS} photos
        </Text>

        <Text style={[styles.userName, { color: colors.foreground }]}>
          {user?.name || "Alex"}, {user?.age || 26}
        </Text>

        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: colors.gold + "22" }]}>
            <Feather name="star" size={12} color={colors.gold} />
            <Text style={[styles.badgeText, { color: colors.gold }]}>Lv. {level}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.green + "22" }]}>
            <Feather name="zap" size={12} color={colors.green} />
            <Text style={[styles.badgeText, { color: colors.green }]}>{currentStreak} streak</Text>
          </View>
          {verificationStatus === "verified" && (
            <View style={[styles.badge, { backgroundColor: colors.superLike + "22" }]}>
              <Feather name="check-circle" size={12} color={colors.superLike} />
              <Text style={[styles.badgeText, { color: colors.superLike }]}>Verified</Text>
            </View>
          )}
          {verificationStatus === "pending" && (
            <View style={[styles.badge, { backgroundColor: colors.mutedForeground + "22" }]}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Pending</Text>
            </View>
          )}
          {level >= 5 && (
            <View style={[styles.badge, { backgroundColor: colors.gold + "22" }]}>
              <Feather name="zap" size={12} color={colors.gold} />
              <Text style={[styles.badgeText, { color: colors.gold }]}>Priority Profile</Text>
            </View>
          )}
        </View>
      </View>

      {verificationStatus === "none" && (
        <TouchableOpacity
          style={[styles.verifyCard, { backgroundColor: colors.card, borderColor: colors.superLike + "55" }]}
          onPress={() => router.push("/verify")}
          activeOpacity={0.85}
        >
          <View style={[styles.verifyIconWrap, { backgroundColor: colors.superLike + "18" }]}>
            <Feather name="shield" size={22} color={colors.superLike} />
          </View>
          <View style={styles.verifyCardBody}>
            <Text style={[styles.verifyCardTitle, { color: colors.foreground }]}>Get Verified</Text>
            <Text style={[styles.verifyCardSub, { color: colors.mutedForeground }]}>
              Show matches you're the real deal with a verified badge on your profile.
            </Text>
          </View>
          <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      <View style={[styles.completionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.completionHeader}>
          <Text style={[styles.completionTitle, { color: colors.foreground }]}>Profile Strength</Text>
          <Text style={[styles.completionPct, { color: colors.primary }]}>{profileCompletion}%</Text>
        </View>
        <View style={[styles.completionTrack, { backgroundColor: colors.secondary }]}>
          <View style={[styles.completionFill, { width: `${profileCompletion}%` as any, backgroundColor: colors.primary }]} />
        </View>
        <Text style={[styles.completionHint, { color: colors.mutedForeground }]}>
          Add Instagram to boost visibility
        </Text>
      </View>

      <SectionCard colors={colors} title="Match Note">
        <View style={styles.matchNoteWrap}>
          <TextInput
            style={[styles.matchNoteInput, { color: colors.foreground }]}
            placeholder="Write a note only your matches will see..."
            placeholderTextColor={colors.mutedForeground}
            value={matchNote}
            onChangeText={setMatchNote}
            onBlur={() => updateUser({ matchNote })}
            multiline
            maxLength={150}
          />
          <View style={styles.matchNoteFooter}>
            <Text style={[styles.matchNoteHint, { color: colors.mutedForeground }]}>
              Revealed to matches only, not on your profile
            </Text>
            <Text style={[styles.matchNoteCount, { color: colors.mutedForeground }]}>
              {matchNote.length}/150
            </Text>
          </View>
        </View>
      </SectionCard>

      <View style={styles.sectionWrap}>
        <View style={styles.photoGridHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Photos</Text>
          <Text style={[styles.photoGridSub, { color: colors.mutedForeground }]}>
            {user?.images.length ?? 0}/{MAX_PHOTOS} · min {MIN_PHOTOS} required
          </Text>
        </View>
        <View style={styles.photoGrid}>
          {(user?.images ?? []).map((uri, i) => {
            const canDelete = (user?.images.length ?? 0) > MIN_PHOTOS;
            return (
              <View key={`photo-${i}`} style={styles.photoCell}>
                <Image source={{ uri }} style={[styles.photoThumb, { borderRadius: 12 }]} />
                <TouchableOpacity
                  style={[
                    styles.photoDeleteBtn,
                    { backgroundColor: canDelete ? "rgba(0,0,0,0.65)" : "rgba(120,120,120,0.4)" },
                  ]}
                  onPress={() => handleRemovePhoto(i)}
                  activeOpacity={0.8}
                >
                  <Feather name={canDelete ? "x" : "lock"} size={11} color="#fff" />
                </TouchableOpacity>
                {i === 0 && (
                  <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.mainBadgeText, { color: colors.primaryForeground }]}>Main</Text>
                  </View>
                )}
              </View>
            );
          })}
          {(user?.images.length ?? 0) < MAX_PHOTOS && (
            <TouchableOpacity
              style={[styles.photoCell, styles.photoAddCell, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              onPress={handleAddPhoto}
              activeOpacity={0.75}
            >
              <Feather name="plus" size={22} color={colors.mutedForeground} />
              <Text style={[styles.photoAddText, { color: colors.mutedForeground }]}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <SectionCard colors={colors} title="Scheduled Questions">
        {SCHEDULED_QUESTIONS.map((sq, i) => (
          <View key={i} style={[styles.questionItem, { borderBottomColor: colors.border, borderBottomWidth: i < 2 ? 1 : 0 }]}>
            <View style={styles.questionHeader}>
              <Text style={[styles.questionText, { color: colors.foreground }]} numberOfLines={1}>
                {sq.question}
              </Text>
              {sq.daysLeft === 0 ? (
                <View style={[styles.activeBadge, { backgroundColor: colors.green + "22" }]}>
                  <Text style={[styles.activeBadgeText, { color: colors.green }]}>Active</Text>
                </View>
              ) : (
                <Text style={[styles.daysLeft, { color: colors.mutedForeground }]}>in {sq.daysLeft}d</Text>
              )}
            </View>
            {sq.answer ? (
              <Text style={[styles.answerText, { color: colors.mutedForeground }]} numberOfLines={1}>
                {sq.answer}
              </Text>
            ) : (
              <Text style={[styles.answerPlaceholder, { color: colors.border }]}>Tap to add your answer...</Text>
            )}
          </View>
        ))}
      </SectionCard>

      <SectionCard colors={colors} title="My Interests">
        <View style={styles.interestsWrap}>
          {(user?.interests || ["Travel", "Coffee", "Music", "Hiking", "Photography"]).map((interest) => (
            <View key={interest} style={[styles.interestChip, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.interestText, { color: colors.foreground }]}>{interest}</Text>
            </View>
          ))}
          <TouchableOpacity style={[styles.addInterestChip, { borderColor: colors.border }]}>
            <Feather name="plus" size={14} color={colors.mutedForeground} />
            <Text style={[styles.addText, { color: colors.mutedForeground }]}>Add</Text>
          </TouchableOpacity>
        </View>
      </SectionCard>

      <SectionCard colors={colors} title="Connections">
        <ToggleRow
          icon="music"
          iconColor={colors.spotify}
          label="Spotify"
          sublabel={spotifyConnected ? "Connected · Currently playing" : "Show what you're listening to"}
          connected={spotifyConnected}
          onToggle={() => setSpotifyConnected(!spotifyConnected)}
          colors={colors}
        />
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <ToggleRow
          icon="instagram"
          iconColor={colors.foreground}
          label="Instagram"
          sublabel={instagramConnected ? "Connected · 342 posts" : "Show your Instagram grid"}
          connected={instagramConnected}
          onToggle={() => setInstagramConnected(!instagramConnected)}
          colors={colors}
        />
      </SectionCard>

      <SectionCard colors={colors} title="Account">
        {[
          { icon: "edit-2", label: "Edit Profile" },
          { icon: "bell", label: "Notifications", toggle: true, value: notificationsOn, onToggle: () => setNotificationsOn(!notificationsOn) },
          { icon: "shield", label: "Privacy & Safety" },
          { icon: "help-circle", label: "Help & Support" },
        ].map((item, i, arr) => (
          <View key={item.label}>
            <TouchableOpacity
              style={styles.menuRow}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
                <Feather name={item.icon as any} size={16} color={colors.foreground} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.foreground }]}>{item.label}</Text>
              {item.toggle ? (
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: colors.secondary, true: colors.primary }}
                  thumbColor="#fff"
                />
              ) : (
                <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
              )}
            </TouchableOpacity>
            {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
          </View>
        ))}
      </SectionCard>

      <View style={[styles.privacyInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.privacyInfoIcon, { backgroundColor: colors.green + "18" }]}>
          <Feather name="shield" size={18} color={colors.green} />
        </View>
        <View style={styles.privacyInfoBody}>
          <Text style={[styles.privacyInfoTitle, { color: colors.foreground }]}>Location Privacy</Text>
          <Text style={[styles.privacyInfoSub, { color: colors.mutedForeground }]}>
            Your exact location is never shared — other users only see an approximate distance.
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15" }]}>
        <Feather name="log-out" size={16} color={colors.destructive} />
        <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function SectionCard({ colors, title, children }: { colors: any; title: string; children: React.ReactNode }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {children}
      </View>
    </View>
  );
}

function ToggleRow({ icon, iconColor, label, sublabel, connected, onToggle, colors }: any) {
  return (
    <View style={styles.toggleRow}>
      <View style={[styles.menuIcon, { backgroundColor: colors.secondary }]}>
        <Feather name={icon} size={16} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{sublabel}</Text>
      </View>
      <TouchableOpacity
        onPress={onToggle}
        style={[
          styles.connectBtn,
          { backgroundColor: connected ? colors.green + "22" : colors.secondary },
        ]}
      >
        <Text style={[styles.connectText, { color: connected ? colors.green : colors.foreground }]}>
          {connected ? "Connected" : "Connect"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 },
  title: { fontSize: 28, fontWeight: "800" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  profileSection: { alignItems: "center", gap: 6 },
  avatarWrap: { position: "relative", marginBottom: 4 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  photoCount: { fontSize: 12, fontWeight: "500", marginTop: -2 },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: { fontSize: 22, fontWeight: "700" },
  userOccupation: { fontSize: 14 },
  badgesRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  statsCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statValue: { fontSize: 20, fontWeight: "800" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, height: 40, alignSelf: "center" },
  verifyCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  verifyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyCardBody: { flex: 1, gap: 2 },
  verifyCardTitle: { fontSize: 15, fontWeight: "700" },
  verifyCardSub: { fontSize: 13, lineHeight: 18 },
  completionCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 10 },
  completionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  completionTitle: { fontSize: 14, fontWeight: "600" },
  completionPct: { fontSize: 14, fontWeight: "700" },
  completionTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  completionFill: { height: "100%", borderRadius: 3 },
  completionHint: { fontSize: 12 },
  sectionWrap: { gap: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "700" },
  sectionCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  questionItem: { padding: 14, gap: 4 },
  questionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  questionText: { fontSize: 14, fontWeight: "600", flex: 1 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  activeBadgeText: { fontSize: 11, fontWeight: "600" },
  daysLeft: { fontSize: 11 },
  answerText: { fontSize: 13 },
  answerPlaceholder: { fontSize: 13, fontStyle: "italic" },
  interestsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, padding: 14 },
  interestChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  interestText: { fontSize: 13, fontWeight: "500" },
  addInterestChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addText: { fontSize: 13 },
  toggleRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  divider: { height: 1, marginHorizontal: 14 },
  menuRow: { flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  menuIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  menuSub: { fontSize: 12, marginTop: 1 },
  connectBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  connectText: { fontSize: 12, fontWeight: "600" },
  photoGridHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  photoGridSub: { fontSize: 12 },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", gap: GRID_GAP },
  photoCell: { width: PHOTO_SIZE, height: PHOTO_SIZE * 1.2, borderRadius: 12, overflow: "visible" },
  photoThumb: { width: "100%", height: "100%" },
  photoDeleteBtn: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  mainBadge: {
    position: "absolute",
    bottom: 6,
    left: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 10,
  },
  mainBadgeText: { fontSize: 10, fontWeight: "700" },
  photoAddCell: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1.5,
    borderStyle: "dashed",
  },
  photoAddText: { fontSize: 11, fontWeight: "500" },
  matchNoteWrap: { padding: 14, gap: 8 },
  matchNoteInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 72,
    textAlignVertical: "top",
  },
  matchNoteFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  matchNoteHint: { fontSize: 11, flex: 1 },
  matchNoteCount: { fontSize: 11 },
  privacyInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  privacyInfoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  privacyInfoBody: { flex: 1, gap: 3 },
  privacyInfoTitle: { fontSize: 14, fontWeight: "700" },
  privacyInfoSub: { fontSize: 13, lineHeight: 18 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 8,
  },
  logoutText: { fontSize: 15, fontWeight: "600" },
});
