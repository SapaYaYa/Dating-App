import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { BOARD_RULES, findSimilarBoards } from "@/constants/boards";
import {
  MOCK_BOARD_POSTS,
  MOCK_BOARDS,
  MOCK_JOINED_BOARD_IDS,
  type Board,
  type BoardComment,
  type BoardPost,
  type Profile,
} from "@/constants/mockData";

const STORAGE_KEY = "spark_community";

// Everything the user did in Community, saved on this phone. Runs on sample
// boards and posts until boards live on the server.
interface StoredState {
  joined: string[];
  created: Board[];
  deleted: string[];
  descriptions: Record<string, string>;
  posts: BoardPost[];
  comments: Record<string, BoardComment[]>;
  hiddenPosts: string[];
  reportedBoards: string[];
  showBoardsOnDiscover: boolean;
}

const INITIAL_STATE: StoredState = {
  joined: MOCK_JOINED_BOARD_IDS,
  created: [],
  deleted: [],
  descriptions: {},
  posts: [],
  comments: {},
  hiddenPosts: [],
  reportedBoards: [],
  showBoardsOnDiscover: true,
};

export interface NewBoard {
  title: string;
  description: string;
  category: string;
  emoji: string;
}

export type CreateBoardResult =
  | { ok: true; boardId: string }
  | { ok: false; error: string; existingBoardId?: string };

interface CommunityContextType {
  /** True once saved Community state has been read from the phone. */
  loaded: boolean;
  boards: Board[];
  isJoined: (boardId: string) => boolean;
  isOwner: (board: Board) => boolean;
  canDelete: (board: Board) => boolean;
  createdCount: number;
  join: (boardId: string) => void;
  leave: (boardId: string) => void;
  createBoard: (input: NewBoard, creatorName: string) => CreateBoardResult;
  updateDescription: (boardId: string, description: string) => void;
  deleteBoard: (boardId: string) => void;
  reportBoard: (boardId: string) => void;
  postsFor: (boardId: string) => BoardPost[];
  addPost: (boardId: string, text: string) => void;
  addComment: (postId: string, text: string) => void;
  deletePost: (postId: string) => void;
  reportPost: (postId: string) => void;
  showBoardsOnDiscover: boolean;
  setShowBoardsOnDiscover: (value: boolean) => void;
  /** Boards both the user and this profile are in, for Discover. Empty if either opted out. */
  sharedBoardsWith: (profile: Profile) => Board[];
}

const CommunityContext = createContext<CommunityContextType | null>(null);

function timeNow() {
  return "Just now";
}

export function CommunityProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setState({ ...INITIAL_STATE, ...parsed });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const update = useCallback(
    (change: (current: StoredState) => StoredState) => {
      setState((current) => {
        const next = change(current);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
    },
    [],
  );

  const boards = useMemo(() => {
    const all = [...state.created, ...MOCK_BOARDS];
    return all
      .filter((b) => !state.deleted.includes(b.id) && !state.reportedBoards.includes(b.id))
      .map((b) => {
        const wasMember = b.creatorId === "me" || MOCK_JOINED_BOARD_IDS.includes(b.id);
        const isMember = state.joined.includes(b.id);
        const ownPosts = state.posts.filter((p) => p.boardId === b.id).length;
        return {
          ...b,
          description: state.descriptions[b.id] ?? b.description,
          members: b.members + (isMember ? 1 : 0) - (wasMember ? 1 : 0),
          posts: b.posts + ownPosts,
        };
      });
  }, [state]);

  const isJoined = useCallback((boardId: string) => state.joined.includes(boardId), [state.joined]);
  const isOwner = useCallback((board: Board) => board.creatorId === "me", []);
  const canDelete = useCallback(
    (board: Board) => board.creatorId === "me" && board.members < BOARD_RULES.OWNER_DELETE_MAX_MEMBERS,
    [],
  );
  const createdCount = state.created.filter((b) => !state.deleted.includes(b.id)).length;

  const join = useCallback(
    (boardId: string) =>
      update((s) => (s.joined.includes(boardId) ? s : { ...s, joined: [...s.joined, boardId] })),
    [update],
  );
  const leave = useCallback(
    (boardId: string) => update((s) => ({ ...s, joined: s.joined.filter((id) => id !== boardId) })),
    [update],
  );

  const createBoard = useCallback(
    (input: NewBoard, creatorName: string): CreateBoardResult => {
      const title = input.title.trim();
      const description = input.description.trim();
      if (!title || title.length > BOARD_RULES.NAME_MAX) {
        return { ok: false, error: `Give your board a name up to ${BOARD_RULES.NAME_MAX} characters.` };
      }
      if (!description || description.length > BOARD_RULES.DESCRIPTION_MAX) {
        return { ok: false, error: `Add a description up to ${BOARD_RULES.DESCRIPTION_MAX} characters.` };
      }
      if (!input.category || !input.emoji) {
        return { ok: false, error: "Pick a category and an icon." };
      }
      if (createdCount >= BOARD_RULES.MAX_CREATED_PER_USER) {
        return {
          ok: false,
          error: `You can have up to ${BOARD_RULES.MAX_CREATED_PER_USER} boards. Delete one to create another.`,
        };
      }
      const { exact } = findSimilarBoards(title, boards);
      if (exact) {
        return { ok: false, error: `"${exact.title}" already exists.`, existingBoardId: exact.id };
      }

      const board: Board = {
        id: `mine-${Date.now()}`,
        title,
        description,
        category: input.category,
        emoji: input.emoji,
        members: 1,
        posts: 0,
        trending: false,
        creatorId: "me",
        creatorName,
      };
      update((s) => ({ ...s, created: [board, ...s.created], joined: [...s.joined, board.id] }));
      return { ok: true, boardId: board.id };
    },
    [boards, createdCount, update],
  );

  const updateDescription = useCallback(
    (boardId: string, description: string) =>
      update((s) => ({ ...s, descriptions: { ...s.descriptions, [boardId]: description.trim() } })),
    [update],
  );
  const deleteBoard = useCallback(
    (boardId: string) =>
      update((s) => ({
        ...s,
        deleted: [...s.deleted, boardId],
        joined: s.joined.filter((id) => id !== boardId),
      })),
    [update],
  );
  const reportBoard = useCallback(
    (boardId: string) =>
      update((s) => ({
        ...s,
        reportedBoards: [...s.reportedBoards, boardId],
        joined: s.joined.filter((id) => id !== boardId),
      })),
    [update],
  );

  const postsFor = useCallback(
    (boardId: string) =>
      [...state.posts, ...MOCK_BOARD_POSTS]
        .filter((p) => p.boardId === boardId && !state.hiddenPosts.includes(p.id))
        .map((p) => ({ ...p, comments: [...p.comments, ...(state.comments[p.id] ?? [])] })),
    [state.posts, state.hiddenPosts, state.comments],
  );

  const addPost = useCallback(
    (boardId: string, text: string) =>
      update((s) => ({
        ...s,
        posts: [
          { id: `post-${Date.now()}`, boardId, authorId: "me", text: text.trim(), time: timeNow(), comments: [] },
          ...s.posts,
        ],
      })),
    [update],
  );
  const addComment = useCallback(
    (postId: string, text: string) =>
      update((s) => ({
        ...s,
        comments: {
          ...s.comments,
          [postId]: [
            ...(s.comments[postId] ?? []),
            { id: `comment-${Date.now()}`, authorId: "me", text: text.trim(), time: timeNow() },
          ],
        },
      })),
    [update],
  );
  const deletePost = useCallback(
    (postId: string) => update((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) })),
    [update],
  );
  const reportPost = useCallback(
    (postId: string) => update((s) => ({ ...s, hiddenPosts: [...s.hiddenPosts, postId] })),
    [update],
  );

  const setShowBoardsOnDiscover = useCallback(
    (value: boolean) => update((s) => ({ ...s, showBoardsOnDiscover: value })),
    [update],
  );

  const sharedBoardsWith = useCallback(
    (profile: Profile) => {
      if (!loaded || !state.showBoardsOnDiscover || profile.showsBoardsOnDiscover === false) return [];
      return boards.filter((b) => state.joined.includes(b.id) && b.memberIds?.includes(profile.id));
    },
    [loaded, state.showBoardsOnDiscover, state.joined, boards],
  );

  return (
    <CommunityContext.Provider
      value={{
        loaded,
        boards,
        isJoined,
        isOwner,
        canDelete,
        createdCount,
        join,
        leave,
        createBoard,
        updateDescription,
        deleteBoard,
        reportBoard,
        postsFor,
        addPost,
        addComment,
        deletePost,
        reportPost,
        showBoardsOnDiscover: state.showBoardsOnDiscover,
        setShowBoardsOnDiscover,
        sharedBoardsWith,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const ctx = useContext(CommunityContext);
  if (!ctx) throw new Error("useCommunity must be used within CommunityProvider");
  return ctx;
}
