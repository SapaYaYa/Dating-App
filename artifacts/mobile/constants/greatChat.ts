// The "Great Chat" badge rule. Activity counts over the last 2 weeks; ratings
// from matches count over the last 30 days, since they come in slowly.
export const GREAT_CHAT_RULE = {
  ACTIVITY_WINDOW_DAYS: 14,
  RATING_WINDOW_DAYS: 30,
  /** Replied to at least this share of matches who messaged them. */
  MIN_REPLY_RATE: 0.8,
  /** At least this many conversations reached LONG_MIN_MESSAGES... */
  MIN_LONG_CONVERSATIONS: 3,
  LONG_MIN_MESSAGES: 10,
  /** ...with each person sending at least this many. */
  LONG_MIN_EACH: 4,
  /** Their typical share of messages in a conversation, so neither side carries it. */
  BALANCE_MIN: 0.3,
  BALANCE_MAX: 0.7,
  /** At least this many different people rated their conversations... */
  MIN_RATERS: 3,
  /** ...and at least this share said "Great". "Okay" and "Not great" count nowhere else. */
  MIN_GREAT_SHARE: 0.75,
} as const;

export interface GreatChatStats {
  replyRate: number;
  longConversations: number;
  /** The user's median share of messages across their conversations. */
  typicalShare: number;
  raters: number;
  greatRatings: number;
  hasRecentReport: boolean;
  hasSlowToReply: boolean;
}

export function qualifiesForGreatChat(stats: GreatChatStats): boolean {
  const r = GREAT_CHAT_RULE;
  return (
    !stats.hasRecentReport &&
    !stats.hasSlowToReply &&
    stats.replyRate >= r.MIN_REPLY_RATE &&
    stats.longConversations >= r.MIN_LONG_CONVERSATIONS &&
    stats.typicalShare >= r.BALANCE_MIN &&
    stats.typicalShare <= r.BALANCE_MAX &&
    stats.raters >= r.MIN_RATERS &&
    stats.greatRatings / stats.raters >= r.MIN_GREAT_SHARE
  );
}

// Asking one match to rate their conversation with the other.
export const CHAT_RATING_PROMPT = {
  /** Asked once the conversation has substance: the same bar as a long conversation. */
  MIN_MESSAGES: GREAT_CHAT_RULE.LONG_MIN_MESSAGES,
  MIN_EACH: GREAT_CHAT_RULE.LONG_MIN_EACH,
  /** A skipped prompt comes back once, this many days later, if they're still chatting. */
  REASK_AFTER_DAYS: 3,
  MAX_SKIPS: 2,
} as const;

export type ChatRating = "great" | "okay" | "notGreat";

export const CHAT_RATING_OPTIONS: { value: ChatRating; label: string; description: string }[] = [
  { value: "great", label: "Great", description: "I'm enjoying our conversation" },
  { value: "okay", label: "Okay", description: "It's fine, nothing special" },
  { value: "notGreat", label: "Not great", description: "It's not really clicking" },
];

/** Whether a conversation has enough back and forth to be worth rating. */
export function isConversationRateable(messages: { isOwn: boolean }[]): boolean {
  const own = messages.filter((m) => m.isOwn).length;
  const theirs = messages.length - own;
  return (
    messages.length >= CHAT_RATING_PROMPT.MIN_MESSAGES &&
    own >= CHAT_RATING_PROMPT.MIN_EACH &&
    theirs >= CHAT_RATING_PROMPT.MIN_EACH
  );
}

export interface ChatRatingRecord {
  rating?: ChatRating;
  skips: number;
  lastSkippedAt?: number;
  messagesAtLastSkip?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Answered: never ask again. Skipped once: ask one more time after
 * REASK_AFTER_DAYS, and only if new messages came in since. Skipped twice:
 * never ask again.
 */
export function shouldAskForRating(
  record: ChatRatingRecord | undefined,
  messageCount: number,
  now: number,
): boolean {
  if (!record) return true;
  if (record.rating) return false;
  if (record.skips === 0) return true;
  if (record.skips >= CHAT_RATING_PROMPT.MAX_SKIPS) return false;
  return (
    record.lastSkippedAt !== undefined &&
    now - record.lastSkippedAt >= CHAT_RATING_PROMPT.REASK_AFTER_DAYS * DAY_MS &&
    messageCount > (record.messagesAtLastSkip ?? 0)
  );
}
