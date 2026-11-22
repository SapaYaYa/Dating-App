import { Router, type IRouter } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import { eq, inArray, or } from "drizzle-orm";
import {
  accountDeletionsTable,
  adSessionsTable,
  adViewsTable,
  blocksTable,
  browseCitiesTable,
  db,
  likeAllowancesTable,
  notificationSettingsTable,
  profilesTable,
  unmatchesTable,
  userProgressTable,
} from "@workspace/db";
import { DeleteMyAccountBody, GetMyProfileResponse, SetMyProfilePausedBody } from "@workspace/api-zod";

const router: IRouter = Router();

// Pause: hidden from everyone's Discover; matches and chats are unaffected.
router.put("/profiles/me/pause", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = SetMyProfilePausedBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [profile] = await db
    .update(profilesTable)
    .set({ paused: parsed.data.paused, updatedAt: new Date() })
    .where(eq(profilesTable.id, userId))
    .returning();
  if (!profile) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  const { latitude: _lat, longitude: _lon, ...safe } = profile;
  res.json(GetMyProfileResponse.parse({ ...safe, distanceKm: null }));
});

// Delete account. Every step is idempotent, so a retry after a failure
// finishes the job. Reports (made by or about this person) stay for safety.
router.delete("/profiles/me", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = DeleteMyAccountBody.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await db.transaction(async (tx) => {
    const sessions = await tx
      .select({ id: adSessionsTable.id })
      .from(adSessionsTable)
      .where(eq(adSessionsTable.userId, userId));
    if (sessions.length > 0) {
      await tx.delete(adViewsTable).where(inArray(adViewsTable.sessionId, sessions.map((s) => s.id)));
    }
    await tx.delete(adSessionsTable).where(eq(adSessionsTable.userId, userId));
    await tx.delete(likeAllowancesTable).where(eq(likeAllowancesTable.userId, userId));
    await tx.delete(userProgressTable).where(eq(userProgressTable.userId, userId));
    await tx.delete(browseCitiesTable).where(eq(browseCitiesTable.userId, userId));
    await tx.delete(notificationSettingsTable).where(eq(notificationSettingsTable.userId, userId));
    await tx
      .delete(blocksTable)
      .where(or(eq(blocksTable.blockerId, userId), eq(blocksTable.blockedProfileId, userId)));
    await tx
      .delete(unmatchesTable)
      .where(or(eq(unmatchesTable.userId, userId), eq(unmatchesTable.unmatchedProfileId, userId)));
    const removed = await tx.delete(profilesTable).where(eq(profilesTable.id, userId)).returning();
    // Record the reason once, on the call that actually removed the profile.
    if (removed.length > 0 && parsed.data.reason) {
      await tx.insert(accountDeletionsTable).values({ reason: parsed.data.reason });
    }
  });

  // Last: the sign-in account. If this fails, the app retries the request.
  try {
    await clerkClient.users.deleteUser(userId);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status !== 404) {
      req.log.error({ err }, "Deleting the sign-in account failed");
      res.status(502).json({ error: "Your data was deleted, but signing you out of Gentoo failed. Please try again." });
      return;
    }
  }
  res.status(204).end();
});

export default router;
