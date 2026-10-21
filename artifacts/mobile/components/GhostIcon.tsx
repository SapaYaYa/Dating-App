import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

interface GhostIconProps {
  size?: number;
  color: string;
  strokeWidth?: number;
}

export function GhostIcon({ size = 16, color, strokeWidth = 2 }: GhostIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M9 10h.01" />
      <Path d="M15 10h.01" />
      <Path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
    </Svg>
  );
}

/** Small ghost marker that sits on the corner of a match's photo. */
export function GhostBadgeDot({ size = 22 }: { size?: number }) {
  const colors = useColors();
  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="Slow to reply badge"
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.slowReply,
          borderColor: colors.background,
        },
      ]}
    >
      <GhostIcon size={size * 0.55} color="#fff" strokeWidth={2.4} />
    </View>
  );
}

const styles = StyleSheet.create({
  dot: {
    position: "absolute",
    right: -3,
    bottom: -3,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
});
