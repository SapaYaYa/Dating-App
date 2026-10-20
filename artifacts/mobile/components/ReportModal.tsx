import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCreateReport } from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { blockProfile } from "@/utils/blocks";

const STORAGE_KEY = "spark_reports";

const REPORT_CATEGORIES = [
  "Fake Profile",
  "Harassment",
  "Spam",
  "Inappropriate Photos",
  "Violence",
  "Catfishing",
  "Impersonation",
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

export interface ReportRecord {
  profileId: string;
  category: ReportCategory;
  note: string;
  timestamp: string;
}

interface ReportModalProps {
  visible: boolean;
  profileId: string;
  profileName: string;
  onClose: () => void;
  onBlocked?: (profileId: string) => void;
}

const { height: SCREEN_H } = Dimensions.get("window");

export async function getReports(): Promise<ReportRecord[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ReportRecord[]) : [];
  } catch {
    return [];
  }
}

export async function hasReported(profileId: string): Promise<boolean> {
  const reports = await getReports();
  return reports.some((r) => r.profileId === profileId);
}

async function saveReport(record: ReportRecord): Promise<void> {
  const existing = await getReports();
  const updated = [...existing, record];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

type Stage = "categories" | "note" | "success";

export default function ReportModal({
  visible,
  profileId,
  profileName,
  onClose,
  onBlocked,
}: ReportModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [stage, setStage] = useState<Stage>("categories");
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const createReport = useCreateReport();

  const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      setStage("categories");
      setSelectedCategory(null);
      setNote("");
      setBlocking(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_H,
        duration: 240,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SCREEN_H,
      duration: 240,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  const handleSelectCategory = (cat: ReportCategory) => {
    Haptics.selectionAsync();
    setSelectedCategory(cat);
    setStage("note");
  };

  const handleSubmit = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const savedReport = await createReport.mutateAsync({
        data: {
          reportedProfileId: profileId,
          category: selectedCategory,
          note: note.trim(),
        },
      });

      const record: ReportRecord = {
        profileId,
        category: selectedCategory,
        note: note.trim(),
        timestamp: savedReport.timestamp,
      };
      try {
        await saveReport(record);
      } catch {
        console.warn(
          "Report submitted, but the local reported-profile cache could not be updated.",
        );
      }

      setSubmitting(false);
      setStage("success");
    } catch {
      setSubmitting(false);
      Alert.alert(
        "Couldn't submit report",
        "Please check your connection and try again.",
      );
    }
  };

  const handleBlock = async () => {
    setBlocking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await blockProfile(profileId);
      setBlocking(false);
      onBlocked?.(profileId);
      handleClose();
    } catch {
      setBlocking(false);
      Alert.alert("Couldn't block this profile", "Please try again.");
    }
  };

  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
              paddingBottom: bottomPad + 8,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {stage === "categories" && (
            <>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
                  Report {profileName}
                </Text>
                <Text
                  style={[
                    styles.sheetSubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Select the reason for your report
                </Text>
              </View>

              <ScrollView
                bounces={false}
                showsVerticalScrollIndicator={false}
                style={styles.categoryList}
              >
                {REPORT_CATEGORIES.map((cat, i) => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => handleSelectCategory(cat)}
                    activeOpacity={0.7}
                    style={[
                      styles.categoryItem,
                      {
                        borderBottomColor: colors.border,
                        borderBottomWidth:
                          i < REPORT_CATEGORIES.length - 1
                            ? StyleSheet.hairlineWidth
                            : 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryText,
                        { color: colors.foreground },
                      ]}
                    >
                      {cat}
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={colors.mutedForeground}
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}

          {stage === "note" && (
            <>
              <View style={styles.sheetHeader}>
                <TouchableOpacity
                  onPress={() => setStage("categories")}
                  style={styles.backRow}
                >
                  <Feather
                    name="arrow-left"
                    size={18}
                    color={colors.mutedForeground}
                  />
                  <Text
                    style={[styles.backText, { color: colors.mutedForeground }]}
                  >
                    {selectedCategory}
                  </Text>
                </TouchableOpacity>
                <Text
                  style={[styles.sheetTitle, { color: colors.foreground }]}
                >
                  Add details (optional)
                </Text>
                <Text
                  style={[
                    styles.sheetSubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Help us understand what happened
                </Text>
              </View>

              <View
                style={[
                  styles.noteWrap,
                  {
                    backgroundColor: colors.input,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.noteInput, { color: colors.foreground }]}
                  placeholder="Describe the issue..."
                  placeholderTextColor={colors.mutedForeground}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  maxLength={500}
                  autoFocus
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={[
                  styles.submitBtn,
                  { backgroundColor: colors.destructive, opacity: submitting ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.submitText}>
                  {submitting ? "Submitting…" : "Submit Report"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleClose}
                style={[
                  styles.cancelBtn,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text
                  style={[
                    styles.cancelText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          )}

          {stage === "success" && (
            <View style={styles.successWrap}>
              <View
                style={[
                  styles.successIcon,
                  { backgroundColor: colors.green + "22" },
                ]}
              >
                <Feather name="check-circle" size={36} color={colors.green} />
              </View>
              <Text
                style={[styles.successTitle, { color: colors.foreground }]}
              >
                Report Submitted
              </Text>
              <Text
                style={[
                  styles.successSub,
                  { color: colors.mutedForeground },
                ]}
              >
                Thanks for your report. We'll review it shortly.
              </Text>
              <TouchableOpacity
                onPress={handleBlock}
                disabled={blocking}
                style={[
                  styles.blockBtn,
                  {
                    backgroundColor: colors.destructive,
                    opacity: blocking ? 0.7 : 1,
                  },
                ]}
              >
                <Feather name="slash" size={16} color="#fff" />
                <Text style={styles.blockText}>
                  {blocking ? "Blocking…" : `Block ${profileName}`}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.doneBtn}
                disabled={blocking}
              >
                <Text
                  style={[
                    styles.doneText,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 16,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  sheetHeader: {
    gap: 4,
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  sheetSubtitle: {
    fontSize: 13,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  backText: {
    fontSize: 13,
  },
  categoryList: {
    maxHeight: SCREEN_H * 0.45,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  categoryText: {
    fontSize: 16,
  },
  noteWrap: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 100,
    marginBottom: 14,
  },
  noteInput: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 76,
    textAlignVertical: "top",
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 10,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
  },
  successWrap: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 12,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  successSub: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  blockBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  blockText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  doneBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  doneText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
