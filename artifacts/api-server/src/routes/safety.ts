import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, blocksTable, unmatchesTable } from "@workspace/db";
import { BlockProfileBody, UnmatchProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/blocks", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = BlockProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.profileId === userId) {
    res.status(400).json({ error: "You cannot block your own profile" });
    return;
  }

  await db
    .insert(blocksTable)
    .values({ blockerId: userId, blockedProfileId: parsed.data.profileId })
    .onConflictDoNothing();

  res.status(204).end();
});

router.post("/unmatches", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = UnmatchProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.profileId === userId) {
    res.status(400).json({ error: "You cannot unmatch your own profile" });
    return;
  }

  await db
    .insert(unmatchesTable)
    .values({ userId, unmatchedProfileId: parsed.data.profileId })
    .onConflictDoNothing();

  res.status(204).end();
});

export default router;
