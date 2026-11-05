import { and, eq, gte, isNotNull, sql } from "drizzle-orm";
import {
  adSessionsTable,
  db,
  likeAllowancesTable,
  userProgressTable,
  type UserProgress,
} from "@workspace/db";

import {
  DAY_MS,
  REWARD_RULES,
  dailyLikesFor,
  dayKey,
  levelFor,
  FREE_UNDO_LEVEL,
  type RewardPlacement,
} from "./rewards";

/** Works with the shared db or inside a transaction. */
export type Executor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/** The person's progress row, created on first use. */
export async function getProgress(userId: string, ex: Executor = db): Promise<UserProgress> {
  await ex.insert(userProgressTable).values({ userId }).onConflictDoNothing();
  const [row] = await ex.select().from(userProgressTable).where(eq(userProgressTable.userId, userId));
  return row;
}

/** Rewards of a placement still available today (or this week). */
export async function rewardsLeft(
  userId: string,
  placement: RewardPlacement,
  today: string,
  ex: Executor = db,
): Promise<number> {
  const rule = REWARD_RULES[placement];
  const since =
    rule.period === "day"
      ? eq(adSessionsTable.grantedDay, today)
      : gte(adSessionsTable.grantedAt, new Date(Date.now() - 7 * DAY_MS));
  const [{ count }] = await ex
    .select({ count: sql<number>`count(*)::int` })
    .from(adSessionsTable)
    .where(
      and(
        eq(adSessionsTable.userId, userId),
        eq(adSessionsTable.placement, placement),
        isNotNull(adSessionsTable.grantedAt),
        since,
      ),
    );
  return Math.max(0, rule.limit - count);
}

export interface Allowance {
  likesLeft: number;
  dailyLikes: number;
  extraLikes: number;
  used: number;
  level: number;
  freeUndo: boolean;
  adsLeft: Record<RewardPlacement, number>;
}

export async function getAllowance(userId: string, ex: Executor = db): Promise<Allowance> {
  const progress = await getProgress(userId, ex);
  const today = dayKey(new Date(), progress.timeZone);
  const level = levelFor(progress.points);
  const dailyLikes = dailyLikesFor(level);
  const [row] = await ex
    .select()
    .from(likeAllowancesTable)
    .where(and(eq(likeAllowancesTable.userId, userId), eq(likeAllowancesTable.day, today)));
  const used = row?.used ?? 0;
  const extraLikes = row?.extra ?? 0;
  return {
    likesLeft: Math.max(0, dailyLikes + extraLikes - used),
    dailyLikes,
    extraLikes,
    used,
    level,
    freeUndo: level >= FREE_UNDO_LEVEL,
    adsLeft: {
      extraLikes: await rewardsLeft(userId, "extraLikes", today, ex),
      undoPass: await rewardsLeft(userId, "undoPass", today, ex),
      citySkip: await rewardsLeft(userId, "citySkip", today, ex),
    },
  };
}
