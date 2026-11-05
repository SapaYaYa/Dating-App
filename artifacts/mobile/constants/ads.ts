// Ad rules. The server enforces the reward limits (keep in step with
// artifacts/api-server/src/lib/rewards.ts); the preview, which has no server,
// uses these numbers on the phone.

/** Rewarded ads: the person chooses to watch one for a reward. */
export type RewardPlacement = "extraLikes" | "undoPass" | "citySkip";

export interface RewardRule {
  /** How many rewards per period. */
  limit: number;
  /** "day" resets at local midnight; "week" is a rolling 7 days. */
  period: "day" | "week";
  /** Ads played back to back for one reward. */
  adsPerReward: number;
}

export const REWARD_RULES: Record<RewardPlacement, RewardRule> = {
  extraLikes: { limit: 3, period: "day", adsPerReward: 1 },
  undoPass: { limit: 5, period: "day", adsPerReward: 1 },
  citySkip: { limit: 1, period: "week", adsPerReward: 2 },
};

export const AD_RULES = {
  /** Likes added by one extra-likes ad. */
  EXTRA_LIKES_PER_AD: 3,
  /** Undo a pass is free from this level; below it, it takes an ad. */
  FREE_UNDO_LEVEL: 4,
  /** One sponsored card after this many profiles in Discover. */
  DISCOVER_SPONSORED_EVERY: 15,
  /** One sponsored post after this many posts in a board. */
  BOARD_SPONSORED_EVERY: 15,
  /** Length of each fake ad in the preview. Real ads are chosen by the ad network. */
  FAKE_AD_SECONDS: 5,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfLocalDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Rewards still available for a placement, given when past ones were earned. */
export function rewardsLeft(
  placement: RewardPlacement,
  earnedAt: number[],
  now: number = Date.now(),
): number {
  const rule = REWARD_RULES[placement];
  const since = rule.period === "day" ? startOfLocalDay(now) : now - 7 * DAY_MS;
  const used = earnedAt.filter((t) => t >= since && t <= now).length;
  return Math.max(0, rule.limit - used);
}

/** Where to put sponsored items in a list: after every `every` real items. */
export function withSponsored<T>(items: T[], every: number): (T | { sponsored: number })[] {
  const out: (T | { sponsored: number })[] = [];
  items.forEach((item, i) => {
    out.push(item);
    if ((i + 1) % every === 0) out.push({ sponsored: (i + 1) / every });
  });
  return out;
}
