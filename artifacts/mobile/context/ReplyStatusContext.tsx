import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { MOCK_MESSAGED_MATCHES, MOCK_WAITING_ON_YOU } from "@/constants/mockData";
import { qualifiesForGreatChat, type GreatChatStats } from "@/constants/greatChat";
import { getReplyStatus, repliesToClearBadge, type ReplyStatus } from "@/constants/replyBadge";

const CLEARED_KEY = "spark_reply_cleared";
const SHEET_SEEN_KEY = "spark_reply_sheet_seen";
const GREAT_CHAT_SEEN_KEY = "spark_great_chat_seen";

// Sample Great Chat numbers for the signed-in user. Their reply rate and
// Slow to reply status come from the live sample reply status below.
const MOCK_GREAT_CHAT = {
  longConversations: 4,
  typicalShare: 0.52,
  raters: 5,
  greatRatings: 4,
  hasRecentReport: false,
};

const STATUS_LEVEL: Record<ReplyStatus, number> = { clear: 0, warning: 1, badge: 2 };

interface ReplyStatusContextType {
  waiting: typeof MOCK_WAITING_ON_YOU;
  messagedMatches: number;
  unanswered: number;
  status: ReplyStatus;
  repliesToClear: number;
  /** The warning or badge message to show, once per step up. */
  sheetToShow: ReplyStatus | null;
  markSheetSeen: () => void;
  /** Reply to or unmatch a waiting match; either way it stops counting. */
  clearMatch: (profileId: string) => void;
  greatChat: GreatChatStats & { earned: boolean };
  /** True once, when the user first earns Great Chat (or earns it again). */
  showGreatChatSheet: boolean;
  markGreatChatSeen: () => void;
}

const ReplyStatusContext = createContext<ReplyStatusContextType | null>(null);

// Runs on sample data until matches and messages live on the server, which
// will then compute these numbers with the same rule.
export function ReplyStatusProvider({ children }: { children: React.ReactNode }) {
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [seenStatus, setSeenStatus] = useState<ReplyStatus>("clear");
  const [greatChatSeen, setGreatChatSeen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CLEARED_KEY),
      AsyncStorage.getItem(SHEET_SEEN_KEY),
      AsyncStorage.getItem(GREAT_CHAT_SEEN_KEY),
    ])
      .then(([rawCleared, rawSeen, rawGreatChatSeen]) => {
        setGreatChatSeen(rawGreatChatSeen === "true");
        const parsed: unknown = rawCleared ? JSON.parse(rawCleared) : [];
        if (Array.isArray(parsed)) {
          setClearedIds(parsed.filter((id): id is string => typeof id === "string"));
        }
        if (rawSeen === "warning" || rawSeen === "badge") setSeenStatus(rawSeen);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const waiting = useMemo(
    () => MOCK_WAITING_ON_YOU.filter((w) => !clearedIds.includes(w.profile.id)),
    [clearedIds],
  );
  const stats = { messagedMatches: MOCK_MESSAGED_MATCHES, unanswered: waiting.length };
  const status = getReplyStatus(stats);

  // Once the status drops, lower the seen level too, so a later step back up
  // shows its message again.
  useEffect(() => {
    if (!loaded || STATUS_LEVEL[status] >= STATUS_LEVEL[seenStatus]) return;
    setSeenStatus(status);
    AsyncStorage.setItem(SHEET_SEEN_KEY, status).catch(() => {});
  }, [loaded, status, seenStatus]);

  const markSheetSeen = useCallback(() => {
    setSeenStatus(status);
    AsyncStorage.setItem(SHEET_SEEN_KEY, status).catch(() => {});
  }, [status]);

  const clearMatch = useCallback((profileId: string) => {
    setClearedIds((current) => {
      if (current.includes(profileId)) return current;
      const next = [...current, profileId];
      AsyncStorage.setItem(CLEARED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const sheetToShow =
    loaded && STATUS_LEVEL[status] > STATUS_LEVEL[seenStatus] ? status : null;

  const greatChatStats: GreatChatStats = {
    ...MOCK_GREAT_CHAT,
    // Matches in the waiting list waited 3+ days, so replying to them now is
    // late: it clears Slow to reply but doesn't count as a timely reply.
    timelyReplyRate:
      stats.messagedMatches > 0
        ? 1 - MOCK_WAITING_ON_YOU.length / stats.messagedMatches
        : 1,
    hasSlowToReply: status === "badge",
  };
  const greatChatEarned = qualifiesForGreatChat(greatChatStats);

  // Losing the badge is quiet; it just resets so earning it again is announced.
  useEffect(() => {
    if (!loaded || greatChatEarned || !greatChatSeen) return;
    setGreatChatSeen(false);
    AsyncStorage.setItem(GREAT_CHAT_SEEN_KEY, "false").catch(() => {});
  }, [loaded, greatChatEarned, greatChatSeen]);

  const markGreatChatSeen = useCallback(() => {
    setGreatChatSeen(true);
    AsyncStorage.setItem(GREAT_CHAT_SEEN_KEY, "true").catch(() => {});
  }, []);

  return (
    <ReplyStatusContext.Provider
      value={{
        waiting,
        messagedMatches: stats.messagedMatches,
        unanswered: stats.unanswered,
        status,
        repliesToClear: repliesToClearBadge(stats),
        sheetToShow,
        markSheetSeen,
        clearMatch,
        greatChat: { ...greatChatStats, earned: greatChatEarned },
        showGreatChatSheet: loaded && greatChatEarned && !greatChatSeen && !sheetToShow,
        markGreatChatSeen,
      }}
    >
      {children}
    </ReplyStatusContext.Provider>
  );
}

export function useReplyStatus() {
  const ctx = useContext(ReplyStatusContext);
  if (!ctx) throw new Error("useReplyStatus must be used within ReplyStatusProvider");
  return ctx;
}
