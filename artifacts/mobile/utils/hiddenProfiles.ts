import { getBlockedProfileIds } from "@/utils/blocks";
import { getUnmatchedProfileIds } from "@/utils/unmatches";

/** Profiles the user blocked or unmatched; hidden everywhere in the app. */
export async function getHiddenProfileIds(): Promise<string[]> {
  const [blocked, unmatched] = await Promise.all([
    getBlockedProfileIds(),
    getUnmatchedProfileIds(),
  ]);
  return Array.from(new Set([...blocked, ...unmatched]));
}

export async function isProfileHidden(profileId: string): Promise<boolean> {
  return (await getHiddenProfileIds()).includes(profileId);
}
