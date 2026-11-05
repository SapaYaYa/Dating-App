import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { adSessionsTable, browseCitiesTable, db, type BrowseCity } from "@workspace/db";
import { SetBrowseCityBody } from "@workspace/api-zod";

import { getProgress, rewardsLeft } from "../lib/progress";
import { BROWSE_CITY_CHANGE_DAYS, DAY_MS, dayKey } from "../lib/rewards";

const router: IRouter = Router();

function nextChangeAt(row: BrowseCity | undefined, now = Date.now()): Date | null {
  if (!row?.changedAt) return null;
  const next = row.changedAt.getTime() + BROWSE_CITY_CHANGE_DAYS * DAY_MS;
  return next > now ? new Date(next) : null;
}

async function toApi(userId: string, row: BrowseCity | undefined) {
  const progress = await getProgress(userId);
  return {
    city: row?.city ?? null,
    lastCity: row?.lastCity ?? null,
    changedAt: row?.changedAt?.toISOString() ?? null,
    nextChangeAt: nextChangeAt(row)?.toISOString() ?? null,
    citySkipsLeft: await rewardsLeft(userId, "citySkip", dayKey(new Date(), progress.timeZone)),
  };
}

router.get("/browse-city", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [row] = await db.select().from(browseCitiesTable).where(eq(browseCitiesTable.userId, userId));
  res.json(await toApi(userId, row));
});

router.put("/browse-city", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = SetBrowseCityBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { city, skipSessionId } = parsed.data;
  const [row] = await db.select().from(browseCitiesTable).where(eq(browseCitiesTable.userId, userId));

  // Back to their own area, or the same city again: always allowed, and
  // doesn't restart the week.
  if (city === null || city === row?.lastCity) {
    const [saved] = await db
      .insert(browseCitiesTable)
      .values({ userId, city })
      .onConflictDoUpdate({ target: browseCitiesTable.userId, set: { city } })
      .returning();
    res.json(await toApi(userId, saved));
    return;
  }

  const lockedUntil = nextChangeAt(row);
  if (lockedUntil) {
    if (!skipSessionId) {
      res.status(409).json({ error: `You can browse a new city again on ${lockedUntil.toISOString()}` });
      return;
    }
    // Use up a granted city-skip reward; it works once.
    const used = await db
      .update(adSessionsTable)
      .set({ usedAt: new Date() })
      .where(
        and(
          eq(adSessionsTable.id, skipSessionId),
          eq(adSessionsTable.userId, userId),
          eq(adSessionsTable.placement, "citySkip"),
          isNotNull(adSessionsTable.grantedAt),
          isNull(adSessionsTable.usedAt),
        ),
      )
      .returning();
    if (used.length === 0) {
      res.status(400).json({ error: "That city skip isn't available" });
      return;
    }
  }

  const now = new Date();
  const [saved] = await db
    .insert(browseCitiesTable)
    .values({ userId, city, lastCity: city, changedAt: now })
    .onConflictDoUpdate({ target: browseCitiesTable.userId, set: { city, lastCity: city, changedAt: now } })
    .returning();
  res.json(await toApi(userId, saved));
});

export default router;
