import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { MOCK_MESSAGED_MATCHES, MOCK_WAITING_ON_YOU } from "@/constants/mockData";
import { getReplyStatus, repliesToClearBadge, type ReplyStatus } from "@/constants/replyBadge";

const CLEARED_KEY = "spark_reply_cleared";
const SHEET_SEEN_KEY = "spark_reply_sheet_seen";

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
}

const ReplyStatusContext = createContext<ReplyStatusContextType | null>(null);

// Runs on sample data until matches and messages live on the server, which
// will then compute these numbers with the same rule.
export function ReplyStatusProvider({ children }: { children: React.ReactNode }) {
  const [clearedIds, setClearedIds] = useState<string[]>([]);
  const [seenStatus, setSeenStatus] = useState<ReplyStatus>("clear");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(CLEARED_KEY), AsyncStorage.getItem(SHEET_SEEN_KEY)])
      .then(([rawCleared, rawSeen]) => {
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
