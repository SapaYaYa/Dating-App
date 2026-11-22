import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { GentooPair, Gus } from "@/components/Gentoo";
import { useColors } from "@/hooks/useColors";

/** Set once the welcome has been finished or skipped on this phone. */
export const WELCOME_SEEN_KEY = "spark_welcome_seen";

const CARDS = [
  {
    art: "gus",
    title: "Pebbles are how you like someone",
    body: "You get 5 a day, so make each one count.",
  },
  {
    art: "pair",
    title: "Give a pebble back and it's a pair",
    body: "Then you can chat.",
  },
  {
    art: "gusWave",
    title: "Reply, and you'll rise",
    body: "Good conversations earn badges, levels and perks.",
  },
] as const;

/** Whether the welcome still needs showing; null while checking. */
export function useWelcomeNeeded(): [boolean | null, () => void] {
  const [needed, setNeeded] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem(WELCOME_SEEN_KEY)
      .then((v) => setNeeded(v !== "true"))
      .catch(() => setNeeded(false));
  }, []);
  const done = () => {
    setNeeded(false);
    AsyncStorage.setItem(WELCOME_SEEN_KEY, "true").catch(() => {});
  };
  return [needed, done];
}

/** Gus's three-card welcome, shown once after sign-up. */
export function WelcomeSheet({ onDone }: { onDone: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const card = CARDS[index];
  const last = index === CARDS.length - 1;

  return (
    <Modal visible animationType="fade" onRequestClose={onDone}>
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.topRow}>
          {!last ? (
            <TouchableOpacity onPress={onDone} style={styles.skip} accessibilityRole="button" accessibilityLabel="Skip welcome">
              <Text style={[styles.skipText, { color: colors.mutedForeground }]}>Skip</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.skip} />
          )}
        </View>

        <View style={styles.center}>
          <View style={styles.art}>
            {card.art === "pair" ? <GentooPair size={190} /> : <Gus size={190} holdingPebble={card.art === "gus"} />}
          </View>
          <Text style={[styles.title, { color: colors.foreground }]} accessibilityRole="header">
            {card.title}
          </Text>
          <Text style={[styles.body, { color: colors.mutedForeground }]}>{card.body}</Text>
        </View>

        <View style={styles.dots} accessibilityLabel={`Card ${index + 1} of ${CARDS.length}`}>
          {CARDS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === index ? colors.brand : colors.border }, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          onPress={() => (last ? onDone() : setIndex(index + 1))}
          style={[styles.btn, { backgroundColor: colors.brand }]}
          accessibilityRole="button"
        >
          <Text style={[styles.btnText, { color: colors.brandForeground }]}>{last ? "Start exploring" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  topRow: { flexDirection: "row", justifyContent: "flex-end" },
  skip: { minWidth: 64, minHeight: 44, paddingHorizontal: 12, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  skipText: { fontSize: 15, fontWeight: "700" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 14 },
  art: { marginBottom: 18 },
  title: { fontSize: 26, fontWeight: "800", textAlign: "center", lineHeight: 32 },
  body: { fontSize: 17, lineHeight: 24, textAlign: "center", maxWidth: 320 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 20 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 22 },
  btn: { borderRadius: 999, minHeight: 52, alignItems: "center", justifyContent: "center" },
  btnText: { fontSize: 16, fontWeight: "800" },
});
