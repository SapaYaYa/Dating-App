import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AD_RULES } from "@/constants/ads";
import type { Profile } from "@/constants/mockData";
import { LIKE_NOTE_MAX, type LikeTarget } from "@/constants/prompts";
import { useColors } from "@/hooks/useColors";

interface Props {
  profile: Profile | null;
  target: LikeTarget | null;
  likesLeft: number;
  /** Extra-likes ads still available today. */
  adsLeft: number;
  /** Note to start with, e.g. kept while an ad played. */
  initialNote?: string;
  onSend: (note: string) => void;
  /** Watch an ad for more likes; passes the note typed so far. */
  onWatchAd: (note: string) => void;
  onClose: () => void;
}

/** Opens from a heart: shows the photo or answer being liked, an optional note, and Send like. */
export function LikePanel({ profile, target, likesLeft, adsLeft, initialNote, onSend, onWatchAd, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState("");
  const visible = !!profile && !!target;

  useEffect(() => {
    if (visible) setNote(initialNote ?? "");
  }, [visible, profile?.id, target?.kind, target?.index]);

  if (!profile || !target) return null;
  const prompt = target.kind === "prompt" ? profile.prompts[target.index] : null;
  const photo = target.kind === "photo" ? profile.images[target.index] : null;
  const outOfLikes = likesLeft <= 0;

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          {photo ? <Image source={{ uri: photo }} style={styles.photo} /> : null}
          {prompt ? (
            <View style={[styles.prompt, { backgroundColor: colors.card }]}>
              <Text style={[styles.question, { color: colors.mutedForeground }]}>{prompt.question}</Text>
              <Text style={[styles.answer, { color: colors.foreground }]}>{prompt.answer}</Text>
            </View>
          ) : null}

          <Text style={[styles.label, { color: colors.foreground }]}>
            Add a note <Text style={{ color: colors.mutedForeground, fontWeight: "400" }}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.foreground }]}
            placeholder={`Say something to ${profile.name} about this...`}
            placeholderTextColor={colors.mutedForeground}
            value={note}
            onChangeText={(t) => setNote(t.slice(0, LIKE_NOTE_MAX))}
            maxLength={LIKE_NOTE_MAX}
            multiline
            accessibilityLabel="Note"
          />
          <Text style={[styles.count, { color: colors.mutedForeground }]}>
            {note.length}/{LIKE_NOTE_MAX}
          </Text>

          {outOfLikes && (
            <Text style={[styles.outOfLikes, { color: colors.destructive }]}>
              {adsLeft > 0
                ? "You're out of likes. Watch a short ad to get more, or complete a challenge."
                : "You're out of likes for today. Complete a challenge to earn more."}
            </Text>
          )}
          {outOfLikes && adsLeft > 0 ? (
            <TouchableOpacity
              onPress={() => onWatchAd(note)}
              style={[styles.send, { backgroundColor: colors.gold }]}
              activeOpacity={0.85}
              accessibilityRole="button"
            >
              <Feather name="play-circle" size={18} color="#fff" />
              <Text style={styles.sendText}>
                Watch an ad for +{AD_RULES.EXTRA_LIKES_PER_AD} likes ({adsLeft} left today)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => onSend(note.trim())}
              disabled={outOfLikes}
              style={[styles.send, { backgroundColor: colors.accent, opacity: outOfLikes ? 0.4 : 1 }]}
              activeOpacity={0.85}
            >
              <Feather name="heart" size={18} color="#fff" />
              <Text style={styles.sendText}>{note.trim() ? "Send like with note" : "Send like"}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} style={styles.cancel}>
            <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 12 },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3 },
  photo: { width: "100%", height: 200, borderRadius: 16 },
  prompt: { borderRadius: 16, padding: 18, gap: 6 },
  question: { fontSize: 13, fontWeight: "600" },
  answer: { fontSize: 18, lineHeight: 24, fontWeight: "700" },
  label: { fontSize: 14, fontWeight: "700" },
  input: { minHeight: 80, borderWidth: 1, borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: "top" },
  count: { alignSelf: "flex-end", fontSize: 12, marginTop: -6 },
  outOfLikes: { fontSize: 13, textAlign: "center" },
  send: { height: 52, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  sendText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancel: { height: 40, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15, fontWeight: "500" },
});
