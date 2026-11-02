import { Feather } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { GreatChatPill, hasGreatChatBadge } from "@/components/GreatChatBadge";
import type { Profile } from "@/constants/mockData";
import type { LikeTarget } from "@/constants/prompts";
import { useColors } from "@/hooks/useColors";
import { formatProfileDistance } from "@/utils/discoverFilters";

type Block =
  | { kind: "photo"; index: number; uri: string }
  | { kind: "basics" }
  | { kind: "prompt"; index: number; question: string; answer: string };

/** Photo, basics, then prompts and photos alternating, like Hinge. */
export function profileBlocks(profile: Profile): Block[] {
  const blocks: Block[] = [];
  const photos = profile.images.map((uri, index) => ({ kind: "photo" as const, index, uri }));
  const prompts = profile.prompts.map((p, index) => ({ kind: "prompt" as const, index, ...p }));
  if (photos[0]) blocks.push(photos[0]);
  blocks.push({ kind: "basics" });
  let pi = 1;
  let qi = 0;
  while (pi < photos.length || qi < prompts.length) {
    if (qi < prompts.length) blocks.push(prompts[qi++]);
    if (pi < photos.length) blocks.push(photos[pi++]);
  }
  return blocks;
}

interface Props {
  profile: Profile;
  /** A Community board you're both in, shown as "Both in ...". */
  sharedBoard?: { title: string; emoji: string };
  /** Shows a heart on each photo and answer. Leave out for a read-only view. */
  onLike?: (target: LikeTarget) => void;
  /** Hide the distance row, e.g. for a like from another city. */
  hideDistance?: boolean;
}

/** A person's full profile, one block after another, for scrolling. */
export function ProfileScroll({ profile, sharedBoard, onLike, hideDistance }: Props) {
  const colors = useColors();

  const heart = (target: LikeTarget, label: string, onPhoto: boolean) =>
    onLike ? (
      <TouchableOpacity
        onPress={() => onLike(target)}
        style={[
          styles.heart,
          onPhoto ? styles.heartOnPhoto : styles.heartOnPrompt,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
        accessibilityRole="button"
        accessibilityLabel={label}
        activeOpacity={0.8}
      >
        <Feather name="heart" size={onPhoto ? 24 : 22} color={colors.accent} />
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.list}>
      {profileBlocks(profile).map((block) => {
        if (block.kind === "photo") {
          return (
            <View key={`photo-${block.index}`} style={styles.photoWrap}>
              <Image source={{ uri: block.uri }} style={styles.photo} />
              {block.index === 0 && (
                <View style={styles.nameOverlay}>
                  <Text style={styles.name}>
                    {profile.name}, {profile.age}
                  </Text>
                </View>
              )}
              {heart(block, `Like ${profile.name}'s photo ${block.index + 1}`, true)}
            </View>
          );
        }
        if (block.kind === "prompt") {
          return (
            <View key={`prompt-${block.index}`} style={[styles.prompt, { backgroundColor: colors.card }]}>
              <Text style={[styles.question, { color: colors.mutedForeground }]}>{block.question}</Text>
              <Text style={[styles.answer, { color: colors.foreground }]}>{block.answer}</Text>
              {heart(block, `Like ${profile.name}'s answer: ${block.question}`, false)}
            </View>
          );
        }
        return (
          <View key="basics" style={[styles.basics, { borderColor: colors.border }]}>
            {(hasGreatChatBadge(profile.badges) || profile.verified || sharedBoard) && (
              <View style={styles.tags}>
                {hasGreatChatBadge(profile.badges) && <GreatChatPill />}
                {profile.verified && (
                  <View style={[styles.tag, { backgroundColor: colors.superLike }]}>
                    <Feather name="check-circle" size={13} color="#fff" />
                    <Text style={styles.tagText}>Verified</Text>
                  </View>
                )}
                {sharedBoard && (
                  <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.tagEmoji}>{sharedBoard.emoji}</Text>
                    <Text style={[styles.tagText, { color: colors.foreground }]}>Both in {sharedBoard.title}</Text>
                  </View>
                )}
              </View>
            )}
            <Row icon="home" text={`Lives in ${profile.homeCity}`} />
            {!hideDistance && <Row icon="map-pin" text={formatProfileDistance(profile)} />}
            <Row icon="briefcase" text={profile.occupation} />
            <Row icon="music" text={`${profile.spotify.song} — ${profile.spotify.artist}`} />
            {profile.bio ? (
              <Text style={[styles.bio, { color: colors.foreground }]}>{profile.bio}</Text>
            ) : null}
            {profile.interests.length > 0 && (
              <View style={styles.tags}>
                {profile.interests.map((interest) => (
                  <View key={interest} style={[styles.interest, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.interestText, { color: colors.foreground }]}>{interest}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function Row({ icon, text }: { icon: React.ComponentProps<typeof Feather>["name"]; text: string }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <Feather name={icon} size={15} color={colors.mutedForeground} />
      <Text style={[styles.rowText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  photoWrap: { position: "relative" },
  photo: { width: "100%", height: 440, borderRadius: 18 },
  nameOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    paddingRight: 80,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  name: { color: "#fff", fontSize: 28, fontWeight: "800" },
  heart: {
    position: "absolute",
    right: 14,
    bottom: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  heartOnPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heartOnPrompt: { width: 48, height: 48, borderRadius: 24 },
  prompt: { borderRadius: 18, paddingHorizontal: 22, paddingTop: 22, paddingBottom: 72, gap: 8 },
  question: { fontSize: 14, fontWeight: "600" },
  answer: { fontSize: 23, lineHeight: 30, fontWeight: "700" },
  basics: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tag: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5 },
  tagEmoji: { fontSize: 13 },
  tagText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  rowText: { fontSize: 15, flexShrink: 1 },
  bio: { fontSize: 15, lineHeight: 22, marginTop: 4 },
  interest: { borderRadius: 14, paddingHorizontal: 12, paddingVertical: 6 },
  interestText: { fontSize: 13, fontWeight: "500" },
});
