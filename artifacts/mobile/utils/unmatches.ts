import AsyncStorage from "@react-native-async-storage/async-storage";
import { unmatchProfile as unmatchProfileOnServer } from "@workspace/api-client-react";

export const UNMATCHES_STORAGE_KEY = "spark_unmatches";

export async function getUnmatchedProfileIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(UNMATCHES_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return Array.from(
      new Set(
        parsed.filter(
          (profileId): profileId is string => typeof profileId === "string",
        ),
      ),
    );
  } catch {
    return [];
  }
}

/**
 * Unmatches a profile on this phone and on the server. The server copy is
 * best-effort: the local unmatch always applies.
 */
export async function unmatchProfile(profileId: string): Promise<void> {
  const unmatchedProfileIds = await getUnmatchedProfileIds();
  if (!unmatchedProfileIds.includes(profileId)) {
    await AsyncStorage.setItem(
      UNMATCHES_STORAGE_KEY,
      JSON.stringify([...unmatchedProfileIds, profileId]),
    );
  }

  unmatchProfileOnServer({ profileId }).catch(() => {});
}

export async function hasUnmatched(profileId: string): Promise<boolean> {
  const unmatchedProfileIds = await getUnmatchedProfileIds();
  return unmatchedProfileIds.includes(profileId);
}
