import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { US_CITIES } from "@/components/FilterModal";
import { LOCATION_RULE, formatChangeDate, nextChangeAllowedAt } from "@/constants/location";
import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

/** Where the user is based ("Lives in ..."). Changeable once a month. */
export default function HomeCityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, updateUser } = useAuth();
  const [search, setSearch] = useState("");

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const lockedUntil = nextChangeAllowedAt(user?.homeCityChangedAt, LOCATION_RULE.HOME_CITY_CHANGE_DAYS);
  const query = search.trim().toLowerCase();
  const results = query ? US_CITIES.filter((c) => c.toLowerCase().includes(query)).slice(0, 12) : [];

  const choose = (city: string) => {
    if (lockedUntil || city === user?.homeCity) return;
    updateUser({ homeCity: city, homeCityChangedAt: Date.now() });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Back">
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>Home city</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}>
        <View style={[styles.current, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="home" size={18} color={colors.foreground} />
          <View style={styles.currentText}>
            <Text style={[styles.currentLabel, { color: colors.mutedForeground }]}>You live in</Text>
            <Text style={[styles.currentCity, { color: colors.foreground }]}>{user?.homeCity ?? "Not set"}</Text>
          </View>
        </View>

        <Text style={[styles.explain, { color: colors.mutedForeground }]}>
          Everyone sees "Lives in {user?.homeCity ?? "your city"}" on your profile, never your exact
          location. You can change your home city once a month. To look around another city, pick it in
          Discover filters instead.
        </Text>

        {lockedUntil ? (
          <View style={[styles.locked, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.lockedText, { color: colors.foreground }]}>
              You changed your home city recently. You can change it again on {formatChangeDate(lockedUntil)}.
            </Text>
          </View>
        ) : (
          <>
            <View style={[styles.searchWrap, { backgroundColor: colors.input }]}>
              <Feather name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={[styles.searchInput, { color: colors.foreground }]}
                placeholder="Search for your city..."
                placeholderTextColor={colors.mutedForeground}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
            </View>
            {results.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => choose(city)}
                style={[styles.cityRow, { borderBottomColor: colors.border }]}
                disabled={city === user?.homeCity}
              >
                <Feather name="map-pin" size={14} color={colors.mutedForeground} />
                <Text style={[styles.cityText, { color: colors.foreground }]}>{city}</Text>
                {city === user?.homeCity && (
                  <Text style={[styles.currentTag, { color: colors.mutedForeground }]}>Current</Text>
                )}
              </TouchableOpacity>
            ))}
            {query.length > 0 && results.length === 0 && (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>No cities matching "{search}"</Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingBottom: 6 },
  backBtn: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "800" },
  scroll: { padding: 20, gap: 14 },
  current: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  currentText: { gap: 2 },
  currentLabel: { fontSize: 12 },
  currentCity: { fontSize: 17, fontWeight: "700" },
  explain: { fontSize: 14, lineHeight: 20 },
  locked: { borderRadius: 12, padding: 14 },
  lockedText: { fontSize: 14, lineHeight: 20 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, paddingHorizontal: 14 },
  searchInput: { flex: 1, height: 46, fontSize: 15 },
  cityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    height: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cityText: { flex: 1, fontSize: 15 },
  currentTag: { fontSize: 12 },
  empty: { fontSize: 14, textAlign: "center", paddingVertical: 12 },
});
