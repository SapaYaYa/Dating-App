import { router } from "expo-router";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GhostIcon } from "@/components/GhostIcon";
import { useReplyStatus } from "@/context/ReplyStatusContext";
import { useColors } from "@/hooks/useColors";

/** The one-time advance warning or "you've earned the badge" message. */
export function ReplyStatusSheet() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sheetToShow, markSheetSeen, unanswered, messagedMatches } = useReplyStatus();

  if (!sheetToShow || sheetToShow === "clear") return null;

  const isBadge = sheetToShow === "badge";
  const seeMatches = () => {
    markSheetSeen();
    router.push("/waiting");
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={markSheetSeen}>
      <Pressable style={styles.backdrop} onPress={markSheetSeen} accessibilityLabel="Close" />
      <View
        style={[
          styles.sheet,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <View
          style={[
            styles.iconWrap,
            { backgroundColor: isBadge ? colors.slowReply : colors.slowReplyBg },
          ]}
        >
          <GhostIcon size={28} color={isBadge ? "#fff" : colors.slowReply} />
        </View>

        {isBadge ? (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>
              You've earned the Slow to reply badge
            </Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              {unanswered} of your {messagedMatches} matches from the last 2 weeks are still
              waiting on a reply. Your matches will see this badge when they match with you.
            </Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              Reply to your matches, or unmatch, to remove it.
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {unanswered} matches are waiting on you
            </Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              Reply, or unmatch if you're not interested. Leaving matches unanswered can earn
              you the <Text style={{ color: colors.slowReplyTitle, fontWeight: "700" }}>Slow to reply</Text>{" "}
              badge, which your matches will see.
            </Text>
          </>
        )}

        <TouchableOpacity
          onPress={seeMatches}
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryText, { color: colors.primaryForeground }]}>See matches</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={markSheetSeen} style={styles.secondaryBtn}>
          <Text style={[styles.secondaryText, { color: colors.mutedForeground }]}>Not now</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 22,
    paddingTop: 12,
    gap: 12,
  },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  title: { fontSize: 22, fontWeight: "800" },
  body: { fontSize: 15, lineHeight: 22 },
  primaryBtn: { marginTop: 8, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  primaryText: { fontSize: 16, fontWeight: "600" },
  secondaryBtn: { height: 44, alignItems: "center", justifyContent: "center" },
  secondaryText: { fontSize: 15, fontWeight: "500" },
});
