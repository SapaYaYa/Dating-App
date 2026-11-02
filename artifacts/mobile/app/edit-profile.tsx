import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BIO_MAX, INTERESTS_MAX, INTEREST_OPTIONS } from "@/constants/profileFields";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

/** Edit your bio and interests. */
export default function EditProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [bio, setBio] = useState(user?.bio ?? "");
  // Interests saved before this list existed are kept only if they're on it.
  const [interests, setInterests] = useState<string[]>(
    (user?.interests ?? []).filter((i) => INTEREST_OPTIONS.includes(i)).slice(0, INTERESTS_MAX),
  );
  const [limitNotice, setLimitNotice] = useState(false);
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const toggle = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
      setLimitNotice(false);
      return;
    }
    if (interests.length >= INTERESTS_MAX) {
      setLimitNotice(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.selectionAsync();
    setInterests([...interests, interest]);
  };

  const save = () => {
    updateUser({ bio: bio.trim(), interests });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Edit profile</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 120 }]}>
        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.foreground }]}>Bio</Text>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {bio.length}/{BIO_MAX}
            </Text>
          </View>
          <TextInput
            style={[styles.bio, { backgroundColor: colors.input, color: colors.foreground }]}
            placeholder="Write a little about yourself..."
            placeholderTextColor={colors.mutedForeground}
            value={bio}
            onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
            maxLength={BIO_MAX}
            multiline
            accessibilityLabel="Bio"
          />
        </View>

        <View style={styles.field}>
          <View style={styles.labelRow}>
            <Text style={[styles.label, { color: colors.foreground }]}>Interests</Text>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {interests.length}/{INTERESTS_MAX}
            </Text>
          </View>
          <Text style={[styles.hint, { color: limitNotice ? colors.destructive : colors.mutedForeground }]}>
            {limitNotice
              ? `You can pick up to ${INTERESTS_MAX}. Remove one to add another.`
              : `Pick up to ${INTERESTS_MAX}. They show on your profile and help people find you.`}
          </Text>
          <View style={styles.chips}>
            {INTEREST_OPTIONS.map((interest) => {
              const selected = interests.includes(interest);
              return (
                <TouchableOpacity
                  key={interest}
                  onPress={() => toggle(interest)}
                  style={[styles.chip, { backgroundColor: selected ? colors.primary : colors.secondary }]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: selected }}
                >
                  <Text style={[styles.chipText, { color: selected ? colors.primaryForeground : colors.foreground }]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          { borderTopColor: colors.border, paddingBottom: insets.bottom + 20, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity onPress={save} style={[styles.save, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
          <Text style={[styles.saveText, { color: colors.primaryForeground }]}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 20, gap: 24 },
  field: { gap: 8 },
  labelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 15, fontWeight: "700" },
  count: { fontSize: 12 },
  bio: { minHeight: 110, borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: "top" },
  hint: { fontSize: 13, lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { minHeight: 40, paddingHorizontal: 14, borderRadius: 20, justifyContent: "center" },
  chipText: { fontSize: 14, fontWeight: "600" },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  save: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  saveText: { fontSize: 16, fontWeight: "600" },
});
