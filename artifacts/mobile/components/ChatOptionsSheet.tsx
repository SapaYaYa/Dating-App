import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

type Action = "report" | "block" | "unmatch";

interface Props {
  visible: boolean;
  name: string;
  onClose: () => void;
  onReport: () => void;
  onBlock: () => void;
  onUnmatch: () => void;
}

const CONFIRM_COPY: Record<"block" | "unmatch", { title: string; body: string; button: string }> = {
  block: {
    title: "Block {name}?",
    body: "You won't see each other anywhere in the app, and this conversation ends.",
    button: "Block",
  },
  unmatch: {
    title: "Unmatch {name}?",
    body: "This conversation ends and you'll no longer be matched.",
    button: "Unmatch",
  },
};

/** The chat's "…" menu: Report, Block and Unmatch, with a confirm step. */
export function ChatOptionsSheet({ visible, name, onClose, onReport, onBlock, onUnmatch }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState<"block" | "unmatch" | null>(null);

  useEffect(() => {
    if (visible) setConfirming(null);
  }, [visible]);

  const choose = (action: Action) => {
    if (action === "report") {
      onClose();
      onReport();
      return;
    }
    setConfirming(action);
  };

  const confirm = () => {
    const action = confirming;
    onClose();
    if (action === "block") onBlock();
    if (action === "unmatch") onUnmatch();
  };

  const options: { action: Action; icon: React.ComponentProps<typeof Feather>["name"]; label: string }[] = [
    { action: "report", icon: "flag", label: `Report ${name}` },
    { action: "block", icon: "slash", label: `Block ${name}` },
    { action: "unmatch", icon: "user-x", label: `Unmatch ${name}` },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        {confirming ? (
          <View style={styles.confirm}>
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
              {CONFIRM_COPY[confirming].title.replace("{name}", name)}
            </Text>
            <Text style={[styles.confirmBody, { color: colors.mutedForeground }]}>
              {CONFIRM_COPY[confirming].body}
            </Text>
            <TouchableOpacity
              onPress={confirm}
              style={[styles.confirmBtn, { backgroundColor: colors.destructive }]}
              activeOpacity={0.85}
            >
              <Text style={[styles.confirmBtnText, { color: colors.destructiveForeground }]}>
                {CONFIRM_COPY[confirming].button}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirming(null)} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {options.map((o) => (
              <TouchableOpacity
                key={o.action}
                onPress={() => choose(o.action)}
                style={[styles.option, { borderBottomColor: colors.border }]}
                activeOpacity={0.7}
              >
                <Feather name={o.icon} size={18} color={colors.destructive} />
                <Text style={[styles.optionText, { color: colors.destructive }]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={onClose} style={styles.cancelBtn}>
              <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, paddingHorizontal: 16 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { fontSize: 16, fontWeight: "600" },
  confirm: { paddingTop: 12, gap: 10 },
  confirmTitle: { fontSize: 20, fontWeight: "800" },
  confirmBody: { fontSize: 15, lineHeight: 22 },
  confirmBtn: { marginTop: 8, height: 50, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  confirmBtnText: { fontSize: 16, fontWeight: "600" },
  cancelBtn: { height: 48, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15, fontWeight: "500" },
});
