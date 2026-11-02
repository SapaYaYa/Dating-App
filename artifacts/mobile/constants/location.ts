// How often people can change where they browse and where they're based.
// Switching back to "Use My Location" is always allowed.
export const LOCATION_RULE = {
  BROWSE_CITY_CHANGE_DAYS: 7,
  HOME_CITY_CHANGE_DAYS: 30,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

/** When a change made at `changedAt` allows the next one; null if allowed now. */
export function nextChangeAllowedAt(
  changedAt: number | undefined,
  days: number,
  now: number = Date.now(),
): number | null {
  if (changedAt === undefined) return null;
  const next = changedAt + days * DAY_MS;
  return next > now ? next : null;
}

/** "Nov 9" */
export function formatChangeDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
