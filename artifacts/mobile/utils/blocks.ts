import AsyncStorage from "@react-native-async-storage/async-storage";

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

export async function blockProfile(profileId: string): Promise<void> {
  const blockedProfileIds = await getBlockedProfileIds();
  if (blockedProfileIds.includes(profileId)) return;

  await AsyncStorage.setItem(
    BLOCKS_STORAGE_KEY,
    JSON.stringify([...blockedProfileIds, profileId]),
  );
}

export async function hasBlocked(profileId: string): Promise<boolean> {
  const blockedProfileIds = await getBlockedProfileIds();
  return blockedProfileIds.includes(profileId);
}
