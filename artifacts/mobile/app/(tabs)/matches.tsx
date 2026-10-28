import { Feather } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GhostBadgeDot } from "@/components/GhostIcon";
import { GreatChatDot, hasGreatChatBadge } from "@/components/GreatChatBadge";
import { MessageItem } from "@/components/MessageItem";
import { hasSlowToReplyBadge } from "@/components/SlowToReplyNotice";
import { MOCK_MATCHES } from "@/constants/mockData";
import { useColors } from "@/hooks/useColors";
import { getHiddenProfileIds } from "@/utils/hiddenProfiles";

export default function MatchesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [blockedProfileIds, setBlockedProfileIds] = useState<string[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState(false);

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setBlocksLoaded(false);

      getHiddenProfileIds().then((ids) => {
        if (cancelled) return;
        setBlockedProfileIds(ids);
        setBlocksLoaded(true);
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  const visibleMatches = MOCK_MATCHES.filter(
    (match) => !blockedProfileIds.includes(match.profile.id),
  );
  const messagesWithChat = visibleMatches.filter((m) => m.lastMessage);
  const newMatches = visibleMatches.filter((m) => !m.lastMessage);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Matches</Text>
        <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.secondary }]}>
          <Feather name="search" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>
        {blocksLoaded && newMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>New Matches</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.newMatchesScroll}>
              {newMatches.map((match) => (
                <TouchableOpacity
                  key={match.id}
                  style={styles.newMatchItem}
                  onPress={() => router.push(`/chat/${match.id}`)}
                  activeOpacity={0.8}
                >
                  <View style={styles.avatarWrap}>
                    <Image source={{ uri: match.profile.images[0] }} style={styles.newMatchAvatar} />
                    {hasSlowToReplyBadge(match.profile.badges) ? (
                      <GhostBadgeDot size={24} />
                    ) : hasGreatChatBadge(match.profile.badges) ? (
                      <GreatChatDot size={24} />
                    ) : null}
                    {match.hasIceBreaker &&
                      !hasSlowToReplyBadge(match.profile.badges) &&
                      !hasGreatChatBadge(match.profile.badges) && (
                      <View style={[styles.iceBreakerDot, { backgroundColor: colors.accent }]}>
                        <Feather name="message-circle" size={8} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.newMatchName, { color: colors.foreground }]} numberOfLines={1}>
                    {match.profile.name}
                  </Text>
                  {match.matchNote && (
                    <Text style={[styles.matchNoteText, { color: colors.mutedForeground }]} numberOfLines={1}>
                      {match.matchNote}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {blocksLoaded && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Conversations
            </Text>
            {messagesWithChat.map((match) => (
              <MessageItem
                key={match.id}
                match={match}
                onPress={() => router.push(`/chat/${match.id}`)}
              />
            ))}
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
    paddingBottom: 16,
  },
  title: { fontSize: 28, fontWeight: "800" },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  section: { paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 20, marginBottom: 12 },
  newMatchesScroll: { paddingHorizontal: 20, gap: 16 },
  newMatchItem: { alignItems: "center", width: 72, gap: 6 },
  avatarWrap: { position: "relative" },
  newMatchAvatar: { width: 68, height: 68, borderRadius: 34 },
  iceBreakerDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  newMatchName: { fontSize: 12, fontWeight: "600", textAlign: "center" },
  matchNoteText: { fontSize: 10, textAlign: "center" },
});
