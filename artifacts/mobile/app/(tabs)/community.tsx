import { Feather } from "@expo/vector-icons";
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

import { BoardCard } from "@/components/BoardCard";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";

// Events are hidden for now; EventCard and MOCK_EVENTS are kept for when
// they come back.
export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { boards, isJoined } = useCommunity();
  const [search, setSearch] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  const query = search.trim().toLowerCase();
  const filteredBoards = boards.filter(
    (b) =>
      b.title.toLowerCase().includes(query) ||
      b.category.toLowerCase().includes(query) ||
      b.description.toLowerCase().includes(query)
  );
  const yourBoards = boards.filter((b) => isJoined(b.id));

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Community</Text>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push("/community/create")}
        >
          <Feather name="plus" size={16} color={colors.primaryForeground} />
          <Text style={[styles.createText, { color: colors.primaryForeground }]}>Create Board</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder="Search boards..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Feather name="x" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        {query.length === 0 && (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
                {boards.filter((b) => b.trending).map((board) => (
                  <BoardCard key={board.id} board={board} compact />
                ))}
              </ScrollView>
            </View>
            {yourBoards.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your Boards</Text>
                {yourBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </View>
            )}
          </>
        )}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {query.length > 0 ? "Results" : "All Boards"}
          </Text>
          {(query.length > 0 ? filteredBoards : boards.filter((b) => !isJoined(b.id))).map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
          {query.length > 0 && filteredBoards.length === 0 && (
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No boards found</Text>
              <TouchableOpacity onPress={() => router.push("/community/create")}>
                <Text style={[styles.emptyLink, { color: colors.foreground }]}>Create one</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingBottom: 14,
  },
  title: { fontSize: 28, fontWeight: "800" },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
  },
  createText: { fontSize: 13, fontWeight: "600" },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 14 },
  scroll: { paddingTop: 12 },
  section: { paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  trendingRow: { paddingRight: 20, marginBottom: 20 },
  empty: { alignItems: "center", gap: 8, marginTop: 32 },
  emptyText: { textAlign: "center", fontSize: 14 },
  emptyLink: { fontSize: 14, fontWeight: "700", textDecorationLine: "underline" },
});
