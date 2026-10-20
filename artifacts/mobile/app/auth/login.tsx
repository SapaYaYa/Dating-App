import { isClerkAPIResponseError } from "@clerk/expo";
import { useSignIn } from "@clerk/expo/legacy";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

function clerkSignInErrorMessage(code: string, rawMsg: string): string {
  const map: Record<string, string> = {
    form_identifier_not_found: "No account found with that email. Did you mean to sign up?",
    form_password_incorrect: "Incorrect password. Please try again or reset your password.",
    form_param_missing: "Please fill in all fields.",
    form_param_format_invalid: "Please enter a valid email address.",
    too_many_requests: "Too many sign-in attempts. Please wait a few minutes and try again.",
    network_error: "A network error occurred. Please check your connection and try again.",
    session_exists: "You're already signed in on this device.",
    single_session_mode: "Only one account can be active at a time. Please sign out first.",
    strategy_for_user_invalid: "That sign-in method isn't supported for this account.",
    account_not_found: "No account found with that email. Did you mean to sign up?",
  };
  if (map[code]) return map[code];
  if (code.includes("password")) return "Incorrect password. Please try again or reset your password.";
  if (code.includes("identifier") || code.includes("not_found")) return "No account found with that email.";
  // Pattern-match Clerk's raw message as a bridge for unmapped codes
  const lower = rawMsg.toLowerCase();
  if (lower.includes("password") && (lower.includes("incorrect") || lower.includes("wrong") || lower.includes("invalid"))) {
    return "Incorrect password. Please try again or reset your password.";
  }
  if (lower.includes("not found") || lower.includes("no user") || lower.includes("no account") || lower.includes("identifier")) {
    return "No account found with that email. Did you mean to sign up?";
  }
  if (lower.includes("too many") || lower.includes("rate limit") || lower.includes("requests")) {
    return "Too many sign-in attempts. Please wait a few minutes and try again.";
  }
  return rawMsg || "Sign in failed. Please check your details and try again.";
}

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  const { signIn, setActive, isLoaded } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Second factor (email OTP) state
  const [pendingSecondFactor, setPendingSecondFactor] = useState(false);
  const [secondFactorCode, setSecondFactorCode] = useState("");
  const [secondFactorStatus, setSecondFactorStatus] = useState<"verifying" | "done" | null>(null);
  const digitRefs = [
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
    useRef<RNTextInput>(null),
  ];

  useEffect(() => {
    if (loginSuccess) {
      const t = setTimeout(() => {
        router.replace("/(tabs)/discover");
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [loginSuccess]);

  const handleLogin = async () => {
    if (!isLoaded || !signIn || !setActive) return;
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      if (result.status === "complete") {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setActive({ session: result.createdSessionId });
        setLoginSuccess(true);
      } else if (result.status === "needs_second_factor") {
        // Clerk requires email OTP as a second factor — send the code and show the verify step
        await signIn.prepareSecondFactor({ strategy: "email_code" });
        setPendingSecondFactor(true);
      } else {
        setError(`Sign-in incomplete (status: ${result.status}). Please try again.`);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const first = e?.errors?.[0] ?? (Array.isArray(e) ? e[0] : null);
      const code: string = first?.code ?? e?.code ?? "";
      const rawMsg: string = first?.longMessage ?? first?.message ?? e?.longMessage ?? e?.message ?? (err instanceof Error ? err.message : "");
      setError(clerkSignInErrorMessage(code, rawMsg));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondFactor = async () => {
    if (!signIn || !setActive || !secondFactorCode.trim()) return;
    setError("");
    setSecondFactorStatus("verifying");
    try {
      const result = await signIn.attemptSecondFactor({
        strategy: "email_code",
        code: secondFactorCode.trim(),
      });

      if (result.status === "complete") {
        setSecondFactorStatus("done");
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setActive({ session: result.createdSessionId });
        setLoginSuccess(true);
      } else {
        setSecondFactorStatus(null);
        setError("Verification failed. Please check the code and try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setSecondFactorStatus(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const first = e?.errors?.[0] ?? (Array.isArray(e) ? e[0] : null);
      const code: string = first?.code ?? e?.code ?? "";
      const rawMsg: string = first?.longMessage ?? first?.message ?? e?.longMessage ?? e?.message ?? (err instanceof Error ? err.message : "");
      setError(clerkSignInErrorMessage(code, rawMsg));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const displayError = error;

  if (loginSuccess) {
    return (
      <View style={[styles.root, styles.successRoot, { backgroundColor: colors.background }]}>
        <View style={[styles.successCircle, { backgroundColor: "#22c55e18" }]}>
          <Feather name="check-circle" size={64} color="#22c55e" />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>Signed in!</Text>
        <Text style={[styles.successSub, { color: colors.mutedForeground }]}>
          Welcome back. Taking you home…
        </Text>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
      </View>
    );
  }

  if (pendingSecondFactor) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity onPress={() => { setPendingSecondFactor(false); setError(""); setSecondFactorCode(""); }} style={{ marginBottom: 24 }}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </TouchableOpacity>

            <View style={[styles.successCircle, { backgroundColor: colors.primary + "18", width: 80, height: 80, borderRadius: 40, marginBottom: 20 }]}>
              <Feather name="mail" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.successTitle, { color: colors.foreground, fontSize: 24, marginBottom: 8 }]}>Check your email</Text>
            <Text style={[{ color: colors.mutedForeground, fontSize: 15, textAlign: "center", marginBottom: 32 }]}>
              We sent a 6-digit code to {email.trim()}
            </Text>

            <View style={styles.digitRow}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TextInput
                  key={i}
                  ref={digitRefs[i]}
                  style={[
                    styles.digitBox,
                    {
                      color: colors.foreground,
                      backgroundColor: colors.input,
                      borderColor: secondFactorCode[i] ? colors.primary : colors.border,
                    },
                  ]}
                  value={secondFactorCode[i] ?? ""}
                  onChangeText={(t) => {
                    const digit = t.replace(/\D/g, "").slice(-1);
                    const arr = secondFactorCode.split("");
                    arr[i] = digit;
                    const next = arr.join("").slice(0, 6);
                    setSecondFactorCode(next);
                    if (digit && i < 5) digitRefs[i + 1].current?.focus();
                  }}
                  onKeyPress={({ nativeEvent }) => {
                    if (nativeEvent.key === "Backspace" && !secondFactorCode[i] && i > 0) {
                      const arr = secondFactorCode.split("");
                      arr[i - 1] = "";
                      setSecondFactorCode(arr.join(""));
                      digitRefs[i - 1].current?.focus();
                    }
                  }}
                  keyboardType="numeric"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {displayError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{displayError}</Text>
              </View>
            ) : null}

            {secondFactorStatus === "done" ? (
              <View style={[styles.statusBanner, { backgroundColor: "#16a34a18", borderColor: "#16a34a40" }]}>
                <Feather name="check-circle" size={16} color="#16a34a" />
                <Text style={[styles.statusText, { color: "#16a34a" }]}>Verified! Signing you in…</Text>
              </View>
            ) : secondFactorStatus === "verifying" ? (
              <View style={[styles.statusBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.primary }]}>Verifying code…</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleSecondFactor}
                style={[styles.loginBtn, { backgroundColor: secondFactorCode.length === 6 ? colors.primary : colors.secondary }]}
                activeOpacity={0.85}
                disabled={secondFactorCode.length < 6}
              >
                <Text style={[styles.loginText, { color: secondFactorCode.length === 6 ? colors.primaryForeground : colors.mutedForeground }]}>
                  Verify & Sign In
                </Text>
              </TouchableOpacity>
            )}

            {!secondFactorStatus && (
              <TouchableOpacity
                style={{ alignItems: "center", marginTop: 20 }}
                onPress={() => signIn?.prepareSecondFactor({ strategy: "email_code" })}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                  Didn't receive it?{" "}
                  <Text style={{ color: colors.primary, fontWeight: "700" }}>Resend code</Text>
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + (Platform.OS === "web" ? 20 : 0), paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoSection}>
            <View style={[styles.logoMark, { backgroundColor: colors.primary }]}>
              <Feather name="heart" size={28} color={colors.primaryForeground} />
            </View>
            <Text style={[styles.appName, { color: colors.foreground }]}>Spark</Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              Meet people who matter
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: isDark ? colors.card : colors.background }]}>
            <View style={styles.fields}>
              <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Email address"
                  placeholderTextColor={colors.mutedForeground}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground }]}
                  placeholder="Password"
                  placeholderTextColor={colors.mutedForeground}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Feather name={showPassword ? "eye-off" : "eye"} size={16} color={colors.mutedForeground} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotBtn}
                onPress={() => router.push({
                  pathname: "/auth/reset-password",
                  params: email.trim() ? { email: email.trim() } : {},
                })}
                accessibilityRole="button"
              >
                <Text style={[styles.forgotText, { color: colors.mutedForeground }]}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {displayError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{displayError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.loginBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.85}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text style={[styles.loginText, { color: colors.primaryForeground }]}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <Text style={[styles.orText, { color: colors.mutedForeground }]}>or continue with</Text>
              <View style={[styles.line, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="music" size={18} color={colors.spotify} />
                <Text style={[styles.socialText, { color: colors.foreground }]}>Spotify</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="instagram" size={18} color={colors.foreground} />
                <Text style={[styles.socialText, { color: colors.foreground }]}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.registerRow}>
            <Text style={[styles.registerPrompt, { color: colors.mutedForeground }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={[styles.registerLink, { color: colors.primary }]}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  logoSection: { alignItems: "center", marginTop: 40, marginBottom: 36 },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  appName: { fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { fontSize: 15, marginTop: 4 },
  card: { borderRadius: 20, padding: 24, gap: 16 },
  fields: { gap: 12 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: { flex: 1, fontSize: 15 },
  forgotBtn: { alignSelf: "flex-end" },
  forgotText: { fontSize: 13 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { fontSize: 13, flex: 1 },
  loginBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginText: { fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { flex: 1, height: 1 },
  orText: { fontSize: 12 },
  socialRow: { flexDirection: "row", gap: 10 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  socialText: { fontSize: 13, fontWeight: "600" },
  registerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 28,
  },
  registerPrompt: { fontSize: 14 },
  registerLink: { fontSize: 14, fontWeight: "700" },
  successRoot: { alignItems: "center", justifyContent: "center" },
  successCircle: { width: 120, height: 120, borderRadius: 60, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  successSub: { fontSize: 15, marginTop: 8, textAlign: "center", paddingHorizontal: 32 },
  digitRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginBottom: 12,
  },
  digitBox: {
    width: 48,
    height: 60,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  statusText: { fontSize: 13, flex: 1, fontWeight: "600" },
});
