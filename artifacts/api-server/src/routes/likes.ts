import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { and, eq, sql } from "drizzle-orm";
import { db, likeAllowancesTable, userProgressTable } from "@workspace/db";
import { GetLikeAllowanceQueryParams } from "@workspace/api-zod";

import { getAllowance, getProgress } from "../lib/progress";
import { dailyLikesFor, dayKey, isValidTimeZone, levelFor } from "../lib/rewards";

const router: IRouter = Router();

router.get("/likes/allowance", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GetLikeAllowanceQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { timeZone } = parsed.data;
  if (timeZone !== undefined) {
    if (!isValidTimeZone(timeZone)) {
      res.status(400).json({ error: "Unknown time zone" });
      return;
    }
    await getProgress(userId);
    await db.update(userProgressTable).set({ timeZone }).where(eq(userProgressTable.userId, userId));
  }

  res.json(await getAllowance(userId));
});

router.post("/likes/spend", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const progress = await getProgress(userId);
  const today = dayKey(new Date(), progress.timeZone);
  const dailyLikes = dailyLikesFor(levelFor(progress.points));

  await db.insert(likeAllowancesTable).values({ userId, day: today }).onConflictDoNothing();
  // One statement, so two likes at once can't both take the last one.
  const spent = await db
    .update(likeAllowancesTable)
    .set({ used: sql`${likeAllowancesTable.used} + 1` })
    .where(
      and(
        eq(likeAllowancesTable.userId, userId),
        eq(likeAllowancesTable.day, today),
        sql`${likeAllowancesTable.used} < ${dailyLikes} + ${likeAllowancesTable.extra}`,
      ),
    )
    .returning();
  if (spent.length === 0) {
    res.status(409).json({ error: "Out of likes for today" });
    return;
  }

  res.json(await getAllowance(userId));
});

export default router;
