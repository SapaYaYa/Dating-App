import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function resetError(error: unknown): string {
  if (isClerkAPIResponseError(error)) {
    const first = error.errors[0];
    if (first?.code === "form_identifier_not_found") {
      return "No account found with that email address.";
    }
    if (first?.code === "form_code_incorrect" || first?.code === "verification_failed") {
      return "That code is incorrect. Check your email and try again.";
    }
    if (first?.code === "verification_expired") {
      return "That code has expired. Request a new one.";
    }
    return first?.longMessage ?? first?.message ?? "Could not reset your password. Please try again.";
  }
  return error instanceof Error ? error.message : "Could not reset your password. Please try again.";
}

export default function ResetPasswordScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();
  const { signIn, setActive, isLoaded } = useSignIn();
  const [email, setEmail] = useState(typeof initialEmail === "string" ? initialEmail : "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stage, setStage] = useState<"email" | "code" | "done">("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async () => {
    if (!isLoaded || !signIn || busy) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setStage("code");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError(resetError(err));
    } finally {
      setBusy(false);
    }
  };

  const finishReset = async () => {
    if (!isLoaded || !signIn || busy) return;
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        setStage("done");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)/discover");
      } else {
        setError("Your password was changed, but sign-in needs another step. Return to sign in with your new password.");
      }
    } catch (err) {
      setError(resetError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, {
            paddingTop: insets.top + (Platform.OS === "web" ? 67 : 24),
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 24),
          }]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity
            onPress={() => router.replace("/auth/login")}
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            style={styles.back}
          >
            <Feather name="arrow-left" size={22} color={colors.foreground} />
            <Text style={[styles.backText, { color: colors.foreground }]}>Back to sign in</Text>
          </TouchableOpacity>

          <View style={[styles.icon, { backgroundColor: colors.primary + "18" }]}>
            <Feather name="lock" size={30} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Reset your password</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {stage === "email"
              ? "Enter your account email and we'll send you a reset code."
              : stage === "code"
                ? `Enter the code sent to ${email.trim()} and choose a new password.`
                : "Your password has been reset."}
          </Text>

          {stage === "email" && (
            <TextInput
              style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Email address"
              placeholderTextColor={colors.mutedForeground}
              value={email}
              onChangeText={(value) => { setEmail(value); setError(""); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              accessibilityLabel="Account email address"
            />
          )}

          {stage === "code" && (
            <>
              <TextInput
                style={[styles.input, { backgroundColor: colors.input, borderColor: colors.border, color: colors.foreground }]}
                placeholder="6-digit reset code"
                placeholderTextColor={colors.mutedForeground}
                value={code}
                onChangeText={(value) => { setCode(value.replace(/\D/g, "").slice(0, 6)); setError(""); }}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={6}
                accessibilityLabel="Reset code"
              />
              <View style={[styles.passwordRow, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.foreground }]}
                  placeholder="New password (at least 8 characters)"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={(value) => { setPassword(value); setError(""); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="new-password"
                  accessibilityLabel="New password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((current) => !current)}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                >
                  <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>
            </>
          )}

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
              <Feather name="alert-circle" size={16} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
            </View>
          ) : null}

          {stage !== "done" && (
            <TouchableOpacity
              onPress={stage === "email" ? sendCode : finishReset}
              disabled={busy || !isLoaded}
              style={[styles.button, { backgroundColor: colors.primary, opacity: busy || !isLoaded ? 0.6 : 1 }]}
              accessibilityRole="button"
            >
              {busy ? <ActivityIndicator color={colors.primaryForeground} /> : (
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                  {stage === "email" ? "Send reset code" : "Reset password"}
                </Text>
              )}
            </TouchableOpacity>
          )}

          {stage === "code" && (
            <TouchableOpacity
              onPress={sendCode}
              disabled={busy}
              style={styles.resend}
              accessibilityRole="button"
            >
              <Text style={{ color: colors.primary }}>Resend code</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24 },
  back: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 40 },
  backText: { fontSize: 14, fontWeight: "600" },
  icon: { width: 64, height: 64, borderRadius: 18, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15, marginBottom: 14 },
  passwordRow: { borderWidth: 1, borderRadius: 12, flexDirection: "row", alignItems: "center", paddingRight: 14, marginBottom: 14 },
  passwordInput: { flex: 1, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  button: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8 },
  buttonText: { fontSize: 16, fontWeight: "700" },
  resend: { alignSelf: "center", padding: 16, marginTop: 8 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, marginBottom: 14 },
  errorText: { flex: 1, fontSize: 13 },
});