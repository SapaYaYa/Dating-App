import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Pebble } from "@/components/Gentoo";
import { ProfileScroll } from "@/components/ProfileScroll";
import { MOCK_CITY_PROFILES, MOCK_PROFILES } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { isProfileHidden } from "@/utils/hiddenProfiles";
import ReportModal, { hasReported } from "@/components/ReportModal";

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

  const profile = [...MOCK_PROFILES, ...MOCK_CITY_PROFILES].find((p) => p.id === id) ?? MOCK_PROFILES[0];
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) + 52,
          paddingHorizontal: 16,
          paddingBottom: bottomPad + 40,
          gap: 12,
        }}
      >
        {alreadyReported && (
          <View style={[styles.reportedNote, { backgroundColor: colors.secondary }]}>
            <Feather name="flag" size={12} color={colors.mutedForeground} />
            <Text style={[styles.reportedNoteText, { color: colors.mutedForeground }]}>You reported this profile</Text>
          </View>
        )}
        <ProfileScroll profile={profile} />
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
          style={[styles.actionBtn, styles.likeBtn, { backgroundColor: liked ? colors.green : colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel={liked ? `Pebble sent to ${profile.name}` : `Give ${profile.name} a pebble`}
        >
          <Pebble size={34} fill={colors.primaryForeground} heart={liked ? colors.green : colors.primary} shadow={false} />
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
  reportedNote: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  reportedNoteText: { fontSize: 12, fontWeight: "600" },
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
