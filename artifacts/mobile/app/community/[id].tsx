import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { OptionsSheet, type SheetOption } from "@/components/OptionsSheet";
import { BOARD_RULES } from "@/constants/boards";
import { MOCK_PROFILES, type BoardPost } from "@/constants/mockData";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";
import { getHiddenProfileIds } from "@/utils/hiddenProfiles";

interface Author {
  name: string;
  image?: string;
}

type Sheet =
  | { kind: "board" }
  | { kind: "confirmDelete" }
  | { kind: "post"; post: BoardPost }
  | null;

export default function BoardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const community = useCommunity();
  const board = community.boards.find((b) => b.id === id);

  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<string[]>([]);
  const [editing, setEditing] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [notice, setNotice] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);

  // People the user blocked or unmatched are hidden here too.
  useFocusEffect(
    useCallback(() => {
      getHiddenProfileIds().then(setHiddenIds);
    }, []),
  );

  // Boards show a first name and a small photo only: no profile, like or message.
  const authorFor = (authorId: string): Author | null => {
    if (authorId === "me") return { name: user?.name.split(" ")[0] || "You", image: user?.images[0] };
    const profile = MOCK_PROFILES.find((p) => p.id === authorId);
    return profile ? { name: profile.name, image: profile.images[0] } : null;
  };

  if (!board) {
    return (
      <View style={[styles.root, styles.missing, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingText, { color: colors.mutedForeground }]}>
          This board is no longer available.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[styles.link, { color: colors.foreground }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const joined = community.isJoined(board.id);
  const owner = community.isOwner(board);
  const posts = community
    .postsFor(board.id)
    .filter((p) => !hiddenIds.includes(p.authorId))
    .map((p) => ({ ...p, comments: p.comments.filter((c) => !hiddenIds.includes(c.authorId)) }));

  const submitPost = () => {
    if (!draft.trim()) return;
    community.addPost(board.id, draft);
    setDraft("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const submitComment = (postId: string) => {
    const text = commentDrafts[postId]?.trim();
    if (!text) return;
    community.addComment(postId, text);
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
  };

  const toggleComments = (postId: string) =>
    setOpenComments((open) => (open.includes(postId) ? open.filter((x) => x !== postId) : [...open, postId]));

  const boardOptions: SheetOption[] = owner
    ? [
        {
          label: "Edit description",
          icon: "edit-2",
          onPress: () => {
            setDescriptionDraft(board.description);
            setEditing(true);
          },
        },
        ...(community.canDelete(board)
          ? [{ label: "Delete board", icon: "trash-2" as const, destructive: true, onPress: () => setSheet({ kind: "confirmDelete" }) }]
          : []),
      ]
    : [
        {
          label: "Report board",
          icon: "flag",
          destructive: true,
          onPress: () => {
            community.reportBoard(board.id);
            router.back();
          },
        },
      ];

  const postOptions = (post: BoardPost): SheetOption[] =>
    post.authorId === "me"
      ? [{ label: "Delete post", icon: "trash-2", destructive: true, onPress: () => community.deletePost(post.id) }]
      : [
          {
            label: "Report post",
            icon: "flag",
            destructive: true,
            onPress: () => {
              community.reportPost(post.id);
              setNotice("Thanks. We'll review that post, and it's hidden for you.");
            },
          },
        ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {board.title}
        </Text>
        <TouchableOpacity
          onPress={() => setSheet({ kind: "board" })}
          style={[styles.iconBtn, styles.moreBtn, { backgroundColor: colors.secondary }]}
          accessibilityLabel="Board options"
        >
          <Feather name="more-horizontal" size={18} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.infoTop}>
              <Text style={styles.bigEmoji}>{board.emoji}</Text>
              <View style={styles.infoText}>
                <Text style={[styles.boardTitle, { color: colors.foreground }]}>{board.title}</Text>
                <Text style={[styles.meta, { color: colors.mutedForeground }]}>
                  {board.category} · {board.members.toLocaleString()} {board.members === 1 ? "member" : "members"}
                  {board.creatorName ? ` · Created by ${owner ? "you" : board.creatorName}` : ""}
                </Text>
              </View>
            </View>

            {editing ? (
              <View style={styles.editWrap}>
                <TextInput
                  style={[styles.input, styles.multiline, { backgroundColor: colors.input, color: colors.foreground }]}
                  value={descriptionDraft}
                  onChangeText={setDescriptionDraft}
                  maxLength={BOARD_RULES.DESCRIPTION_MAX}
                  multiline
                  autoFocus
                />
                <View style={styles.editActions}>
                  <TouchableOpacity onPress={() => setEditing(false)} style={styles.textBtn}>
                    <Text style={[styles.textBtnLabel, { color: colors.mutedForeground }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    disabled={!descriptionDraft.trim()}
                    onPress={() => {
                      community.updateDescription(board.id, descriptionDraft);
                      setEditing(false);
                    }}
                    style={[styles.smallBtn, { backgroundColor: colors.primary, opacity: descriptionDraft.trim() ? 1 : 0.4 }]}
                  >
                    <Text style={[styles.smallBtnText, { color: colors.primaryForeground }]}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Text style={[styles.description, { color: colors.foreground }]}>{board.description}</Text>
            )}

            {owner ? (
              <View style={[styles.joinBtn, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.joinText, { color: colors.foreground }]}>Your board</Text>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => (joined ? community.leave(board.id) : community.join(board.id))}
                style={[styles.joinBtn, { backgroundColor: joined ? colors.secondary : colors.primary }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.joinText, { color: joined ? colors.foreground : colors.primaryForeground }]}>
                  {joined ? "Joined · Leave" : "Join board"}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {notice ? (
            <View style={[styles.notice, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.noticeText, { color: colors.foreground }]}>{notice}</Text>
            </View>
          ) : null}

          {joined ? (
            <View style={[styles.composer, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.composerInput, { color: colors.foreground }]}
                placeholder={`Post something to ${board.title}...`}
                placeholderTextColor={colors.mutedForeground}
                value={draft}
                onChangeText={setDraft}
                maxLength={BOARD_RULES.POST_MAX}
                multiline
              />
              <TouchableOpacity
                onPress={submitPost}
                disabled={!draft.trim()}
                style={[styles.smallBtn, { backgroundColor: colors.primary, opacity: draft.trim() ? 1 : 0.4 }]}
              >
                <Text style={[styles.smallBtnText, { color: colors.primaryForeground }]}>Post</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.joinHint, { color: colors.mutedForeground }]}>
              Join this board to post and comment.
            </Text>
          )}

          {posts.length === 0 && (
            <Text style={[styles.joinHint, { color: colors.mutedForeground }]}>
              No posts yet. {joined ? "Start the conversation!" : ""}
            </Text>
          )}

          {posts.map((post) => {
            const author = authorFor(post.authorId);
            if (!author) return null;
            const showComments = openComments.includes(post.id);
            return (
              <View key={post.id} style={[styles.post, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.postHeader}>
                  <AuthorAvatar author={author} />
                  <View style={styles.postMeta}>
                    <Text style={[styles.authorName, { color: colors.foreground }]}>{author.name}</Text>
                    <Text style={[styles.time, { color: colors.mutedForeground }]}>{post.time}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSheet({ kind: "post", post })}
                    style={styles.iconBtn}
                    accessibilityLabel="Post options"
                  >
                    <Feather name="more-horizontal" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.postText, { color: colors.foreground }]}>{post.text}</Text>
                <TouchableOpacity onPress={() => toggleComments(post.id)} style={styles.commentToggle}>
                  <Feather name="message-circle" size={14} color={colors.mutedForeground} />
                  <Text style={[styles.commentToggleText, { color: colors.mutedForeground }]}>
                    {post.comments.length === 0
                      ? joined
                        ? "Comment"
                        : "No comments"
                      : `${post.comments.length} ${post.comments.length === 1 ? "comment" : "comments"}`}
                  </Text>
                </TouchableOpacity>

                {showComments && (
                  <View style={[styles.comments, { borderTopColor: colors.border }]}>
                    {post.comments.map((c) => {
                      const commenter = authorFor(c.authorId);
                      if (!commenter) return null;
                      return (
                        <View key={c.id} style={styles.comment}>
                          <AuthorAvatar author={commenter} size={26} />
                          <View style={[styles.commentBubble, { backgroundColor: colors.secondary }]}>
                            <Text style={[styles.commentAuthor, { color: colors.foreground }]}>
                              {commenter.name} <Text style={[styles.time, { color: colors.mutedForeground }]}>· {c.time}</Text>
                            </Text>
                            <Text style={[styles.commentText, { color: colors.foreground }]}>{c.text}</Text>
                          </View>
                        </View>
                      );
                    })}
                    {joined && (
                      <View style={styles.commentComposer}>
                        <TextInput
                          style={[styles.input, styles.commentInput, { backgroundColor: colors.input, color: colors.foreground }]}
                          placeholder="Write a comment..."
                          placeholderTextColor={colors.mutedForeground}
                          value={commentDrafts[post.id] ?? ""}
                          onChangeText={(t) => setCommentDrafts((d) => ({ ...d, [post.id]: t }))}
                          maxLength={BOARD_RULES.COMMENT_MAX}
                        />
                        <TouchableOpacity
                          onPress={() => submitComment(post.id)}
                          style={[styles.sendBtn, { backgroundColor: colors.primary }]}
                          accessibilityLabel="Send comment"
                        >
                          <Feather name="send" size={15} color={colors.primaryForeground} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </KeyboardAvoidingView>

      <OptionsSheet
        visible={sheet?.kind === "board"}
        options={boardOptions}
        message={
          owner && !community.canDelete(board)
            ? `Boards with ${BOARD_RULES.OWNER_DELETE_MAX_MEMBERS} or more members can't be deleted.`
            : undefined
        }
        onClose={() => setSheet(null)}
      />
      <OptionsSheet
        visible={sheet?.kind === "confirmDelete"}
        title={`Delete ${board.title}?`}
        message="The board and its posts will be removed for everyone. This can't be undone."
        options={[
          {
            label: "Delete board",
            icon: "trash-2",
            destructive: true,
            onPress: () => {
              community.deleteBoard(board.id);
              router.back();
            },
          },
        ]}
        onClose={() => setSheet(null)}
      />
      <OptionsSheet
        visible={sheet?.kind === "post"}
        options={sheet?.kind === "post" ? postOptions(sheet.post) : []}
        onClose={() => setSheet(null)}
      />
    </View>
  );
}

function AuthorAvatar({ author, size = 34 }: { author: Author; size?: number }) {
  const colors = useColors();
  const style = { width: size, height: size, borderRadius: size / 2 };
  return author.image ? (
    <Image source={{ uri: author.image }} style={style} />
  ) : (
    <View style={[style, styles.avatarFallback, { backgroundColor: colors.secondary }]}>
      <Text style={[styles.avatarInitial, { color: colors.foreground }]}>{author.name.charAt(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  missing: { alignItems: "center", justifyContent: "center", gap: 10, padding: 24 },
  missingText: { fontSize: 15, textAlign: "center" },
  link: { fontSize: 15, fontWeight: "700", textDecorationLine: "underline" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  moreBtn: { width: 38, height: 38, borderRadius: 10, marginRight: 6 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: "700" },
  scroll: { padding: 16, gap: 12 },
  infoCard: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  infoTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  bigEmoji: { fontSize: 40 },
  infoText: { flex: 1, gap: 3 },
  boardTitle: { fontSize: 20, fontWeight: "800" },
  meta: { fontSize: 13 },
  description: { fontSize: 15, lineHeight: 22 },
  editWrap: { gap: 8 },
  editActions: { flexDirection: "row", justifyContent: "flex-end", alignItems: "center", gap: 8 },
  textBtn: { height: 40, paddingHorizontal: 12, justifyContent: "center" },
  textBtnLabel: { fontSize: 14, fontWeight: "600" },
  input: { borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  multiline: { minHeight: 80, textAlignVertical: "top" },
  joinBtn: { height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  joinText: { fontSize: 15, fontWeight: "600" },
  notice: { borderRadius: 12, padding: 12 },
  noticeText: { fontSize: 14 },
  composer: { borderRadius: 16, borderWidth: 1, padding: 12, gap: 10, alignItems: "flex-end" },
  composerInput: { alignSelf: "stretch", minHeight: 44, fontSize: 15, textAlignVertical: "top" },
  smallBtn: { height: 38, paddingHorizontal: 16, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  smallBtnText: { fontSize: 14, fontWeight: "600" },
  joinHint: { fontSize: 14, textAlign: "center", paddingVertical: 8 },
  post: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  postHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  postMeta: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: "700" },
  time: { fontSize: 12, fontWeight: "400" },
  postText: { fontSize: 15, lineHeight: 22 },
  commentToggle: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", paddingVertical: 4 },
  commentToggleText: { fontSize: 13, fontWeight: "600" },
  comments: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 10, gap: 10 },
  comment: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  commentBubble: { flex: 1, borderRadius: 12, padding: 10, gap: 2 },
  commentAuthor: { fontSize: 13, fontWeight: "700" },
  commentText: { fontSize: 14, lineHeight: 20 },
  commentComposer: { flexDirection: "row", alignItems: "center", gap: 8 },
  commentInput: { flex: 1 },
  sendBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarFallback: { alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 14, fontWeight: "700" },
});
