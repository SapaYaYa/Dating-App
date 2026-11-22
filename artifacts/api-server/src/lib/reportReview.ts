import { asc, countDistinct, eq, gte, inArray, isNull } from "drizzle-orm";
import { db, profilesTable, reportDigestsTable, reportsTable } from "@workspace/db";
import { logger } from "./logger";

// How reports are reviewed (decided November 2026):
// - Serious reports must be reviewed within 24 hours, the rest within 3 days.
// - Anyone with open reports from AUTO_HIDE_REPORTERS different people is
//   hidden from Discover until their reports are reviewed.
// - A daily email lists every open report, most urgent first.

export const SERIOUS_CATEGORIES = new Set(["Harassment", "Violence", "Inappropriate Photos"]);
export const SERIOUS_DUE_HOURS = 24;
export const STANDARD_DUE_HOURS = 72;
export const AUTO_HIDE_REPORTERS = 3;

/** The daily email goes out at this hour in this time zone. */
export const DIGEST_TIME_ZONE = "America/New_York";
export const DIGEST_HOUR = 8;

const HOUR_MS = 60 * 60 * 1000;

export function dueAt(category: string, reportedAt: Date): Date {
  const hours = SERIOUS_CATEGORIES.has(category) ? SERIOUS_DUE_HOURS : STANDARD_DUE_HOURS;
  return new Date(reportedAt.getTime() + hours * HOUR_MS);
}

/** People hidden from Discover until their reports are reviewed. */
export async function autoHiddenProfileIds(): Promise<string[]> {
  const rows = await db
    .select({ id: reportsTable.reportedProfileId })
    .from(reportsTable)
    .where(isNull(reportsTable.reviewedAt))
    .groupBy(reportsTable.reportedProfileId)
    .having(gte(countDistinct(reportsTable.reporterId), AUTO_HIDE_REPORTERS));
  return rows.map((r) => r.id);
}

function formatTime(d: Date): string {
  return d.toLocaleString("en-US", {
    timeZone: DIGEST_TIME_ZONE,
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

function formatDue(due: Date, now: Date): string {
  const hours = Math.round((due.getTime() - now.getTime()) / HOUR_MS);
  if (hours < 0) return `OVERDUE by ${-hours}h`;
  return hours < 1 ? "due within the hour" : `due in ${hours}h`;
}

export interface Digest {
  subject: string;
  text: string;
  openCount: number;
}

/** Every open report, most urgent first, as a plain-text email. */
export async function buildDigest(now: Date = new Date()): Promise<Digest> {
  const open = await db
    .select()
    .from(reportsTable)
    .where(isNull(reportsTable.reviewedAt))
    .orderBy(asc(reportsTable.timestamp));

  if (open.length === 0) {
    return { subject: "Gentoo reports: nothing open", text: "No open reports. Nice.", openCount: 0 };
  }

  const reportedIds = [...new Set(open.map((r) => r.reportedProfileId))];
  const [profiles, hidden] = await Promise.all([
    db
      .select({ id: profilesTable.id, name: profilesTable.name })
      .from(profilesTable)
      .where(inArray(profilesTable.id, reportedIds)),
    autoHiddenProfileIds(),
  ]);
  const nameOf = new Map(profiles.map((p) => [p.id, p.name]));
  const hiddenSet = new Set(hidden);

  // Open reports and distinct reporters per reported person.
  const perPerson = new Map<string, { reports: number; reporters: Set<string> }>();
  for (const r of open) {
    const entry = perPerson.get(r.reportedProfileId) ?? { reports: 0, reporters: new Set<string>() };
    entry.reports += 1;
    entry.reporters.add(r.reporterId);
    perPerson.set(r.reportedProfileId, entry);
  }

  const items = open
    .map((r) => ({ r, due: dueAt(r.category, r.timestamp) }))
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  const overdue = items.filter((i) => i.due < now).length;
  const serious = items.filter((i) => SERIOUS_CATEGORIES.has(i.r.category)).length;

  const lines: string[] = [
    `${open.length} open report${open.length === 1 ? "" : "s"}: ${serious} serious (review within ${SERIOUS_DUE_HOURS}h), ` +
      `${open.length - serious} standard (within ${STANDARD_DUE_HOURS / 24} days). ${overdue} overdue.`,
    hidden.length > 0
      ? `${hidden.length} ${hidden.length === 1 ? "person is" : "people are"} hidden from Discover (reported by ${AUTO_HIDE_REPORTERS}+ people) until reviewed.`
      : "",
    "",
    "Most urgent first:",
    "",
  ];

  for (const { r, due } of items) {
    const who = nameOf.get(r.reportedProfileId) ?? "(profile deleted)";
    const person = perPerson.get(r.reportedProfileId)!;
    lines.push(
      `#${r.id}  ${r.category}${SERIOUS_CATEGORIES.has(r.category) ? " (SERIOUS)" : ""}  ${formatDue(due, now)}`,
      `  Reported: ${who} (${r.reportedProfileId}), ${person.reports} open report${person.reports === 1 ? "" : "s"} ` +
        `from ${person.reporters.size} ${person.reporters.size === 1 ? "person" : "people"}` +
        (hiddenSet.has(r.reportedProfileId) ? ", HIDDEN from Discover" : ""),
      `  By: ${r.reporterId} on ${formatTime(r.timestamp)}`,
      `  Note: ${r.note.trim() || "(none)"}`,
      "",
    );
  }

  lines.push(
    "When you've reviewed someone, mark their reports reviewed (this also unhides them):",
    "POST /api/admin/profiles/<profile id>/reports/review with {\"outcome\": \"no_action\"} or {\"outcome\": \"action_taken\"}",
  );

  const subject =
    overdue > 0
      ? `Gentoo reports: ${open.length} open, ${overdue} overdue`
      : `Gentoo reports: ${open.length} open`;
  return { subject, text: lines.filter((l, i, a) => !(l === "" && a[i - 1] === "")).join("\n"), openCount: open.length };
}

/** Sends through Resend (resend.com) when RESEND_API_KEY is set; otherwise logs. */
async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.REPORTS_DIGEST_FROM ?? "Gentoo Reports <reports@gentoodating.com>";
  if (!key) {
    logger.warn({ to, subject }, "RESEND_API_KEY not set; report digest not emailed");
    logger.info({ text }, "Report digest");
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to: to.split(",").map((s) => s.trim()), subject, text }),
  });
  if (!res.ok) throw new Error(`Email failed: ${res.status} ${await res.text().catch(() => "")}`);
  return true;
}

function localDayAndHour(now: Date): { day: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: DIGEST_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return { day: `${get("year")}-${get("month")}-${get("day")}`, hour: Number(get("hour")) };
}

/**
 * Sends today's digest if it's past DIGEST_HOUR and today's hasn't gone out.
 * Claiming the day in the database first means only one server sends it,
 * even with several servers or restarts. Skips days with no open reports.
 */
export async function sendDigestIfDue(now: Date = new Date()): Promise<"sent" | "logged" | "not_due" | "already_sent" | "nothing_open"> {
  const to = process.env.REPORTS_DIGEST_TO;
  if (!to) return "not_due";
  const { day, hour } = localDayAndHour(now);
  if (hour < DIGEST_HOUR) return "not_due";

  const claimed = await db.insert(reportDigestsTable).values({ day }).onConflictDoNothing().returning();
  if (claimed.length === 0) return "already_sent";

  const digest = await buildDigest(now);
  if (digest.openCount === 0) return "nothing_open";
  try {
    return (await sendEmail(to, digest.subject, digest.text)) ? "sent" : "logged";
  } catch (err) {
    // Give the day back so the next hourly check tries again.
    await db.delete(reportDigestsTable).where(eq(reportDigestsTable.day, day));
    throw err;
  }
}

/** Checks every hour whether the daily digest is due. */
export function startReportDigestSchedule(): void {
  if (!process.env.REPORTS_DIGEST_TO) {
    logger.warn("REPORTS_DIGEST_TO not set; the daily report email is off");
    return;
  }
  const check = () =>
    sendDigestIfDue()
      .then((result) => {
        if (result === "sent") logger.info("Daily report digest sent");
      })
      .catch((err) => logger.error({ err }, "Daily report digest failed"));
  check();
  setInterval(check, HOUR_MS).unref();
}
