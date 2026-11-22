import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getNotificationSettings,
  setNotificationSettings,
  type NotificationSettings,
} from "@workspace/api-client-react";

import { DEMO_MODE } from "@/constants/demo";

export type { NotificationSettings };

// Which push notifications the person wants. The server keeps the real copy
// (it will send the notifications); the phone keeps one for the preview and
// for when the server can't be reached.
const STORAGE_KEY = "spark_notification_settings";

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  matches: true,
  messages: true,
  pebbles: true,
  slowReply: true,
};

function parse(raw: string | null): NotificationSettings | null {
  try {
    const data: unknown = raw ? JSON.parse(raw) : null;
    if (!data || typeof data !== "object") return null;
    const d = data as Record<string, unknown>;
    const pick = (k: keyof NotificationSettings) => (typeof d[k] === "boolean" ? (d[k] as boolean) : true);
    return { matches: pick("matches"), messages: pick("messages"), pebbles: pick("pebbles"), slowReply: pick("slowReply") };
  } catch {
    return null;
  }
}

export async function loadNotificationSettings(): Promise<NotificationSettings> {
  if (!DEMO_MODE) {
    try {
      const remote = await getNotificationSettings();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
      return remote;
    } catch {
      // Fall back to the phone's copy.
    }
  }
  return parse(await AsyncStorage.getItem(STORAGE_KEY).catch(() => null)) ?? DEFAULT_NOTIFICATION_SETTINGS;
}

/** Saves on the phone right away; throws if the server refuses the change. */
export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings)).catch(() => {});
  if (!DEMO_MODE) await setNotificationSettings(settings);
}
