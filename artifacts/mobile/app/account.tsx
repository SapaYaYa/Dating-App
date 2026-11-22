import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type DeleteReason, useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const REASONS: { value: DeleteReason; label: string }[] = [
  { value: "met_on_gentoo", label: "I met someone on Gentoo" },
  { value: "met_elsewhere", label: "I met someone elsewhere" },
  { value: "taking_break", label: "I'm taking a break" },
  { value: "not_enough_people", label: "Not enough people near me" },
  { value: "not_for_me", label: "Gentoo isn't for me" },
  { value: "other", label: "Other" },
];

const SUBSCRIPTION_URL =
  Platform.OS === "android"
    ? "https://play.google.com/store/account/subscriptions"
    : "https://apps.apple.com/account/subscriptions";

type Step = "main" | "delete" | "confirm";

/** Profile > Account > Pause or delete account. */
export default function AccountScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, setPaused, deleteAccount } = useAuth();
  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  const [step, setStep] = useState<Step>("main");
  const [reason, setReason] = useState<DeleteReason | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const paused = !!user?.paused;

  const back = () => {
    setError(null);
    if (step === "confirm") setStep("delete");
    else if (step === "delete") setStep("main");
    else router.back();
  };

  const togglePause = async () => {
    setBusy(true);
    setError(null);
    try {
      await setPaused(!paused);
    } catch {
      setError("Couldn't update your account. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(reason ?? undefined);
      router.replace("/auth/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete your account. Please try again.");
      setBusy(false);
    }
  };

  const errorBox = error ? (
    <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]} accessibilityRole="alert">
      <Text style={[styles.body, { color: colors.destructive }]}>{error}</Text>
    </View>
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={back} style={styles.backBtn} accessibilityLabel="Back" disabled={busy}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {step === "main" ? "Pause or delete account" : "Delete account"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}>
        {step === "main" && (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHead}>
                <Feather name="pause-circle" size={20} color={colors.foreground} />
                <Text style={[styles.h2, { color: colors.foreground }]}>
                  {paused ? "Your account is paused" : "Pause my account"}
                </Text>
              </View>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>
                {paused
                  ? "New people can't see you on Discover. Your matches and chats are still here. Unpause whenever you're ready."
                  : "Take a break without losing anything. While you're paused, new people won't see you on Discover. Your matches and chats stay, and you can unpause anytime."}
              </Text>
              <TouchableOpacity
                onPress={togglePause}
                disabled={busy}
                style={[styles.btn, { backgroundColor: colors.brand }]}
                accessibilityRole="button"
              >
                {busy ? (
                  <ActivityIndicator color={colors.brandForeground} />
                ) : (
                  <Text style={[styles.btnText, { color: colors.brandForeground }]}>
                    {paused ? "Unpause my account" : "Pause my account"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {errorBox}

            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHead}>
                <Feather name="trash-2" size={20} color={colors.destructive} />
                <Text style={[styles.h2, { color: colors.foreground }]}>Delete my account</Text>
              </View>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>
                Permanently delete your profile, photos, matches, chats, pebbles and points. This can't be undone.
              </Text>
              <TouchableOpacity
                onPress={() => { setError(null); setStep("delete"); }}
                disabled={busy}
                style={[styles.btn, styles.btnOutline, { borderColor: colors.destructive }]}
                accessibilityRole="button"
              >
                <Text style={[styles.btnText, { color: colors.destructive }]}>Delete my account</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {step === "delete" && (
          <>
            <Text style={[styles.h2, { color: colors.foreground }]}>Why are you leaving?</Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>Optional. It helps us make Gentoo better.</Text>
            <View style={[styles.card, styles.list, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {REASONS.map((r, i) => {
                const selected = reason === r.value;
                return (
                  <TouchableOpacity
                    key={r.value}
                    onPress={() => setReason(selected ? null : r.value)}
                    style={[styles.reasonRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                  >
                    <View style={[styles.radio, { borderColor: selected ? colors.brand : colors.border }]}>
                      {selected && <View style={[styles.radioDot, { backgroundColor: colors.brand }]} />}
                    </View>
                    <Text style={[styles.reasonText, { color: colors.foreground }]}>{r.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {reason === "taking_break" && !paused && (
              <View style={[styles.note, { backgroundColor: colors.ice }]}>
                <Text style={[styles.body, { color: colors.foreground }]}>
                  Just need a break? Pausing hides you from Discover and keeps your matches and chats.
                </Text>
                <TouchableOpacity onPress={() => setStep("main")} accessibilityRole="button">
                  <Text style={[styles.link, { color: colors.brand }]}>Pause instead</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={[styles.note, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.body, { color: colors.foreground }]}>
                Deleting your account doesn't cancel a subscription. If you have one, cancel it in your{" "}
                {Platform.OS === "android" ? "Google Play" : "App Store"} settings.
              </Text>
              <TouchableOpacity
                onPress={() => WebBrowser.openBrowserAsync(SUBSCRIPTION_URL).catch(() => {})}
                accessibilityRole="link"
              >
                <Text style={[styles.link, { color: colors.brand }]}>Manage subscription</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setStep("confirm")}
              style={[styles.btn, { backgroundColor: colors.destructive }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, { color: colors.destructiveForeground }]}>Continue</Text>
            </TouchableOpacity>
          </>
        )}

        {step === "confirm" && (
          <>
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.h2, { color: colors.foreground }]}>Delete your account for good?</Text>
              <Text style={[styles.body, { color: colors.mutedForeground }]}>
                Your profile, photos, matches, chats, pebbles and points will be deleted, and you'll be signed out.
                You can't undo this.
              </Text>
            </View>
            {errorBox}
            <TouchableOpacity
              onPress={confirmDelete}
              disabled={busy}
              style={[styles.btn, { backgroundColor: colors.destructive }]}
              accessibilityRole="button"
            >
              {busy ? (
                <ActivityIndicator color={colors.destructiveForeground} />
              ) : (
                <Text style={[styles.btnText, { color: colors.destructiveForeground }]}>
                  {error ? "Try again" : "Delete my account"}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.back()}
              disabled={busy}
              style={[styles.btn, styles.btnOutline, { borderColor: colors.border }]}
              accessibilityRole="button"
            >
              <Text style={[styles.btnText, { color: colors.foreground }]}>Keep my account</Text>
            </TouchableOpacity>
          </>
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
  scroll: { padding: 20, gap: 14 },
  card: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 10 },
  cardHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  h2: { fontSize: 18, fontWeight: "800" },
  body: { fontSize: 14, lineHeight: 20 },
  btn: { borderRadius: 999, minHeight: 48, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  btnOutline: { borderWidth: 1.5 },
  btnText: { fontSize: 15, fontWeight: "800" },
  list: { paddingVertical: 0, gap: 0 },
  reasonRow: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 50 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  reasonText: { fontSize: 15, flex: 1 },
  note: { borderRadius: 14, padding: 14, gap: 8 },
  link: { fontSize: 14, fontWeight: "800" },
  errorBox: { borderRadius: 12, padding: 12 },
});
