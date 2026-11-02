import type { DiscoverFilters } from "@/components/FilterModal";
import type { Profile } from "@/constants/mockData";
import { formatDistance } from "@/utils/distance";
import { KM_PER_MILE, getDistanceUnit } from "@/utils/units";

/** Sample profiles store distance as text like "2 mi away"; returns miles. */
export function profileDistanceMiles(profile: Profile): number | null {
  const match = profile.distance.match(/[\d.]+/);
  if (!match) return null;
  const value = parseFloat(match[0]);
  if (!Number.isFinite(value)) return null;
  return profile.distance.includes("km") ? value / KM_PER_MILE : value;
}

/** "~3 mi away" or "~5 km away", in the user's unit. */
export function formatProfileDistance(profile: Profile): string {
  const miles = profileDistanceMiles(profile);
  if (miles === null) return formatDistance(profile.distance);
  const unit = getDistanceUnit();
  return formatDistance(unit === "km" ? miles * KM_PER_MILE : miles, unit);
}

/**
 * Whether a profile passes the user's Discover filters. Applies the filters
 * the sample profiles have data for: distance, age, interests and verified.
 * The rest (gender, height, lifestyle...) need real profiles from the server,
 * which will also check the other person's distance limit.
 */
export function matchesDiscoverFilters(profile: Profile, filters: DiscoverFilters): boolean {
  const miles = profileDistanceMiles(profile);
  if (miles !== null && miles > filters.maxDistance) return false;
  if (profile.age < filters.ageMin || profile.age > filters.ageMax) return false;
  if (filters.interests.length > 0 && !profile.interests.some((i) => filters.interests.includes(i))) {
    return false;
  }
  if (filters.verifiedOnly && !profile.verified) return false;
  return true;
}
