import AsyncStorage from "@react-native-async-storage/async-storage";

// The last city the user chose to browse in Discover, and when. Kept on the
// phone for now; the server will enforce the weekly limit.
const STORAGE_KEY = "spark_browse_city";

export interface BrowseCityChange {
  city: string;
  changedAt: number;
}

export async function getLastBrowseCityChange(): Promise<BrowseCityChange | null> {
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

export async function recordBrowseCityChange(city: string): Promise<void> {
  const change: BrowseCityChange = { city, changedAt: Date.now() };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(change));
}
