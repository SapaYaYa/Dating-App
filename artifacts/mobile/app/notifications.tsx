import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  loadNotificationSettings,
  saveNotificationSettings,
  type NotificationSettings,
} from "@/utils/notificationSettings";

const TYPES: { key: keyof NotificationSettings; icon: string; label: string; sub: string }[] = [
  { key: "matches", icon: "heart", label: "New matches", sub: "When you and someone become a pair" },
  { key: "messages", icon: "message-circle", label: "Messages", sub: "When a match sends you a message" },
  { key: "pebbles", icon: "gift", label: "Pebbles", sub: "Who sent you pebbles, at most once a day" },
  { key: "slowReply", icon: "clock", label: "Slow to reply reminders", sub: "When matches are waiting on you, at most once a day" },
];

/** Profile > Notifications: one switch per notification type. */
export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveCount = useRef(0);

  useEffect(() => {
    loadNotificationSettings()
      .then(setSettings)
      .finally(() => setLoaded(true));
  }, []);

  const toggle = (key: keyof NotificationSettings) => {
    const previous = settings;
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setError(null);
    const attempt = ++saveCount.current;
    saveNotificationSettings(next).catch(() => {
      // Only undo if no newer change has been made since.
      if (attempt !== saveCount.current) return;
      setSettings(previous);
      setError("Couldn't save that change. Check your connection and try again.");
      saveNotificationSettings(previous).catch(() => {});
    });
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Notifications</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {TYPES.map((t, i) => (
            <View
              key={t.key}
              style={[styles.row, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
            >
              <View style={[styles.icon, { backgroundColor: colors.secondary }]}>
                <Feather name={t.icon as any} size={16} color={colors.foreground} />
              </View>
              <View style={styles.text}>
                <Text style={[styles.label, { color: colors.foreground }]}>{t.label}</Text>
                <Text style={[styles.sub, { color: colors.mutedForeground }]}>{t.sub}</Text>
              </View>
              <Switch
                value={settings[t.key]}
                onValueChange={() => toggle(t.key)}
                disabled={!loaded}
                accessibilityLabel={t.label}
                trackColor={{ true: colors.brand, false: colors.border }}
              />
            </View>
          ))}
        </View>

        {error && (
          <View style={[styles.note, { backgroundColor: colors.destructive + "18" }]} accessibilityRole="alert">
            <Text style={[styles.body, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.note, { backgroundColor: colors.ice }]}>
          <Feather name="moon" size={16} color={colors.foreground} />
          <Text style={[styles.body, styles.noteText, { color: colors.foreground }]}>
            Quiet hours: we don't send notifications between 10pm and 8am. Anything that comes in overnight waits
            until morning.
          </Text>
        </View>

        <Text style={[styles.footnote, { color: colors.mutedForeground }]}>
          To turn off all Gentoo notifications, use your phone's settings.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 20, gap: 14 },
  card: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12, minHeight: 64 },
  icon: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  text: { flex: 1, gap: 2 },
  label: { fontSize: 15, fontWeight: "600" },
  sub: { fontSize: 13, lineHeight: 18 },
  note: { flexDirection: "row", gap: 10, borderRadius: 14, padding: 14, alignItems: "flex-start" },
  noteText: { flex: 1 },
  body: { fontSize: 14, lineHeight: 20 },
  footnote: { fontSize: 13, lineHeight: 18, textAlign: "center" },
});
