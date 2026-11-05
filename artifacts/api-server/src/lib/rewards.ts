// Likes and rewarded-ad rules. Keep these in step with the app's
// artifacts/mobile/constants/ads.ts.

export type RewardPlacement = "extraLikes" | "undoPass" | "citySkip";

export const REWARD_RULES: Record<
  RewardPlacement,
  { limit: number; period: "day" | "week"; adsPerReward: number }
> = {
  extraLikes: { limit: 3, period: "day", adsPerReward: 1 },
  undoPass: { limit: 5, period: "day", adsPerReward: 1 },
  citySkip: { limit: 1, period: "week", adsPerReward: 2 },
};

export const EXTRA_LIKES_PER_AD = 3;
export const FREE_UNDO_LEVEL = 4;
export const BROWSE_CITY_CHANGE_DAYS = 7;

const POINTS_PER_LEVEL = 500;

export function levelFor(points: number): number {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

/** Free likes a day: 5, or 6 from level 5. */
export function dailyLikesFor(level: number): number {
  return level >= 5 ? 6 : 5;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The calendar day ("YYYY-MM-DD") at `now` in a time zone. */
export function dayKey(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}
