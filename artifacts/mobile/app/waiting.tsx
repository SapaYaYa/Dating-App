import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
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

import { useReplyStatus } from "@/context/ReplyStatusContext";
import { useColors } from "@/hooks/useColors";

export default function WaitingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { waiting, unanswered, messagedMatches, status, repliesToClear, clearMatch } =
    useReplyStatus();

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const pct = messagedMatches > 0 ? Math.round((unanswered / messagedMatches) * 100) : 0;
  const statLine = `${unanswered} of ${messagedMatches} matches unanswered (${pct}%)`;

  const clear = (profileId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearMatch(profileId);
  };

  const statusText =
    status === "badge"
      ? `${statLine}. Reply or unmatch ${repliesToClear} more to remove your badge.`
      : status === "warning"
        ? `${statLine}. Reply or unmatch to avoid the Slow to reply badge.`
        : `You're clear of the Slow to reply badge. ${statLine}.`;
  const isClear = status === "clear";

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Waiting on you</Text>
      </View>

      <Text style={[styles.intro, { color: colors.mutedForeground }]}>
        These matches messaged you and haven't heard back in 3+ days.
      </Text>
      <View
        style={[
          styles.status,
          { backgroundColor: isClear ? colors.green + "22" : colors.slowReplyBg },
        ]}
      >
        <Text style={[styles.statusText, { color: isClear ? colors.foreground : colors.slowReplyTitle }]}>
          {statusText}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {waiting.length === 0 ? (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.green + "22" }]}>
              <Feather name="check" size={26} color={colors.green} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All caught up</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>
              No matches are waiting on you.
            </Text>
          </View>
        ) : (
          waiting.map((w) => (
            <View key={w.profile.id} style={[styles.row, { borderBottomColor: colors.border }]}>
              <View style={styles.rowTop}>
                <Image source={{ uri: w.profile.images[0] }} style={styles.avatar} />
                <View style={styles.rowText}>
                  <View style={styles.rowNameLine}>
                    <Text style={[styles.name, { color: colors.foreground }]}>{w.profile.name}</Text>
                    <Text style={[styles.ago, { color: colors.mutedForeground }]}>
                      Waiting {w.waitingDays} days
                    </Text>
                  </View>
                  <Text numberOfLines={1} style={[styles.last, { color: colors.mutedForeground }]}>
                    {w.lastMessage}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => clear(w.profile.id)}
                  style={[styles.replyBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.85}
                  accessibilityLabel={`Reply to ${w.profile.name}`}
                >
                  <Text style={[styles.btnText, { color: colors.primaryForeground }]}>Reply</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => clear(w.profile.id)}
                  style={[styles.unmatchBtn, { borderColor: colors.border }]}
                  activeOpacity={0.85}
                  accessibilityLabel={`Unmatch ${w.profile.name}`}
                >
                  <Text style={[styles.btnText, { color: colors.foreground }]}>Unmatch</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  intro: { fontSize: 14, lineHeight: 20, paddingHorizontal: 20, marginBottom: 10 },
  status: { marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12 },
  statusText: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  row: { paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: StyleSheet.hairlineWidth },
  rowTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  rowText: { flex: 1, minWidth: 0, gap: 3 },
  rowNameLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 15, fontWeight: "600" },
  ago: { fontSize: 12 },
  last: { fontSize: 14 },
  actions: { flexDirection: "row", gap: 8, paddingLeft: 64 },
  replyBtn: { flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  unmatchBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 14, fontWeight: "600" },
  empty: { alignItems: "center", gap: 10, paddingTop: 40, paddingHorizontal: 24 },
  emptyIcon: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 20, fontWeight: "800" },
  emptyBody: { fontSize: 15, textAlign: "center" },
});
