import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, type StyleProp, type ViewStyle } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

/** Shown on Profile and Discover while the account is paused. */
export function PausedBanner({ style }: { style?: StyleProp<ViewStyle> }) {
  const colors = useColors();
  const { user, setPaused } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user?.paused) return null;

  const unpause = async () => {
    setBusy(true);
    setError(null);
    try {
      await setPaused(false);
    } catch {
      setError("Couldn't unpause. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.wrap, { backgroundColor: colors.ice }, style]} accessibilityRole="summary">
      <Feather name="pause-circle" size={18} color={colors.foreground} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: colors.foreground }]}>Your account is paused</Text>
        <Text style={[styles.body, { color: colors.foreground }]}>
          {error ?? "New people can't see you on Discover. Your matches and chats are still here."}
        </Text>
      </View>
      <TouchableOpacity
        onPress={unpause}
        disabled={busy}
        style={[styles.btn, { backgroundColor: colors.brand }]}
        accessibilityRole="button"
        accessibilityLabel="Unpause my account"
      >
        {busy ? (
          <ActivityIndicator size="small" color={colors.brandForeground} />
        ) : (
          <Text style={[styles.btnText, { color: colors.brandForeground }]}>Unpause</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, padding: 12 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: "800" },
  body: { fontSize: 13, lineHeight: 18 },
  btn: { borderRadius: 999, paddingHorizontal: 14, minHeight: 36, minWidth: 84, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 13, fontWeight: "800" },
});
