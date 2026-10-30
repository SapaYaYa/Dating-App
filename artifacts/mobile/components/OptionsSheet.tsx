import { Feather } from "@expo/vector-icons";
import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

export interface SheetOption {
  label: string;
  icon?: React.ComponentProps<typeof Feather>["name"];
  destructive?: boolean;
  onPress: () => void;
}

interface Props {
  visible: boolean;
  title?: string;
  message?: string;
  options: SheetOption[];
  onClose: () => void;
}

/** A bottom menu that works the same on iOS, Android and web. */
export function OptionsSheet({ visible, title, message, options, onClose }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close menu" />
      <View style={[styles.sheet, { backgroundColor: colors.background, paddingBottom: insets.bottom + 16 }]}>
        {(title || message) && (
          <View style={styles.heading}>
            {title ? <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text> : null}
            {message ? <Text style={[styles.message, { color: colors.mutedForeground }]}>{message}</Text> : null}
          </View>
        )}
        {options.map((o) => {
          const color = o.destructive ? colors.destructive : colors.foreground;
          return (
            <TouchableOpacity
              key={o.label}
              onPress={() => {
                onClose();
                o.onPress();
              }}
              style={[styles.option, { borderBottomColor: colors.border }]}
              activeOpacity={0.7}
            >
              {o.icon && <Feather name={o.icon} size={18} color={color} />}
              <Text style={[styles.optionText, { color }]}>{o.label}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={onClose} style={styles.cancel}>
          <Text style={[styles.cancelText, { color: colors.mutedForeground }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)" },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingTop: 8, paddingHorizontal: 16 },
  heading: { paddingTop: 12, paddingBottom: 8, gap: 6 },
  title: { fontSize: 20, fontWeight: "800" },
  message: { fontSize: 15, lineHeight: 22 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    height: 56,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  optionText: { fontSize: 16, fontWeight: "600" },
  cancel: { height: 48, alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 15, fontWeight: "500" },
});
