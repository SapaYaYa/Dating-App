import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GhostIcon } from "@/components/GhostIcon";
import type { ProfileBadge } from "@/constants/replyBadge";
import { useColors } from "@/hooks/useColors";

export function hasSlowToReplyBadge(badges: ProfileBadge[] | undefined): boolean {
  return badges?.includes("slowToReply") ?? false;
}

interface Props {
  name: string;
  /** "match" for the It's a Match pop-up, "chat" for the bar at the top of a chat. */
  variant: "match" | "chat";
  onDismiss?: () => void;
}

export function SlowToReplyNotice({ name, variant, onDismiss }: Props) {
  const colors = useColors();
  const message =
    variant === "match"
      ? `${name} often doesn't reply to matches.`
      : `${name} has left many recent matches without a reply.`;

  return (
    <View
      accessibilityRole="alert"
      style={[
        styles.container,
        variant === "chat" && styles.chatContainer,
        { backgroundColor: colors.slowReplyBg },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.background }]}>
        <GhostIcon size={17} color={colors.slowReply} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.slowReplyTitle }]}>Slow to reply</Text>
        <Text style={[styles.message, { color: colors.slowReplyText }]}>{message}</Text>
      </View>
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        >
          <Feather name="x" size={18} color={colors.slowReply} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 12,
    paddingLeft: 14,
    paddingRight: 14,
  },
  chatContainer: { paddingRight: 4 },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: "700" },
  message: { fontSize: 13, lineHeight: 18 },
  dismiss: {
    width: 44,
    height: 44,
    marginVertical: -8,
    alignItems: "center",
    justifyContent: "center",
  },
});
