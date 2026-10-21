import AsyncStorage from "@react-native-async-storage/async-storage";

// Profiles whose "Slow to reply" bar the user closed in chat. The ghost icon
// next to the name stays; only the bar is hidden.
const STORAGE_KEY = "spark_slow_reply_dismissed";

async function getDismissedProfileIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

export async function isSlowReplyNoticeDismissed(profileId: string): Promise<boolean> {
  return (await getDismissedProfileIds()).includes(profileId);
}

export async function dismissSlowReplyNotice(profileId: string): Promise<void> {
  const ids = await getDismissedProfileIds();
  if (ids.includes(profileId)) return;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...ids, profileId]));
}
