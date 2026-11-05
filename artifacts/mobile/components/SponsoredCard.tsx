import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";

interface Props {
  /** "discover" fills the profile area; "board" sits between posts. */
  variant: "discover" | "board";
}

/**
 * A sample sponsored item, always labeled "Sponsored". In the phone app this
 * becomes the ad network's native ad, using non-personalized ads only.
 */
export function SponsoredCard({ variant }: Props) {
  const colors = useColors();
  const large = variant === "discover";
  return (
    <View
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      accessibilityLabel="Sponsored"
    >
      <View style={styles.header}>
        <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.tagText, { color: colors.mutedForeground }]}>Sponsored</Text>
        </View>
      </View>
      <View style={[styles.media, { height: large ? 280 : 140, backgroundColor: colors.secondary }]}>
        <Feather name="image" size={large ? 48 : 32} color={colors.mutedForeground} />
      </View>
      <Text style={[styles.title, { color: colors.foreground }]}>Sample ad</Text>
      <Text style={[styles.body, { color: colors.mutedForeground }]}>
        A real ad appears here in the phone app.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  header: { flexDirection: "row" },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  media: { borderRadius: 12, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 17, fontWeight: "700" },
  body: { fontSize: 14, lineHeight: 20 },
});
