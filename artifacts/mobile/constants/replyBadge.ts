// The "Slow to reply" badge rule. A match is unanswered when the other
// person's last message has waited UNANSWERED_AFTER_DAYS without a reply and
// the user hasn't unmatched, blocked or reported them. Only matches from the
// last WINDOW_DAYS count, and a late reply clears a match right away.
export const SLOW_REPLY_RULE = {
  WINDOW_DAYS: 14,
  UNANSWERED_AFTER_DAYS: 3,
  BADGE_MIN_UNANSWERED: 5,
  BADGE_MIN_SHARE: 0.6,
  WARNING_MIN_UNANSWERED: 3,
} as const;

export type ProfileBadge = "slowToReply" | "greatChat";

export type ReplyStatus = "clear" | "warning" | "badge";

export interface ReplyStats {
  /** Matches in the window who messaged the user. */
  messagedMatches: number;
  /** Of those, how many are unanswered. */
  unanswered: number;
}

export function getReplyStatus({ messagedMatches, unanswered }: ReplyStats): ReplyStatus {
  const share = messagedMatches > 0 ? unanswered / messagedMatches : 0;
  if (
    unanswered >= SLOW_REPLY_RULE.BADGE_MIN_UNANSWERED &&
    share > SLOW_REPLY_RULE.BADGE_MIN_SHARE
  ) {
    return "badge";
  }
  if (unanswered >= SLOW_REPLY_RULE.WARNING_MIN_UNANSWERED) return "warning";
  return "clear";
}

/** How many more matches need a reply or unmatch before the badge goes away. */
export function repliesToClearBadge({ messagedMatches, unanswered }: ReplyStats): number {
  let needed = 0;
  while (
    getReplyStatus({ messagedMatches, unanswered: unanswered - needed }) === "badge"
  ) {
    needed++;
  }
  return needed;
}
