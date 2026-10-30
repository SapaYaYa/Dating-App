import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BOARD_CATEGORIES, BOARD_ICONS, BOARD_RULES, findSimilarBoards } from "@/constants/boards";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

export default function CreateBoardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { boards, createBoard, createdCount } = useCommunity();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [emoji, setEmoji] = useState(BOARD_ICONS[0]);
  const [error, setError] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const atLimit = createdCount >= BOARD_RULES.MAX_CREATED_PER_USER;
  const { exact, similar } = findSimilarBoards(title, boards);
  const canSubmit =
    !atLimit && !exact && title.trim().length > 0 && description.trim().length > 0 && category !== "";

  const submit = () => {
    const firstName = user?.name.split(" ")[0] || "You";
    const result = createBoard({ title, description, category, emoji }, firstName);
    if (!result.ok) {
      setError(result.error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.replace(`/community/${result.boardId}`);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.iconBtn}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
        >
          <Feather name="x" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create Board</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        {atLimit && (
          <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.noticeText, { color: colors.foreground }]}>
              You have {BOARD_RULES.MAX_CREATED_PER_USER} boards, the most you can have at once. Delete
              one of them to create another.
            </Text>
          </View>
        )}

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.input, color: colors.foreground }]}
            placeholder="e.g. Sunday Hikers"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={(t) => {
              setTitle(t);
              setError("");
            }}
            maxLength={BOARD_RULES.NAME_MAX}
          />
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {title.length}/{BOARD_RULES.NAME_MAX}
          </Text>

          {exact && (
            <TouchableOpacity
              onPress={() => router.replace(`/community/${exact.id}`)}
              style={[styles.match, { borderColor: colors.destructive }]}
            >
              <Text style={styles.matchEmoji}>{exact.emoji}</Text>
              <View style={styles.matchText}>
                <Text style={[styles.matchTitle, { color: colors.foreground }]}>
                  {exact.title} already exists
                </Text>
                <Text style={[styles.matchSub, { color: colors.mutedForeground }]}>
                  Tap to open it and join instead.
                </Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
          {!exact && similar.length > 0 && (
            <View style={styles.similarList}>
              <Text style={[styles.similarLabel, { color: colors.mutedForeground }]}>
                Similar boards. Join one instead?
              </Text>
              {similar.map((b) => (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => router.replace(`/community/${b.id}`)}
                  style={[styles.match, { borderColor: colors.border }]}
                >
                  <Text style={styles.matchEmoji}>{b.emoji}</Text>
                  <View style={styles.matchText}>
                    <Text style={[styles.matchTitle, { color: colors.foreground }]}>{b.title}</Text>
                    <Text style={[styles.matchSub, { color: colors.mutedForeground }]}>
                      {b.members.toLocaleString()} members
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline, { backgroundColor: colors.input, color: colors.foreground }]}
            placeholder="What is this board about?"
            placeholderTextColor={colors.mutedForeground}
            value={description}
            onChangeText={(t) => {
              setDescription(t);
              setError("");
            }}
            maxLength={BOARD_RULES.DESCRIPTION_MAX}
            multiline
          />
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {description.length}/{BOARD_RULES.DESCRIPTION_MAX}
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          <View style={styles.chips}>
            {BOARD_CATEGORIES.map((c) => {
              const selected = category === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[
                    styles.chip,
                    { backgroundColor: selected ? colors.primary : colors.secondary },
                  ]}
                  accessibilityState={{ selected }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selected ? colors.primaryForeground : colors.foreground },
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.foreground }]}>Icon</Text>
          <View style={styles.icons}>
            {BOARD_ICONS.map((icon) => {
              const selected = emoji === icon;
              return (
                <TouchableOpacity
                  key={icon}
                  onPress={() => setEmoji(icon)}
                  style={[
                    styles.iconChoice,
                    {
                      backgroundColor: colors.secondary,
                      borderColor: selected ? colors.primary : "transparent",
                    },
                  ]}
                  accessibilityState={{ selected }}
                  accessibilityLabel={`Icon ${icon}`}
                >
                  <Text style={styles.iconEmoji}>{icon}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {error ? <Text style={[styles.error, { color: colors.destructive }]}>{error}</Text> : null}

        <TouchableOpacity
          onPress={submit}
          disabled={!canSubmit}
          style={[styles.submit, { backgroundColor: colors.primary, opacity: canSubmit ? 1 : 0.4 }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.submitText, { color: colors.primaryForeground }]}>Create Board</Text>
        </TouchableOpacity>
        <Text style={[styles.footnote, { color: colors.mutedForeground }]}>
          Boards are public. You can edit the description, and delete the board while it has fewer
          than {BOARD_RULES.OWNER_DELETE_MAX_MEMBERS} members.
        </Text>
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
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  scroll: { padding: 20, gap: 22 },
  notice: { borderRadius: 12, padding: 14 },
  noticeText: { fontSize: 14, lineHeight: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, fontWeight: "700" },
  input: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  multiline: { minHeight: 90, textAlignVertical: "top" },
  count: { fontSize: 11, alignSelf: "flex-end" },
  similarList: { gap: 8 },
  similarLabel: { fontSize: 13 },
  match: { flexDirection: "row", alignItems: "center", gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  matchEmoji: { fontSize: 22 },
  matchText: { flex: 1, gap: 2 },
  matchTitle: { fontSize: 14, fontWeight: "600" },
  matchSub: { fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "600" },
  icons: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconChoice: { width: 48, height: 48, borderRadius: 12, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  iconEmoji: { fontSize: 24 },
  error: { fontSize: 14, textAlign: "center" },
  submit: { height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  submitText: { fontSize: 16, fontWeight: "600" },
  footnote: { fontSize: 12, lineHeight: 17, textAlign: "center" },
});
