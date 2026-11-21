import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { BACKGROUND_CHECK_STATEMENT, SAFETY_TIPS } from "@/constants/safety";
import { useColors } from "@/hooks/useColors";

/** The background-check statement and the safety tips, as a list. */
export function SafetyTips() {
  const colors = useColors();
  return (
    <View style={styles.wrap}>
      <View style={[styles.statement, { backgroundColor: colors.ice }]}>
        <Feather name="info" size={16} color={colors.foreground} />
        <Text style={[styles.statementText, { color: colors.foreground }]}>{BACKGROUND_CHECK_STATEMENT}</Text>
      </View>
      {SAFETY_TIPS.map((tip, i) => (
        <View key={tip.title} style={[styles.tip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.num, { backgroundColor: colors.brand }]}>
            <Text style={[styles.numText, { color: colors.brandForeground }]}>{i + 1}</Text>
          </View>
          <View style={styles.tipText}>
            <Text style={[styles.tipTitle, { color: colors.foreground }]}>{tip.title}</Text>
            <Text style={[styles.tipBody, { color: colors.mutedForeground }]}>{tip.body}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  statement: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 14, alignItems: "flex-start" },
  statementText: { flex: 1, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  tip: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1, alignItems: "flex-start" },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  numText: { fontSize: 13, fontWeight: "800" },
  tipText: { flex: 1, gap: 3 },
  tipTitle: { fontSize: 15, fontWeight: "700" },
  tipBody: { fontSize: 14, lineHeight: 20 },
});
