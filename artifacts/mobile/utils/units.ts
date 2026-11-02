// Distances are stored in miles and shown in the unit the user's country uses.

export type DistanceUnit = "mi" | "km";

export const KM_PER_MILE = 1.609344;

/** Discover's maximum-distance setting, in miles. The top of the range is a real limit, never "Anywhere". */
export const MAX_DISTANCE_RULE = {
  MIN_MILES: 1,
  MAX_MILES: 150,
  DEFAULT_MILES: 25,
} as const;

// Countries that use miles for everyday distances.
const MILES_COUNTRIES = new Set(["US", "GB", "LR", "MM"]);

/** The user's distance unit, from their phone's region (e.g. en-US -> mi, fr-FR -> km). */
export function getDistanceUnit(): DistanceUnit {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    const region = new Intl.Locale(locale).maximize().region;
    if (region) return MILES_COUNTRIES.has(region) ? "mi" : "km";
  } catch {
    // Older JavaScript engines without Intl.Locale: fall through.
  }
  return "mi";
}

/** Miles -> whole number in the user's unit. */
export function milesToUnit(miles: number, unit: DistanceUnit): number {
  return Math.round(unit === "km" ? miles * KM_PER_MILE : miles);
}

/** A value in the user's unit -> miles. */
export function unitToMiles(value: number, unit: DistanceUnit): number {
  return unit === "km" ? value / KM_PER_MILE : value;
}

/** The slider's range in the user's unit: 1-150 mi, or the round 1-240 km. */
export function distanceRange(unit: DistanceUnit): { min: number; max: number } {
  return unit === "km" ? { min: 1, max: 240 } : { min: MAX_DISTANCE_RULE.MIN_MILES, max: MAX_DISTANCE_RULE.MAX_MILES };
}

/** Whether a max distance (in miles) is already at the top of the user's range. */
export function isAtMaxDistance(miles: number, unit: DistanceUnit): boolean {
  return milesToUnit(miles, unit) >= distanceRange(unit).max;
}

/** "25 mi" or "40 km". */
export function formatDistanceLimit(miles: number, unit: DistanceUnit): string {
  return `${milesToUnit(miles, unit)} ${unit}`;
}
