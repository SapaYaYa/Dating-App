// Age signals from the app stores (Apple's Declared Age Range, Google Play
// Age Signals), read through expo-age-range. Gentoo is for adults only, so
// all we need from the store is: under 18, 18+, or no answer.

export const ADULT_AGE = 18;

/** The fields we use from expo-age-range's AgeRangeResponse. */
export interface StoreAgeRange {
  lowerBound?: number | null;
  upperBound?: number | null;
  /** Android only. Supervised accounts are children's accounts (Family Link). */
  userStatus?:
    | "VERIFIED"
    | "SUPERVISED"
    | "SUPERVISED_APPROVAL_PENDING"
    | "SUPERVISED_APPROVAL_DENIED"
    | "DECLARED"
    | "UNKNOWN"
    | null;
}

/**
 * "minor": the store says this person is under 18; block them.
 * "adult": the store says 18+.
 * "unknown": no answer (declined to share, not available in their region or
 * OS version, or an error). The birthday check at sign-up still applies.
 */
export type AgeVerdict = "minor" | "adult" | "unknown";

export function ageVerdict(range: StoreAgeRange | null | undefined): AgeVerdict {
  if (!range) return "unknown";
  if (range.userStatus?.startsWith("SUPERVISED")) return "minor";
  if (typeof range.upperBound === "number" && range.upperBound < ADULT_AGE) return "minor";
  if (typeof range.lowerBound === "number" && range.lowerBound >= ADULT_AGE) return "adult";
  return "unknown";
}
