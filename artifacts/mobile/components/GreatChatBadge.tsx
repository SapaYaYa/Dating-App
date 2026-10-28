import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ProfileBadge } from "@/constants/replyBadge";
import { useColors } from "@/hooks/useColors";

// On photos the label keeps one warm color in both themes, so it reads
// against any picture.
const ON_PHOTO_COLOR = "#C2410C";

export function hasGreatChatBadge(badges: ProfileBadge[] | undefined): boolean {
  return badges?.includes("greatChat") ?? false;
}

/** "Great Chat" label for photos: Discover cards and the full profile. */
export function GreatChatPill() {
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Great Chat badge"
      style={[styles.pill, { backgroundColor: ON_PHOTO_COLOR }]}
    >
      <Feather name="message-square" size={13} color="#fff" />
      <Text style={styles.pillText}>Great Chat</Text>
    </View>
  );
}

/** Small marker that sits on the corner of a match's photo. */
export function GreatChatDot({ size = 22 }: { size?: number }) {
  const colors = useColors();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Great Chat badge"
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: ON_PHOTO_COLOR,
          borderColor: colors.background,
        },
      ]}
    >
      <Feather name="message-square" size={size * 0.5} color="#fff" />
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  dot: {
    position: "absolute",
    right: -3,
    bottom: -3,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
