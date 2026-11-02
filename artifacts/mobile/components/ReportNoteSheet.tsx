import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export const NOTE_REPORT_REASONS = [
  "Rude or insulting",
  "Sexual or explicit",
  "Harassment or threats",
  "Hate speech",
  "Spam or scam",
  "Something else",
] as const;

export type NoteReportReason = (typeof NOTE_REPORT_REASONS)[number];

interface Props {
  /** Whose note is being reported; null hides the sheet. */
  name: string | null;
  onReport: (reason: NoteReportReason) => void;
  onClose: () => void;
}

/** Reporting a like note: a reason is required, then a confirm tap. */
export function ReportNoteSheet({ name, onReport, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [reason, setReason] = useState<NoteReportReason | null>(null);

  useEffect(() => {
    if (name) setReason(null);
  }, [name]);

  return (
    <Modal transparent animationType="slide" visible={!!name} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
      <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 20 }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />
        <Text style={[styles.title, { color: colors.foreground }]}>Report {name}'s note?</Text>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>
          Tell us what's wrong. Our team reviews every report, so only report notes that break the rules.
        </Text>
        <View accessibilityRole="radiogroup" style={styles.reasons}>
          {NOTE_REPORT_REASONS.map((r) => {
            const selected = reason === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setReason(r)}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                style={[
                  styles.reason,
                  {
                    borderColor: selected ? colors.foreground : colors.border,
                    borderWidth: selected ? 2 : 1,
                    backgroundColor: selected ? colors.secondary : colors.background,
                  },
                ]}
              >
                <Text style={[styles.reasonText, { color: colors.foreground }]}>{r}</Text>
                {selected && <Feather name="check" size={18} color={colors.foreground} />}
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          onPress={() => reason && onReport(reason)}
          disabled={!reason}
          style={[styles.report, { backgroundColor: colors.destructive, opacity: reason ? 1 : 0.35 }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.reportText, { color: colors.destructiveForeground }]}>Report note</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onClose} style={styles.cancel}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12, gap: 10 },
  handle: { alignSelf: "center", width: 40, height: 5, borderRadius: 3 },
  title: { fontSize: 20, fontWeight: "800", marginTop: 6 },
  body: { fontSize: 14, lineHeight: 20 },
  reasons: { gap: 8, marginTop: 4 },
  reason: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  reasonText: { fontSize: 15, fontWeight: "600" },
  report: { marginTop: 6, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  reportText: { fontSize: 16, fontWeight: "700" },
  cancel: { height: 40, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15, fontWeight: "500" },
});
