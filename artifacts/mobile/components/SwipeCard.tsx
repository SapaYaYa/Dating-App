import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  Image,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";
import { formatDistance } from "@/utils/distance";
import type { Profile } from "@/constants/mockData";
import { GreatChatPill, hasGreatChatBadge } from "@/components/GreatChatBadge";

const { width: W, height: H } = Dimensions.get("window");
const SWIPE_THRESHOLD = W * 0.28;
const CARD_WIDTH = W - 32;
const CARD_HEIGHT = H * 0.62;

interface Props {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTop: boolean;
  index: number;
  /** Space available for the card; it shrinks below its usual height to fit. */
  maxHeight?: number;
}

export function SwipeCard({ profile, onSwipeLeft, onSwipeRight, isTop, index, maxHeight }: Props) {
  const colors = useColors();
  const pan = useRef(new Animated.ValueXY()).current;

  const rotate = pan.x.interpolate({
    inputRange: [-W / 2, 0, W / 2],
    outputRange: ["-12deg", "0deg", "12deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = pan.x.interpolate({
    inputRange: [0, W / 5],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = pan.x.interpolate({
    inputRange: [-W / 5, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: (_, g) => {
        if (g.dx > SWIPE_THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: W + 100, y: g.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(onSwipeRight);
        } else if (g.dx < -SWIPE_THRESHOLD) {
          Animated.timing(pan, {
            toValue: { x: -W - 100, y: g.dy },
            duration: 220,
            useNativeDriver: false,
          }).start(onSwipeLeft);
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            friction: 5,
          }).start();
        }
      },
    })
  ).current;

  const scale = isTop ? 1 : 0.97 - index * 0.02;
  const translateY = isTop ? 0 : index * 8;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          height: Math.min(CARD_HEIGHT, maxHeight ?? CARD_HEIGHT),
          transform: isTop
            ? [{ translateX: pan.x }, { translateY: pan.y }, { rotate }]
            : [{ scale }, { translateY }],
          zIndex: 10 - index,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <Image source={{ uri: profile.images[0] }} style={styles.image} />

      <Animated.View style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}>
        <Text style={styles.likeText}>LIKE</Text>
      </Animated.View>

      <Animated.View style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
        <Text style={styles.nopeText}>NOPE</Text>
      </Animated.View>

      {(profile.verified || hasGreatChatBadge(profile.badges)) && (
        <View style={styles.topBadges}>
          {hasGreatChatBadge(profile.badges) && <GreatChatPill />}
          {profile.verified && (
            <View style={styles.verifiedBadge}>
              <Feather name="check-circle" size={14} color="#fff" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
      )}

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.92)"]}
        style={styles.gradient}
      >
        <View style={styles.spotifyRow}>
          <Feather name="music" size={11} color={colors.spotify} />
          <Text style={styles.spotifyText} numberOfLines={1}>
            {profile.spotify.song} — {profile.spotify.artist}
          </Text>
        </View>

        <Text style={styles.name}>
          {profile.name}, {profile.age}
        </Text>
        <View style={styles.infoRow}>
          <Feather name="briefcase" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.infoText}>{profile.occupation}</Text>
          <View style={styles.dot} />
          <Feather name="map-pin" size={12} color="rgba(255,255,255,0.75)" />
          <Text style={styles.infoText}>{formatDistance(profile.distance)}</Text>
        </View>

        <View style={styles.tags}>
          {profile.interests.slice(0, 3).map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        {profile.profileQuestions[0] && (
          <View style={styles.questionBlock}>
            <Text style={styles.questionLabel}>{profile.profileQuestions[0].question}</Text>
            <Text style={styles.questionAnswer} numberOfLines={2}>
              {profile.profileQuestions[0].answer}
            </Text>
          </View>
        )}
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 60,
  },
  overlay: {
    position: "absolute",
    top: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 3,
  },
  likeOverlay: {
    left: 20,
    borderColor: "#34C759",
    backgroundColor: "rgba(52,199,89,0.1)",
    transform: [{ rotate: "-10deg" }],
  },
  nopeOverlay: {
    right: 20,
    borderColor: "#FF4057",
    backgroundColor: "rgba(255,64,87,0.1)",
    transform: [{ rotate: "10deg" }],
  },
  likeText: {
    color: "#34C759",
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 2,
  },
  nopeText: {
    color: "#FF4057",
    fontWeight: "800",
    fontSize: 22,
    letterSpacing: 2,
  },
  topBadges: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    gap: 6,
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  verifiedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  spotifyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  spotifyText: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    flex: 1,
  },
  name: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  infoText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 2,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  questionBlock: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(255,255,255,0.4)",
    paddingLeft: 10,
  },
  questionLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    marginBottom: 2,
  },
  questionAnswer: {
    color: "#fff",
    fontSize: 13,
    lineHeight: 18,
  },
});
