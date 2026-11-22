import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { eq } from "drizzle-orm";
import { db, notificationSettingsTable } from "@workspace/db";
import { SetNotificationSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

const ALL_ON = { matches: true, messages: true, pebbles: true, slowReply: true };

router.get("/notification-settings", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const [row] = await db
    .select()
    .from(notificationSettingsTable)
    .where(eq(notificationSettingsTable.userId, userId));
  res.json(row ? { matches: row.matches, messages: row.messages, pebbles: row.pebbles, slowReply: row.slowReply } : ALL_ON);
});

router.put("/notification-settings", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = SetNotificationSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const settings = parsed.data;
  await db
    .insert(notificationSettingsTable)
    .values({ userId, ...settings })
    .onConflictDoUpdate({
      target: notificationSettingsTable.userId,
      set: { ...settings, updatedAt: new Date() },
    });
  res.json(settings);
});

export default router;
