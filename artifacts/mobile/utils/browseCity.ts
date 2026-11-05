import AsyncStorage from "@react-native-async-storage/async-storage";
import { getBrowseCity, setBrowseCity } from "@workspace/api-client-react";

import { DEMO_MODE } from "@/constants/demo";

// The last city the user chose to browse in Discover, and when. The server
// owns it and enforces the weekly limit; the phone keeps a copy for the
// preview (no server) and for when the server can't be reached.
const STORAGE_KEY = "spark_browse_city";

export interface BrowseCityChange {
  city: string;
  changedAt: number;
}

export async function getLastBrowseCityChange(): Promise<BrowseCityChange | null> {
  if (!DEMO_MODE) {
    try {
      const remote = await getBrowseCity();
      const change =
        remote.lastCity && remote.changedAt
          ? { city: remote.lastCity, changedAt: Date.parse(remote.changedAt) }
          : null;
      if (change) await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(change));
      return change;
    } catch {
      // Fall back to the phone's copy.
    }
  }
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof (parsed as BrowseCityChange).city === "string" &&
      typeof (parsed as BrowseCityChange).changedAt === "number"
    ) {
      return parsed as BrowseCityChange;
    }
    return null;
  } catch {
    return null;
  }
}

/** Switches to a different city; `skipSessionId` is a granted city-skip ad. */
export async function recordBrowseCityChange(city: string, skipSessionId?: string): Promise<void> {
  const change: BrowseCityChange = { city, changedAt: Date.now() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(change));
  if (!DEMO_MODE) await setBrowseCity({ city, ...(skipSessionId ? { skipSessionId } : {}) });
}

/** Tells the server the city browsed now (null = home) without a new change. */
export async function syncBrowseCity(city: string | null): Promise<void> {
  if (!DEMO_MODE) await setBrowseCity({ city });
}
