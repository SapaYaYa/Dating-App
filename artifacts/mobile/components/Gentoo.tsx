import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";

import { useColors } from "@/hooks/useColors";

// Gentoo's brand art: the pebble (likes are pebbles), Gus the gentoo penguin,
// and the pair shown when two people match. Sketch-quality placeholders until
// an illustrator delivers the final art (docs/ILLUSTRATOR_BRIEF.md).

const HEART =
  "M100 128 C 78 114, 70 103, 72 92 C 74 82, 83 78, 90 79 C 95 80, 98 83, 100 87 C 102 83, 105 80, 110 79 C 117 78, 126 82, 128 92 C 130 103, 122 114, 100 128 Z";
const BEAK = "#E8572A";
const FEATHER_DARK = "#17181A";
const FEATHER_LIGHT = "#FBF8F3";

/** A smooth pebble with a heart: the app icon, and the "like" button. */
export function Pebble({
  size = 24,
  fill,
  heart,
  shadow = true,
}: {
  size?: number;
  fill: string;
  heart: string;
  shadow?: boolean;
}) {
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      {shadow && (
        <Ellipse cx="100" cy="108" rx="74" ry="58" fill="rgba(0,0,0,0.22)" transform="rotate(-8 100 108)" />
      )}
      <Ellipse cx="100" cy="100" rx="74" ry="58" fill={fill} transform="rotate(-8 100 100)" />
      <Path d={HEART} fill={heart} />
    </Svg>
  );
}

/** Outline pebble for the tab bar, drawn in the tab's color. */
export function PebbleOutline({ size = 24, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Ellipse
        cx="12"
        cy="12.5"
        rx="9"
        ry="7"
        fill="none"
        stroke={color}
        strokeWidth={2}
        transform="rotate(-8 12 12)"
      />
      <Path
        d="M12 15.5c-2.6-1.7-3.5-3-3.2-4.2.3-1 1.6-1.4 2.4-.6l.8.8.8-.8c.8-.8 2.1-.4 2.4.6.3 1.2-.6 2.5-3.2 4.2z"
        fill={color}
      />
    </Svg>
  );
}

/** The brand mark next to "gentoo" in headers. */
export function PebbleLogo({ size = 26 }: { size?: number }) {
  const colors = useColors();
  return <Pebble size={size} fill={colors.brand} heart={colors.background} shadow={false} />;
}

/** A soft glow behind penguin art, so the black penguin shows in dark mode. */
function Glow({ size, children }: { size: number; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View
      style={[
        styles.glow,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.penguinGlow },
      ]}
    >
      {children}
    </View>
  );
}

/** Gus, the gentoo mascot, facing you. Holds a pebble unless told not to. */
export function Gus({ size = 160, holdingPebble = true }: { size?: number; holdingPebble?: boolean }) {
  return (
    <Glow size={size * 1.15}>
      <Svg width={size} height={size * 0.85} viewBox="0 0 270 230" accessibilityLabel="Gus the penguin">
        <Ellipse cx="120" cy="214" rx="18" ry="7" fill={BEAK} />
        <Ellipse cx="150" cy="214" rx="18" ry="7" fill={BEAK} />
        <Path d="M76 120 C 52 140, 50 172, 60 190" fill="none" stroke={FEATHER_DARK} strokeWidth={16} strokeLinecap="round" />
        <Path d="M194 120 C 218 140, 220 172, 210 190" fill="none" stroke={FEATHER_DARK} strokeWidth={16} strokeLinecap="round" />
        <Ellipse cx="135" cy="148" rx="62" ry="70" fill={FEATHER_DARK} />
        <Ellipse cx="135" cy="162" rx="44" ry="54" fill={FEATHER_LIGHT} />
        <Circle cx="135" cy="70" r="46" fill={FEATHER_DARK} />
        <Path
          d="M104 56 C 110 44, 124 44, 130 50 C 132 52, 138 52, 140 50 C 146 44, 160 44, 166 56 C 158 54, 150 56, 146 62 C 140 58, 130 58, 124 62 C 120 56, 112 54, 104 56 Z"
          fill={FEATHER_LIGHT}
        />
        <Circle cx="117" cy="68" r="5.5" fill={FEATHER_LIGHT} />
        <Circle cx="117" cy="68" r="3" fill={FEATHER_DARK} />
        <Circle cx="153" cy="68" r="5.5" fill={FEATHER_LIGHT} />
        <Circle cx="153" cy="68" r="3" fill={FEATHER_DARK} />
        <Path d="M126 80 C 130 76, 140 76, 144 80 L 135 96 Z" fill={BEAK} />
        {holdingPebble && (
          <G>
            <Ellipse cx="135" cy="168" rx="26" ry="19" fill="#B8B2AA" />
            <Path
              d="M135 180 C 124 173, 120 167, 121 162 C 122 157, 127 155, 130 156 C 132 156, 134 158, 135 160 C 136 158, 138 156, 140 156 C 143 155, 148 157, 149 162 C 150 167, 146 173, 135 180 Z"
              fill={BEAK}
            />
          </G>
        )}
      </Svg>
    </Glow>
  );
}

function SidePenguin() {
  return (
    <G>
      <Ellipse cx="80" cy="120" rx="44" ry="62" fill={FEATHER_DARK} transform="rotate(10 80 120)" />
      <Ellipse cx="90" cy="136" rx="26" ry="42" fill={FEATHER_LIGHT} transform="rotate(10 90 136)" />
      <Path d="M84 70 C 92 62, 104 64, 108 72 C 100 70, 92 72, 88 78 Z" fill={FEATHER_LIGHT} />
      <Circle cx="101" cy="80" r="3" fill={FEATHER_DARK} />
      <Path d="M110 90 L128 96 L109 101 Z" fill={BEAK} />
      <Ellipse cx="64" cy="182" rx="12" ry="5" fill={BEAK} />
      <Ellipse cx="96" cy="183" rx="12" ry="5" fill={BEAK} />
    </G>
  );
}

/** Two gentoos leaning in under a heart: the "It's a pair!" moment. */
export function GentooPair({ size = 180 }: { size?: number }) {
  return (
    <Glow size={size * 1.1}>
      <Svg width={size} height={size * 0.87} viewBox="0 0 230 200" accessibilityLabel="Two penguins leaning in">
        <SidePenguin />
        <G transform="translate(230 0) scale(-1 1)">
          <SidePenguin />
        </G>
        <Path
          d="M115 52 c-6-11-22-6-19 5 c2 7 10 12 19 18 c9-6 17-11 19-18 c3-11-13-16-19-5z"
          fill={BEAK}
        />
      </Svg>
    </Glow>
  );
}

const styles = StyleSheet.create({
  glow: { alignItems: "center", justifyContent: "center" },
});
