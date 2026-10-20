import { isClerkAPIResponseError, useSignUp } from "@clerk/expo";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
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

import { DrumRollPicker } from "@/components/DrumRollPicker";
import {
  DEFAULT_LOOKING_FOR,
  LOOKING_FOR_OPTIONS,
  type LookingForOption,
  toggleLookingForSelection,
} from "@/constants/lookingFor";
import { useColors } from "@/hooks/useColors";

function clerkSignUpErrorMessage(code: string, fallback: string): string {
  const map: Record<string, string> = {
    form_identifier_exists: "That email address is already registered. Please use a different email or sign in.",
    form_password_pwned: "That password has appeared in a known data breach. Please choose a stronger, unique password.",
    form_password_length_too_short: "Your password is too short. Please use at least 8 characters.",
    form_password_no_uppercase: "Your password needs at least one uppercase letter.",
    form_password_no_lowercase: "Your password needs at least one lowercase letter.",
    form_password_no_number: "Your password needs at least one number.",
    form_password_no_special_char: "Your password needs at least one special character (e.g. ! @ # $).",
    form_password_size_in_bytes_exceeded: "Your password is too long. Please shorten it.",
    form_param_format_invalid: "Please enter a valid email address.",
    form_param_missing: "Please fill in all required fields.",
    verification_failed: "Email verification failed. Double-check the code and try again.",
    verification_expired: "The verification code has expired. Please request a new one.",
    form_code_incorrect: "Incorrect verification code. Please try again.",
    too_many_requests: "Too many attempts. Please wait a moment before trying again.",
    rate_limit_exceeded: "Too many attempts. Please wait a moment before trying again.",
    captcha_invalid: "Bot protection could not verify this request. Please try again.",
    captcha_missing: "Please complete the bot-protection check and try again.",
    captcha_failed: "Bot protection could not verify this request. Please try again.",
    verification_delivery_failed: "We couldn't send the verification email. Check the address and try again.",
    verification_email_send_failed: "We couldn't send the verification email. Check the address and try again.",
    network_error: "A network error occurred. Please check your connection and try again.",
  };
  if (map[code]) return map[code];
  if (code.includes("identifier_exists")) return map.form_identifier_exists;
  if (code.includes("password")) return fallback || "There's an issue with your password. Please try a different one.";
  return fallback || "Something went wrong during registration. Please try again.";
}

function clerkErrorDetails(error: unknown, fallback: string): {
  code: string;
  message: string;
} {
  if (isClerkAPIResponseError(error)) {
    const firstError = error.errors[0];
    const code = firstError?.code ?? "";
    return {
      code,
      message: clerkSignUpErrorMessage(
        code,
        firstError?.longMessage ?? firstError?.message ?? fallback,
      ),
    };
  }

  return {
    code: "",
    message: error instanceof Error && error.message ? error.message : fallback,
  };
}

const FORM_STEPS = 5;
const MAX_PHOTOS = 3;
const MIN_PHOTOS = 1;

const GENDER_OPTIONS = [
  "Man", "Woman", "Non-binary", "Trans Man", "Trans Woman",
  "Genderqueer", "Genderfluid", "Agender", "Two-Spirit",
  "Intersex", "Prefer not to say", "Other",
];

const NOW = new Date();

function calcAge(year: number, month: number, day: number): number {
  let age = NOW.getFullYear() - year;
  const m = NOW.getMonth() + 1 - month;
  if (m < 0 || (m === 0 && NOW.getDate() < day)) age--;
  return age;
}

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const { signUp, errors, fetchStatus } = useSignUp();
  const isLoading = fetchStatus === "fetching";

  const [step, setStep] = useState(1);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verifyCode, setVerifyCode] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [verifyStatus, setVerifyStatus] = useState<"verifying" | "saving" | "done" | null>(null);

  const [name, setName] = useState("");
  const [birthMonth, setBirthMonth] = useState(0);
  const [birthDay, setBirthDay] = useState(1);
  const [birthYear, setBirthYear] = useState(NOW.getFullYear() - 25);
  const [gender, setGender] = useState("");
  const [lookingFor, setLookingFor] = useState<LookingForOption[]>([
    ...DEFAULT_LOOKING_FOR,
  ]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [bio, setBio] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const BIO_MAX = 150;

  const toggleLookingFor = async (option: LookingForOption) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLookingFor((current) =>
      toggleLookingForSelection(current, option),
    );
    setSubmitError("");
  };

  const pickPhoto = async (index: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        setSubmitError("Photo library permission is required to add pictures.");
        return;
      }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = uri;
        return next;
      });
      setSubmitError("");
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
  };

  const finalizeRegistration = async (showVerificationSuccess: boolean) => {
    setVerifyStatus("saving");

    const userId = signUp.createdUserId;
    if (userId) {
      const age = calcAge(birthYear, birthMonth + 1, birthDay);
      const birthday = `${birthYear}-${String(birthMonth + 1).padStart(2, "0")}-${String(birthDay).padStart(2, "0")}`;
      const profileData = {
        name,
        age,
        birthday,
        gender,
        lookingFor,
        bio,
        images: photos.filter(Boolean),
        interests: [],
        occupation: "",
      };
      // Save locally — AuthContext will push to the API on first authenticated load
      await AsyncStorage.setItem(`spark_profile_${userId}`, JSON.stringify(profileData));
    }

    if (showVerificationSuccess) {
      setVerifyStatus("done");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await new Promise((resolve) => setTimeout(resolve, 900));
    }

    await signUp.finalize({
      navigate: ({ session }) => {
        if (session?.currentTask) {
          setVerifyStatus(null);
          setSubmitError(
            "Your email is verified, but additional account setup is required and isn't available in this version of the app.",
          );
          return;
        }
        router.replace("/(tabs)/discover");
      },
    });
  };

  const handleCreateAccount = async () => {
    setSubmitError("");
    let stage: "creating" | "sending" | "finalizing" = "creating";

    try {
      const { error } = await signUp.password({
        emailAddress: email.trim(),
        password,
      });

      if (error) {
        const { code, message } = clerkErrorDetails(
          error,
          "We couldn't create your account. Please review your details and try again.",
        );
        const isEmailTaken =
          code === "form_identifier_exists" ||
          code.includes("identifier_exists");
        setSubmitError(message);
        if (isEmailTaken) setStep(3);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      const onlyEmailNeedsVerification =
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address") &&
        signUp.missingFields.length === 0;

      if (signUp.status === "complete") {
        stage = "finalizing";
        await finalizeRegistration(false);
        return;
      }

      if (!onlyEmailNeedsVerification) {
        const missing = signUp.missingFields
          .map((field) => field.replaceAll("_", " "))
          .join(", ");
        setSubmitError(
          missing
            ? `Your account still needs: ${missing}. Please review your details and try again.`
            : "Your account needs additional information before it can be verified.",
        );
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      stage = "sending";
      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err) {
      const fallback =
        stage === "sending"
          ? "Your account was created, but we couldn't send the verification email. Please resend the code."
          : stage === "finalizing"
            ? "Your account was created, but we couldn't finish signing you in. Please return to sign in and try again."
            : "Something went wrong during registration. Please try again.";
      const { code, message } = clerkErrorDetails(
        err,
        fallback,
      );
      const isEmailTaken =
        code === "form_identifier_exists" || code.includes("identifier_exists");
      setSubmitError(
        stage === "sending"
          ? `Your account was created, but the verification email wasn't sent. ${message}`
          : message,
      );
      if (stage === "sending") setPendingVerification(true);
      if (isEmailTaken) setStep(3);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleResendCode = async () => {
    setSubmitError("");
    try {
      await signUp.verifications.sendEmailCode();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const { message } = clerkErrorDetails(
        err,
        "We couldn't resend the verification email. Please wait a moment and try again.",
      );
      setSubmitError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()) {
      setSubmitError("Please enter the verification code.");
      return;
    }
    setSubmitError("");
    setVerifyStatus("verifying");
    try {
      await signUp.verifications.verifyEmailCode({ code: verifyCode.trim() });

      if (signUp.status === "complete") {
        await finalizeRegistration(true);
      } else {
        setVerifyStatus(null);
        const clerkError = errors?.fields?.code?.message;
        setSubmitError(clerkError || "Verification failed. Please check the code and try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err) {
      setVerifyStatus(null);
      const { message } = clerkErrorDetails(
        err,
        "Verification failed. Please check the code and try again.",
      );
      setSubmitError(message);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const goNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < FORM_STEPS) {
      setStep(step + 1);
    } else {
      await handleCreateAccount();
    }
  };

  const stepValid = () => {
    if (step === 1) {
      const age = calcAge(birthYear, birthMonth + 1, birthDay);
      return name.trim().length > 0 && gender !== "" && age >= 18;
    }
    if (step === 2) return lookingFor.length > 0;
    if (step === 3) return email.trim().length > 0 && password.trim().length >= 8;
    if (step === 4) return true;
    return photos.filter(Boolean).length >= MIN_PHOTOS;
  };

  const stepTitles = ["Let's start", "Show me", "Your account", "About you", "Show yourself"];
  const stepSubs = [
    "Your name, birthday & gender",
    "Choose the gender identities you want in your card stack",
    "Email address and password",
    "Write a short bio (optional)",
    "Add at least 1 photo (up to 3) to show who you are",
  ];

  const filledPhotos = photos.filter(Boolean).length;
  const displayAge = calcAge(birthYear, birthMonth + 1, birthDay);

  const clerkError =
    errors?.fields?.emailAddress?.message ||
    errors?.fields?.password?.message ||
    errors?.fields?.code?.message;

  const localPasswordError =
    step === 3 && password.length > 0 && password.trim().length < 8
      ? "Your password is too short. Please use at least 8 characters."
      : "";
  const displayError = submitError || clerkError || localPasswordError;

  if (pendingVerification) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topRow}>
              <TouchableOpacity onPress={() => setPendingVerification(false)}>
                <Feather name="arrow-left" size={22} color={colors.foreground} />
              </TouchableOpacity>
              <View style={styles.progressRow}>
                {Array.from({ length: FORM_STEPS }).map((_, i) => (
                  <View key={i} style={[styles.progressDot, { backgroundColor: colors.primary }]} />
                ))}
              </View>
              <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>Verify</Text>
            </View>

            <View style={styles.headingSection}>
              <Text style={[styles.stepTitle, { color: colors.foreground }]}>Check your email</Text>
              <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>
                We sent a 6-digit code to {email.trim()}
              </Text>
            </View>

            <View style={[styles.verifyIconWrap, { backgroundColor: colors.primary + "18" }]}>
              <Feather name="mail" size={36} color={colors.primary} />
            </View>

            <View style={[styles.fields, { marginTop: 28 }]}>
              <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                <Feather name="key" size={16} color={colors.mutedForeground} />
                <TextInput
                  style={[styles.input, { color: colors.foreground, letterSpacing: 6, textAlign: "center", fontSize: 22, fontWeight: "700" }]}
                  placeholder="000000"
                  placeholderTextColor={colors.mutedForeground}
                  value={verifyCode}
                  onChangeText={(t) => setVerifyCode(t.replace(/\D/g, "").slice(0, 6))}
                  keyboardType="number-pad"
                  autoFocus
                  maxLength={6}
                />
              </View>
            </View>

            {displayError ? (
              <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
                <Feather name="alert-circle" size={14} color={colors.destructive} />
                <Text style={[styles.errorText, { color: colors.destructive }]}>{displayError}</Text>
              </View>
            ) : null}

            {verifyStatus === "done" ? (
              <View style={[styles.statusBanner, { backgroundColor: "#16a34a18", borderColor: "#16a34a40" }]}>
                <Feather name="check-circle" size={16} color="#16a34a" />
                <Text style={[styles.statusText, { color: "#16a34a" }]}>Account created! Taking you in…</Text>
              </View>
            ) : verifyStatus === "saving" ? (
              <View style={[styles.statusBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.primary }]}>Setting up your account…</Text>
              </View>
            ) : verifyStatus === "verifying" ? (
              <View style={[styles.statusBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "40" }]}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.statusText, { color: colors.primary }]}>Verifying code…</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={handleVerify}
                style={[styles.nextBtn, { backgroundColor: verifyCode.length === 6 ? colors.primary : colors.secondary, marginTop: 16 }]}
                activeOpacity={0.85}
                disabled={isLoading || verifyCode.length < 6}
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.primaryForeground} />
                ) : (
                  <Text style={[styles.nextText, { color: verifyCode.length === 6 ? colors.primaryForeground : colors.mutedForeground }]}>
                    Verify & Continue
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {!verifyStatus && (
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResendCode}
                disabled={isLoading}
              >
                <Text style={[styles.resendText, { color: colors.mutedForeground }]}>
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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()}>
              <Feather name="arrow-left" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.progressRow}>
              {Array.from({ length: FORM_STEPS }).map((_, i) => (
                <View
                  key={i}
                  style={[styles.progressDot, { backgroundColor: i < step ? colors.primary : colors.secondary }]}
                />
              ))}
            </View>
            <Text style={[styles.stepCounter, { color: colors.mutedForeground }]}>
              {step}/{FORM_STEPS}
            </Text>
          </View>

          <View style={styles.headingSection}>
            <Text style={[styles.stepTitle, { color: colors.foreground }]}>{stepTitles[step - 1]}</Text>
            <Text style={[styles.stepSub, { color: colors.mutedForeground }]}>{stepSubs[step - 1]}</Text>
          </View>

          {step === 1 && (
            <View style={styles.fields}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>First Name</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <Feather name="user" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Your first name"
                    placeholderTextColor={colors.mutedForeground}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    maxLength={50}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.labelRow}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Birthday</Text>
                  {displayAge >= 18 ? (
                    <Text style={[styles.agePill, { backgroundColor: colors.secondary, color: colors.mutedForeground }]}>
                      Age {displayAge}
                    </Text>
                  ) : (
                    <Text style={[styles.agePill, { backgroundColor: colors.destructive + "20", color: colors.destructive }]}>
                      Must be 18+
                    </Text>
                  )}
                </View>
                <DrumRollPicker
                  month={birthMonth}
                  day={birthDay}
                  year={birthYear}
                  onMonthChange={setBirthMonth}
                  onDayChange={setBirthDay}
                  onYearChange={setBirthYear}
                  colors={colors}
                />
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Gender</Text>
                <View style={styles.genderGrid}>
                  {GENDER_OPTIONS.map((g) => {
                    const selected = gender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setGender(g);
                        }}
                        style={[
                          styles.genderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.secondary,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                        activeOpacity={0.75}
                      >
                        {selected && (
                          <Feather name="check" size={11} color={colors.primaryForeground} />
                        )}
                        <Text
                          style={[
                            styles.genderText,
                            { color: selected ? colors.primaryForeground : colors.foreground },
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          )}

          {step === 2 && (
            <View style={styles.fields}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>
                  Select one or more
                </Text>
                <View style={styles.genderGrid}>
                  {LOOKING_FOR_OPTIONS.map((option) => {
                    const selected = lookingFor.includes(option);
                    return (
                      <TouchableOpacity
                        key={option}
                        onPress={() => toggleLookingFor(option)}
                        style={[
                          styles.genderChip,
                          {
                            backgroundColor: selected ? colors.primary : colors.secondary,
                            borderColor: selected ? colors.primary : colors.border,
                          },
                        ]}
                        activeOpacity={0.75}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: selected }}
                        accessibilityLabel={`Show me ${option}`}
                      >
                        {selected && (
                          <Feather name="check" size={11} color={colors.primaryForeground} />
                        )}
                        <Text
                          style={[
                            styles.genderText,
                            { color: selected ? colors.primaryForeground : colors.foreground },
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  Selecting Everyone clears other choices. You can change this later in Filters.
                </Text>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.fields}>
              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Email Address</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <Feather name="mail" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="you@example.com"
                    placeholderTextColor={colors.mutedForeground}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={[styles.label, { color: colors.mutedForeground }]}>Password</Text>
                <View style={[styles.inputWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <Feather name="lock" size={16} color={colors.mutedForeground} />
                  <TextInput
                    style={[styles.input, { color: colors.foreground }]}
                    placeholder="Min. 8 characters"
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
                <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                  We'll send a verification code to your email.
                </Text>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.fields}>
              <View style={styles.fieldGroup}>
                <View style={styles.bioHeader}>
                  <Text style={[styles.label, { color: colors.mutedForeground }]}>Bio (optional)</Text>
                  <Text style={[styles.charCount, { color: bio.length > BIO_MAX ? colors.destructive : colors.mutedForeground }]}>
                    {bio.length}/{BIO_MAX}
                  </Text>
                </View>
                <View style={[styles.bioWrap, { backgroundColor: colors.input, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.bioInput, { color: colors.foreground }]}
                    placeholder="Write a little about yourself..."
                    placeholderTextColor={colors.mutedForeground}
                    value={bio}
                    onChangeText={(t) => setBio(t.slice(0, BIO_MAX))}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          )}

          {step === 5 && (
            <View style={styles.fields}>
              <View style={styles.photoGrid}>
                {Array.from({ length: MAX_PHOTOS }).map((_, i) => {
                  const uri = photos[i];
                  return (
                    <View key={i} style={styles.photoSlotWrap}>
                      {uri ? (
                        <View style={[styles.photoSlot, { borderColor: colors.primary, borderWidth: 2 }]}>
                          <Image source={{ uri }} style={styles.photoImage} />
                          <TouchableOpacity
                            style={[styles.removeBtn, { backgroundColor: colors.destructive }]}
                            onPress={() => removePhoto(i)}
                            activeOpacity={0.8}
                          >
                            <Feather name="x" size={12} color="#fff" />
                          </TouchableOpacity>
                          {i === 0 && (
                            <View style={[styles.mainBadge, { backgroundColor: colors.primary }]}>
                              <Text style={[styles.mainBadgeText, { color: colors.primaryForeground }]}>Main</Text>
                            </View>
                          )}
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={[styles.photoSlot, styles.photoSlotEmpty, { backgroundColor: colors.secondary, borderColor: colors.border }]}
                          onPress={() => pickPhoto(i)}
                          activeOpacity={0.7}
                        >
                          <Feather name="plus" size={28} color={colors.mutedForeground} />
                          <Text style={[styles.photoSlotLabel, { color: colors.mutedForeground }]}>
                            {i === 0 ? "Main photo" : `Photo ${i + 1}`}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>

              <View style={[styles.photoHintRow, { backgroundColor: colors.secondary }]}>
                <Feather name="info" size={14} color={colors.mutedForeground} />
                <Text style={[styles.photoHint, { color: colors.mutedForeground }]}>
                  {filledPhotos === 0
                    ? `Add at least 1 photo to continue (up to ${MAX_PHOTOS} total)`
                    : filledPhotos === MAX_PHOTOS
                    ? "All 3 photos added — you're all set!"
                    : `${filledPhotos} of ${MAX_PHOTOS} added · you can add more or continue`}
                </Text>
              </View>
            </View>
          )}

          {displayError ? (
            <View style={[styles.errorBox, { backgroundColor: colors.destructive + "18" }]}>
              <Feather name="alert-circle" size={14} color={colors.destructive} />
              <Text style={[styles.errorText, { color: colors.destructive }]}>{displayError}</Text>
            </View>
          ) : null}

          {step === FORM_STEPS ? (
            <View style={styles.captchaArea}>
              {isLoading ? (
                <View
                  style={[
                    styles.captchaInstructions,
                    {
                      backgroundColor: colors.primary + "12",
                      borderColor: colors.primary + "35",
                    },
                  ]}
                >
                  <Feather name="shield" size={17} color={colors.primary} />
                  <View style={styles.captchaInstructionText}>
                    <Text style={[styles.captchaTitle, { color: colors.foreground }]}>
                      One last step
                    </Text>
                    <Text style={[styles.captchaBody, { color: colors.mutedForeground }]}>
                      Complete the “Verify you are human” check below. Account creation will continue automatically.
                    </Text>
                  </View>
                </View>
              ) : null}

              <View nativeID="clerk-captcha" style={styles.captchaWidget} />
            </View>
          ) : null}

          <TouchableOpacity
            onPress={goNext}
            style={[styles.nextBtn, { backgroundColor: stepValid() ? colors.primary : colors.secondary }]}
            activeOpacity={0.85}
            disabled={!stepValid() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.primaryForeground} />
            ) : (
              <Text style={[styles.nextText, { color: stepValid() ? colors.primaryForeground : colors.mutedForeground }]}>
                {step === FORM_STEPS ? "Create Account" : "Continue"}
              </Text>
            )}
          </TouchableOpacity>

          {step === 1 && (
            <TouchableOpacity onPress={() => router.back()} style={styles.backToLogin}>
              <Text style={[styles.backToLoginText, { color: colors.mutedForeground }]}>
                Already have an account?{" "}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, flexGrow: 1 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32 },
  progressRow: { flexDirection: "row", gap: 6 },
  progressDot: { width: 28, height: 4, borderRadius: 2 },
  stepCounter: { fontSize: 13, fontWeight: "600" },
  headingSection: { marginBottom: 28, gap: 6 },
  stepTitle: { fontSize: 28, fontWeight: "800" },
  stepSub: { fontSize: 15 },
  fields: { gap: 20, marginBottom: 28 },
  fieldGroup: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 13, fontWeight: "500" },
  agePill: { fontSize: 12, fontWeight: "600", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  hint: { fontSize: 12, marginTop: 2 },
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
  bioHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  charCount: { fontSize: 12 },
  bioWrap: { borderRadius: 12, borderWidth: 1, padding: 14, minHeight: 120 },
  bioInput: { fontSize: 15, lineHeight: 22 },
  genderGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  genderChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1,
  },
  genderText: { fontSize: 13, fontWeight: "500" },
  photoGrid: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  photoSlotWrap: { flex: 1 },
  photoSlot: { aspectRatio: 3 / 4, borderRadius: 16, overflow: "hidden", position: "relative" },
  photoSlotEmpty: { borderWidth: 2, borderStyle: "dashed", alignItems: "center", justifyContent: "center", gap: 6 },
  photoImage: { width: "100%", height: "100%", resizeMode: "cover" },
  photoSlotLabel: { fontSize: 11, fontWeight: "500", textAlign: "center" },
  removeBtn: {
    position: "absolute", top: 6, right: 6,
    width: 22, height: 22, borderRadius: 11,
    alignItems: "center", justifyContent: "center",
  },
  mainBadge: {
    position: "absolute", bottom: 6, left: 6,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  mainBadgeText: { fontSize: 10, fontWeight: "700" },
  photoHintRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 12 },
  photoHint: { fontSize: 13, flex: 1 },
  captchaArea: { width: "100%", alignItems: "stretch" },
  captchaInstructions: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  captchaInstructionText: { flex: 1, gap: 2 },
  captchaTitle: { fontSize: 14, fontWeight: "700" },
  captchaBody: { fontSize: 12, lineHeight: 17 },
  captchaWidget: { width: "100%", alignItems: "center" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, borderRadius: 10, marginBottom: 16 },
  statusBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 12, borderWidth: 1, marginTop: 16, marginBottom: 8 },
  statusText: { fontSize: 14, fontWeight: "600", flex: 1 },
  errorText: { fontSize: 13, flex: 1 },
  nextBtn: { borderRadius: 14, paddingVertical: 16, alignItems: "center", marginBottom: 16 },
  nextText: { fontSize: 16, fontWeight: "700" },
  backToLogin: { alignItems: "center" },
  backToLoginText: { fontSize: 14 },
  verifyIconWrap: { alignSelf: "center", width: 90, height: 90, borderRadius: 45, alignItems: "center", justifyContent: "center" },
  resendBtn: { alignItems: "center", marginTop: 20 },
  resendText: { fontSize: 14 },
});
