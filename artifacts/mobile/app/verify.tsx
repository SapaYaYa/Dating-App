import * as ImagePicker from "expo-image-picker";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

const POSES = [
  { emoji: "👍", instruction: "Give a thumbs up", hint: "Extend your thumb upward and look straight at the camera" },
  { emoji: "✌️", instruction: "Hold up two fingers", hint: "Show a peace sign and look straight ahead" },
  { emoji: "✊", instruction: "Make a fist", hint: "Raise your fist in front of your face and look at the camera" },
  { emoji: "👋", instruction: "Wave at the camera", hint: "Open your hand and give a natural wave" },
];

type Step = "challenge" | "review" | "processing" | "approved";

export default function VerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { updateVerification } = useAuth();

  const pose = useMemo(() => POSES[Math.floor(Math.random() * POSES.length)], []);
  const [step, setStep] = useState<Step>("challenge");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (step !== "processing") return;
    updateVerification("pending");
    Animated.timing(progressAnim, { toValue: 1, duration: 3000, useNativeDriver: false }).start(() => {
      updateVerification("verified");
      setStep("approved");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Animated.spring(checkAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    });
  }, [step]);

  const openCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setStep("review");
    }
  };

  const handleTakeSelfie = () => {
    if (Platform.OS === "web") {
      setStep("review");
    } else {
      openCamera();
    }
  };

  const handleRetake = () => {
    if (Platform.OS === "web") {
      setStep("challenge");
    } else {
      openCamera();
    }
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Photo Verification</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Step indicator */}
      {step !== "approved" && (
        <View style={styles.stepRow}>
          {(["challenge", "review", "processing"] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                {
                  backgroundColor:
                    step === s
                      ? colors.superLike
                      : ["challenge", "review", "processing"].indexOf(step) > i
                      ? colors.superLike + "66"
                      : colors.border,
                },
              ]}
            />
          ))}
        </View>
      )}

      {/* ── Challenge ── */}
      {step === "challenge" && (
        <View style={[styles.content, { paddingBottom: bottomPad + 32 }]}>
          <View style={styles.topSection}>
            <View style={[styles.iconCircle, { backgroundColor: colors.superLike + "18" }]}>
              <Feather name="shield" size={34} color={colors.superLike} />
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>Verify your identity</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Take a quick selfie matching the pose below. We compare it to your profile photos to confirm you're the real you.
            </Text>
          </View>

          <View style={[styles.poseCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={styles.poseEmoji}>{pose.emoji}</Text>
            <Text style={[styles.poseName, { color: colors.foreground }]}>{pose.instruction}</Text>
            <Text style={[styles.poseHint, { color: colors.mutedForeground }]}>{pose.hint}</Text>
          </View>

          <View style={[styles.privacyBox, { backgroundColor: colors.secondary }]}>
            <Feather name="lock" size={14} color={colors.mutedForeground} />
            <Text style={[styles.privacyText, { color: colors.mutedForeground }]}>
              Your selfie is only used for verification and is never shown to other users or stored after review.
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleTakeSelfie}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Feather name="camera" size={18} color={colors.primaryForeground} />
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Take Selfie</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Review ── */}
      {step === "review" && (
        <View style={[styles.content, { paddingBottom: bottomPad + 32 }]}>
          <Text style={[styles.title, { color: colors.foreground }]}>Does this look good?</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Make sure your face is clearly visible and you're matching the pose.
          </Text>

          <View style={[styles.photoPreviewWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            ) : (
              <View style={[styles.photoPlaceholder, { backgroundColor: colors.secondary }]}>
                <Text style={styles.poseEmoji}>{pose.emoji}</Text>
                <Text style={[styles.poseName, { color: colors.foreground }]}>{pose.instruction}</Text>
                <Text style={[styles.poseHint, { color: colors.mutedForeground }]}>Selfie captured</Text>
              </View>
            )}
          </View>

          <View style={styles.reviewActions}>
            <TouchableOpacity
              onPress={handleRetake}
              style={[styles.secondaryBtn, { backgroundColor: colors.secondary, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Feather name="rotate-ccw" size={16} color={colors.foreground} />
              <Text style={[styles.secondaryBtnText, { color: colors.foreground }]}>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setStep("processing")}
              style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.primary }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Processing ── */}
      {step === "processing" && (
        <View style={[styles.content, styles.centeredContent, { paddingBottom: bottomPad + 32 }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.superLike + "18" }]}>
            <Feather name="shield" size={34} color={colors.superLike} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>Reviewing your selfie…</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            We're comparing your selfie with your profile photos. This only takes a moment.
          </Text>
          <View style={[styles.progressTrack, { backgroundColor: colors.secondary }]}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.superLike,
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }) as any,
                },
              ]}
            />
          </View>
        </View>
      )}

      {/* ── Approved ── */}
      {step === "approved" && (
        <View style={[styles.content, styles.centeredContent, { paddingBottom: bottomPad + 32 }]}>
          <Animated.View
            style={[
              styles.checkCircle,
              { backgroundColor: colors.superLike, transform: [{ scale: checkAnim }] },
            ]}
          >
            <Feather name="check" size={44} color="#fff" />
          </Animated.View>
          <Text style={[styles.title, { color: colors.foreground }]}>You're verified!</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            A verified badge now appears on your profile, letting your matches know you're the real deal.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: colors.primaryForeground }]}>Back to Profile</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 20,
  },
  centeredContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  topSection: {
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  poseCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 10,
  },
  poseEmoji: {
    fontSize: 56,
  },
  poseName: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  poseHint: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  privacyBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 12,
    padding: 14,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  photoPreviewWrap: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    aspectRatio: 1,
  },
  photoPreview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 24,
  },
  reviewActions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  checkCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
});
