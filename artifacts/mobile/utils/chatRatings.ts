import AsyncStorage from "@react-native-async-storage/async-storage";

import type { ChatRating, ChatRatingRecord } from "@/constants/greatChat";

// The user's answers to "How's your conversation going?", per match. Kept on
// this phone for now; the other person never sees them.
const STORAGE_KEY = "spark_chat_ratings";

async function getAll(): Promise<Record<string, ChatRatingRecord>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, ChatRatingRecord>)
      : {};
  } catch {
    return {};
  }
}

async function save(profileId: string, record: ChatRatingRecord): Promise<void> {
  const all = await getAll();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ ...all, [profileId]: record }));
}

export async function getChatRatingRecord(profileId: string): Promise<ChatRatingRecord | undefined> {
  return (await getAll())[profileId];
}

export async function saveChatRating(profileId: string, rating: ChatRating): Promise<void> {
  const current = await getChatRatingRecord(profileId);
  await save(profileId, { skips: current?.skips ?? 0, ...current, rating });
}

export async function skipChatRating(profileId: string, messageCount: number): Promise<void> {
  const current = await getChatRatingRecord(profileId);
  await save(profileId, {
    ...current,
    skips: (current?.skips ?? 0) + 1,
    lastSkippedAt: Date.now(),
    messagesAtLastSkip: messageCount,
  });
}
