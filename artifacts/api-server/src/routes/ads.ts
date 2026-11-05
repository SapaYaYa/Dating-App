import { randomBytes, randomUUID } from "node:crypto";
import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { and, eq, sql } from "drizzle-orm";
import { adSessionsTable, adViewsTable, db, likeAllowancesTable, type AdSession } from "@workspace/db";
import { CreateAdSessionBody } from "@workspace/api-zod";

import { verifyAdMobCallback } from "../lib/admobVerifier";
import { getProgress, rewardsLeft } from "../lib/progress";
import {
  EXTRA_LIKES_PER_AD,
  FREE_UNDO_LEVEL,
  REWARD_RULES,
  dayKey,
  levelFor,
  type RewardPlacement,
} from "../lib/rewards";

const router: IRouter = Router();

const toApi = (s: AdSession) => ({
  id: s.id,
  placement: s.placement as RewardPlacement,
  adsRequired: s.adsRequired,
  adsCompleted: s.adsCompleted,
  granted: s.grantedAt !== null,
});

/**
 * Counts one finished ad (once per AdMob transaction ID) and grants the
 * reward when every ad in the session has finished and the limit allows it.
 */
async function recordAdView(sessionId: string, transactionId: string): Promise<AdSession | null> {
  return db.transaction(async (tx) => {
    const inserted = await tx
      .insert(adViewsTable)
      .values({ transactionId, sessionId })
      .onConflictDoNothing()
      .returning();
    const [session] = await tx
      .select()
      .from(adSessionsTable)
      .where(eq(adSessionsTable.id, sessionId))
      .for("update");
    if (!session) return null;
    // A repeated message, or a session already granted: nothing more to do.
    if (inserted.length === 0 || session.grantedAt) return session;

    const adsCompleted = session.adsCompleted + 1;
    let grantedAt: Date | null = null;
    let grantedDay: string | null = null;
    if (adsCompleted >= session.adsRequired) {
      const placement = session.placement as RewardPlacement;
      const progress = await getProgress(session.userId, tx);
      const today = dayKey(new Date(), progress.timeZone);
      // Re-checked here: several sessions may have been started at once.
      if ((await rewardsLeft(session.userId, placement, today, tx)) > 0) {
        grantedAt = new Date();
        grantedDay = today;
        if (placement === "extraLikes") {
          await tx
            .insert(likeAllowancesTable)
            .values({ userId: session.userId, day: today, extra: EXTRA_LIKES_PER_AD })
            .onConflictDoUpdate({
              target: [likeAllowancesTable.userId, likeAllowancesTable.day],
              set: { extra: sql`${likeAllowancesTable.extra} + ${EXTRA_LIKES_PER_AD}` },
            });
        }
      }
    }

    const [updated] = await tx
      .update(adSessionsTable)
      .set({ adsCompleted, grantedAt, grantedDay })
      .where(eq(adSessionsTable.id, sessionId))
      .returning();
    return updated;
  });
}

router.post("/ads/sessions", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateAdSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { placement } = parsed.data;

  const progress = await getProgress(userId);
  if (placement === "undoPass" && levelFor(progress.points) >= FREE_UNDO_LEVEL) {
    res.status(400).json({ error: "Undo is free at your level" });
    return;
  }
  const today = dayKey(new Date(), progress.timeZone);
  if ((await rewardsLeft(userId, placement, today)) <= 0) {
    res.status(409).json({
      error: REWARD_RULES[placement].period === "week" ? "Limit reached for this week" : "Limit reached for today",
    });
    return;
  }

  const [session] = await db
    .insert(adSessionsTable)
    .values({
      id: randomBytes(16).toString("hex"),
      userId,
      placement,
      adsRequired: REWARD_RULES[placement].adsPerReward,
    })
    .returning();
  res.status(201).json(toApi(session));
});

router.get("/ads/sessions/:sessionId", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [session] = await db
    .select()
    .from(adSessionsTable)
    .where(and(eq(adSessionsTable.id, req.params.sessionId), eq(adSessionsTable.userId, userId)));
  if (!session) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(toApi(session));
});

// Development only: stands in for AdMob while the app plays fake ads.
router.post("/ads/sessions/:sessionId/test-complete", async (req, res): Promise<void> => {
  if (process.env.ADS_TEST_MODE !== "1") {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [owned] = await db
    .select()
    .from(adSessionsTable)
    .where(and(eq(adSessionsTable.id, req.params.sessionId), eq(adSessionsTable.userId, userId)));
  if (!owned) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const session = await recordAdView(owned.id, `test-${randomUUID()}`);
  res.json(toApi(session ?? owned));
});

// AdMob's signed "ad finished" message (server-side verification). Called
// by AdMob, not the app, so it has no sign-in; the signature is the check.
router.get("/ads/admob-callback", async (req, res): Promise<void> => {
  const rawQuery = req.originalUrl.split("?")[1] ?? "";
  // An empty request is AdMob's "verify URL" check in its console.
  if (rawQuery === "") {
    res.status(200).end();
    return;
  }
  const params = await verifyAdMobCallback(rawQuery);
  if (!params) {
    res.status(403).json({ error: "Invalid signature" });
    return;
  }

  const sessionId = params.get("custom_data") ?? "";
  const userId = params.get("user_id") ?? "";
  const transactionId = params.get("transaction_id") ?? "";
  const [session] = sessionId
    ? await db.select().from(adSessionsTable).where(eq(adSessionsTable.id, sessionId))
    : [];
  // Signed by AdMob but not for a session of this person: acknowledge so
  // AdMob stops retrying, and grant nothing.
  if (!session || session.userId !== userId || !transactionId) {
    req.log.warn({ sessionFound: !!session }, "AdMob callback did not match a session");
    res.status(200).end();
    return;
  }

  await recordAdView(session.id, transactionId);
  res.status(200).end();
});

export default router;
