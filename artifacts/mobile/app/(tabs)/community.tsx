import { Feather } from "@expo/vector-icons";
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
import { EventCard } from "@/components/EventCard";
import { MOCK_BOARDS, MOCK_EVENTS } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";

type Tab = "boards" | "events";

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>("boards");
  const [search, setSearch] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  const filteredBoards = MOCK_BOARDS.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredEvents = MOCK_EVENTS.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Community</Text>
        <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.primary }]}>
          <Feather name="plus" size={16} color={colors.primaryForeground} />
          <Text style={[styles.createText, { color: colors.primaryForeground }]}>Post Event</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput, { color: colors.foreground }]}
          placeholder={tab === "boards" ? "Search boards..." : "Search events..."}
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

      <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
        {(["boards", "events"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.subTab, { borderBottomColor: tab === t ? colors.primary : "transparent" }]}
          >
            <Text style={[styles.subTabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "boards" ? "Boards" : "Events"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad }]}
      >
        {tab === "boards" && (
          <>
            {search.length === 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Trending</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
                  {MOCK_BOARDS.filter((b) => b.trending).map((board) => (
                    <BoardCard key={board.id} board={board} compact />
                  ))}
                </ScrollView>
              </View>
            )}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {search.length > 0 ? "Results" : "All Boards"}
              </Text>
              {filteredBoards.map((board) => (
                <BoardCard key={board.id} board={board} />
              ))}
              {filteredBoards.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No boards found</Text>
              )}
            </View>
          </>
        )}

        {tab === "events" && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {search.length > 0 ? "Results" : "Events Near You"}
            </Text>
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
            {filteredEvents.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No events found</Text>
            )}
          </View>
        )}
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
  tabRow: { flexDirection: "row", borderBottomWidth: 1, marginHorizontal: 20 },
  subTab: { flex: 1, paddingVertical: 12, alignItems: "center", borderBottomWidth: 2 },
  subTabText: { fontSize: 15, fontWeight: "600" },
  scroll: { paddingTop: 12 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  trendingRow: { paddingRight: 20, marginBottom: 20 },
  emptyText: { textAlign: "center", fontSize: 14, marginTop: 32 },
});
