import { Router, type IRouter } from "express";
import { getAuth } from "@clerk/express";
import { db, blocksTable, reportsTable } from "@workspace/db";
import { CreateReportBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/reports", async (req, res): Promise<void> => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateReportBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid report input");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  if (parsed.data.reportedProfileId === userId) {
    res.status(400).json({ error: "You cannot report your own profile" });
    return;
  }

  // Reporting someone also blocks them, in the same transaction.
  const report = await db.transaction(async (tx) => {
    const [saved] = await tx
      .insert(reportsTable)
      .values({
        reportedProfileId: parsed.data.reportedProfileId,
        reporterId: userId,
        category: parsed.data.category,
        note: parsed.data.note,
      })
      .returning();

    await tx
      .insert(blocksTable)
      .values({ blockerId: userId, blockedProfileId: parsed.data.reportedProfileId })
      .onConflictDoNothing();

    return saved;
  });

  res.status(201).json(report);
});

export default router;