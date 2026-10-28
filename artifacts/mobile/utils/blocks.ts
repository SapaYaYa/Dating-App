import AsyncStorage from "@react-native-async-storage/async-storage";
import { blockProfile as blockProfileOnServer } from "@workspace/api-client-react";

export const BLOCKS_STORAGE_KEY = "spark_blocks";

export async function getBlockedProfileIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKS_STORAGE_KEY);
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
 * Blocks a profile on this phone and, unless told not to, on the server.
 * The server copy is best-effort: the local block always applies.
 */
export async function blockProfile(
  profileId: string,
  { syncServer = true }: { syncServer?: boolean } = {},
): Promise<void> {
  const blockedProfileIds = await getBlockedProfileIds();
  if (!blockedProfileIds.includes(profileId)) {
    await AsyncStorage.setItem(
      BLOCKS_STORAGE_KEY,
      JSON.stringify([...blockedProfileIds, profileId]),
    );
  }

  if (syncServer) {
    blockProfileOnServer({ profileId }).catch(() => {});
  }
}

export async function hasBlocked(profileId: string): Promise<boolean> {
  const blockedProfileIds = await getBlockedProfileIds();
  return blockedProfileIds.includes(profileId);
}
