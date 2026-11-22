import { timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { and, eq, isNull } from "drizzle-orm";
import { db, reportsTable } from "@workspace/db";
import { buildDigest } from "../lib/reportReview";

// Team-only tools, protected by the ADMIN_TOKEN secret (sent as
// "Authorization: Bearer <token>"). Off entirely when ADMIN_TOKEN isn't set.

const router: IRouter = Router();

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const token = process.env.ADMIN_TOKEN;
  const given = req.headers.authorization?.replace(/^Bearer /, "") ?? "";
  const ok =
    !!token &&
    token.length >= 24 &&
    given.length === token.length &&
    timingSafeEqual(Buffer.from(given), Buffer.from(token));
  if (!ok) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  next();
}

const OUTCOMES = new Set(["no_action", "action_taken"]);

// Mark every open report about one person as reviewed. This also lifts the
// automatic Discover hide.
router.post("/admin/profiles/:profileId/reports/review", requireAdmin, async (req, res): Promise<void> => {
  const outcome = (req.body as { outcome?: unknown } | undefined)?.outcome;
  if (typeof outcome !== "string" || !OUTCOMES.has(outcome)) {
    res.status(400).json({ error: 'outcome must be "no_action" or "action_taken"' });
    return;
  }
  const reviewed = await db
    .update(reportsTable)
    .set({ reviewedAt: new Date(), outcome })
    .where(and(eq(reportsTable.reportedProfileId, String(req.params.profileId)), isNull(reportsTable.reviewedAt)))
    .returning({ id: reportsTable.id });
  res.json({ reviewed: reviewed.length });
});

// The same text as the daily email, on demand.
router.get("/admin/reports/digest", requireAdmin, async (_req, res): Promise<void> => {
  const digest = await buildDigest();
  res.type("text/plain").send(`${digest.subject}\n\n${digest.text}`);
});

export default router;
