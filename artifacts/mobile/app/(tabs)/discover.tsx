import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterModal, DEFAULT_FILTERS, DiscoverFilters, getActiveFilterCount } from "@/components/FilterModal";
import { SlowToReplyNotice, hasSlowToReplyBadge } from "@/components/SlowToReplyNotice";
import { SwipeCard } from "@/components/SwipeCard";
import { normalizeLookingFor } from "@/constants/lookingFor";
import { MOCK_CITY_DECKS, MOCK_CITY_PROFILES, MOCK_PROFILES, type Profile } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";
import { getLastBrowseCityChange, recordBrowseCityChange, type BrowseCityChange } from "@/utils/browseCity";
import { matchesDiscoverFilters } from "@/utils/discoverFilters";
import { getHiddenProfileIds } from "@/utils/hiddenProfiles";
import { formatDistanceLimit, getDistanceUnit, isAtMaxDistance } from "@/utils/units";

const { width: W, height: H } = Dimensions.get("window");
// Height of the pass/like row, set by the like button.
const ACTIONS_HEIGHT = 68;

export default function DiscoverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { dailyLikes, useLike, level } = useApp();
  const { user, isLoading: authLoading } = useAuth();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [blocksLoaded, setBlocksLoaded] = useState(false);
  const profileStateInitialized = useRef(false);
  const { loaded: communityLoaded, sharedBoardsWith } = useCommunity();
  const boostApplied = useRef(false);
  const [lastPassedProfile, setLastPassedProfile] = useState<Profile | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedName, setMatchedName] = useState("");
  const [matchedNote, setMatchedNote] = useState("");
  const [matchedSlowToReply, setMatchedSlowToReply] = useState(false);
  const matchAnim = useRef(new Animated.Value(0)).current;
  const [showFilter, setShowFilter] = useState(false);
  const [cardAreaHeight, setCardAreaHeight] = useState<number | undefined>(undefined);
  const [activeFilters, setActiveFilters] = useState<DiscoverFilters>(DEFAULT_FILTERS);
  const filterPreferenceInitialized = useRef(false);
  const filterCount = getActiveFilterCount(activeFilters);
  const [lastBrowseCityChange, setLastBrowseCityChange] = useState<BrowseCityChange | null>(null);

  // Browsing another city: a city picked in filters that isn't where the user
  // lives. Distances on that deck are measured from the chosen city.
  const browseCity =
    !activeFilters.useCurrentLocation &&
    activeFilters.locationCity &&
    activeFilters.locationCity !== user?.homeCity
      ? activeFilters.locationCity
      : null;
  const browseCityRef = useRef(browseCity);
  browseCityRef.current = browseCity;

  const deckFor = (city: string | null) =>
    city
      ? MOCK_CITY_PROFILES.filter((p) => (MOCK_CITY_DECKS[city] ?? []).includes(p.id))
      : MOCK_PROFILES;

  // Board-mates move up the local deck, in their existing order.
  const boostOrder = useCallback(
    (list: Profile[]) => [
      ...list.filter((p) => sharedBoardsWith(p).length > 0),
      ...list.filter((p) => sharedBoardsWith(p).length === 0),
    ],
    [sharedBoardsWith],
  );

  const handleApplyFilters = (next: DiscoverFilters) => {
    const nextCity =
      !next.useCurrentLocation && next.locationCity && next.locationCity !== user?.homeCity
        ? next.locationCity
        : null;
    // Only a different city counts toward the once-a-week limit.
    if (nextCity && nextCity !== lastBrowseCityChange?.city) {
      setLastBrowseCityChange({ city: nextCity, changedAt: Date.now() });
      recordBrowseCityChange(nextCity).catch(() => {});
    }
    setActiveFilters(next);
  };

  useEffect(() => {
    if (authLoading || !user || filterPreferenceInitialized.current) return;

    filterPreferenceInitialized.current = true;
    setActiveFilters((current) => ({
      ...current,
      lookingFor: normalizeLookingFor(user.lookingFor),
    }));
  }, [authLoading, user]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setBlocksLoaded(false);
      getLastBrowseCityChange().then((change) => {
        if (!cancelled) setLastBrowseCityChange(change);
      });

      getHiddenProfileIds().then((blockedProfileIds) => {
        if (cancelled) return;
        const blocked = new Set(blockedProfileIds);

        setProfiles((currentProfiles) => {
          if (!profileStateInitialized.current) {
            profileStateInitialized.current = true;
            return deckFor(browseCityRef.current).filter((profile) => !blocked.has(profile.id));
          }
          return currentProfiles.filter((profile) => !blocked.has(profile.id));
        });
        setLastPassedProfile((profile) =>
          profile && blocked.has(profile.id) ? null : profile,
        );
        setBlocksLoaded(true);
      });

      return () => {
        cancelled = true;
      };
    }, []),
  );

  // Boost: once the deck and boards are loaded, people who share a board with
  // the user move up, in their existing order. Nobody is added who wasn't
  // already in the deck, so Discover's preferences still decide who appears.
  useEffect(() => {
    if (boostApplied.current || !communityLoaded || !blocksLoaded) return;
    boostApplied.current = true;
    if (!browseCityRef.current) setProfiles((current) => boostOrder(current));
  }, [communityLoaded, blocksLoaded, boostOrder]);

  // Switching city swaps the deck; coming back home restores the local one.
  const previousBrowseCity = useRef(browseCity);
  useEffect(() => {
    if (previousBrowseCity.current === browseCity) return;
    previousBrowseCity.current = browseCity;
    getHiddenProfileIds().then((hiddenIds) => {
      const deck = deckFor(browseCity).filter((p) => !hiddenIds.includes(p.id));
      setProfiles(browseCity ? deck : boostOrder(deck));
      setLastPassedProfile(null);
    });
  }, [browseCity]); // eslint-disable-line react-hooks/exhaustive-deps

  // The deck keeps everyone not yet swiped; filters decide who's shown.
  const visibleProfiles = profiles.filter((p) => matchesDiscoverFilters(p, activeFilters));
  const topProfile = visibleProfiles[0];

  const handleSwipeRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const succeeded = useLike();
    if (!succeeded) return;
    const matched = Math.random() > 0.6;
    if (matched && topProfile) {
      setMatchedName(topProfile.name);
      setMatchedNote(topProfile.matchNote ?? "");
      setMatchedSlowToReply(hasSlowToReplyBadge(topProfile.badges));
      setShowMatch(true);
      Animated.spring(matchAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    }
    setLastPassedProfile(null);
    if (topProfile) setProfiles((prev) => prev.filter((p) => p.id !== topProfile.id));
  };

  const handleSwipeLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!topProfile) return;
    setLastPassedProfile(topProfile);
    setProfiles((prev) => prev.filter((p) => p.id !== topProfile.id));
  };

  const handleRewind = () => {
    if (!lastPassedProfile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProfiles((prev) => [lastPassedProfile, ...prev]);
    setLastPassedProfile(null);
  };

  const dismissMatch = () => {
    Animated.timing(matchAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowMatch(false);
      matchAnim.setValue(0);
    });
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;
  // The pass/like row sits just above the tab bar; the card area ends above it.
  const actionsBottom = bottomPad + 12;
  const cardBottom = actionsBottom + ACTIONS_HEIGHT + 12;

  const isLegend = level >= 5;
  const canRewind = level >= 4 && lastPassedProfile !== null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, paddingBottom: 12 }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowFilter(true); }}
          activeOpacity={0.8}
        >
          <Feather name="sliders" size={18} color={filterCount > 0 ? colors.accent : colors.foreground} />
          {filterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.accent }]}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.centerHeader}>
          <Feather name="heart" size={20} color={colors.accent} />
          <Text style={[styles.appTitle, { color: colors.foreground }]}>Spark</Text>
          {isLegend && (
            <View style={[styles.priorityBadge, { backgroundColor: colors.gold + "22" }]}>
              <Feather name="zap" size={10} color={colors.gold} />
              <Text style={[styles.priorityText, { color: colors.gold }]}>Priority</Text>
            </View>
          )}
        </View>

        <View style={[styles.likesCounter, { backgroundColor: colors.secondary }]}>
          <Feather name="zap" size={13} color={colors.gold} />
          <Text style={[styles.likesText, { color: colors.foreground }]}>
            {dailyLikes} likes
          </Text>
        </View>
      </View>

      {browseCity && (
        <TouchableOpacity
          onPress={() => setShowFilter(true)}
          style={[styles.browsingPill, { backgroundColor: colors.secondary }]}
          accessibilityRole="button"
          accessibilityLabel={`Browsing ${browseCity}. Change location`}
        >
          <Feather name="navigation" size={12} color={colors.foreground} />
          <Text style={[styles.browsingText, { color: colors.foreground }]}>Browsing {browseCity}</Text>
        </TouchableOpacity>
      )}

      <View
        style={[styles.cardArea, { marginBottom: cardBottom }]}
        onLayout={(e) => setCardAreaHeight(e.nativeEvent.layout.height)}
      >
        {!blocksLoaded ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Loading profiles…
            </Text>
          </View>
        ) : visibleProfiles.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="map-pin" size={44} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No one new within {formatDistanceLimit(activeFilters.maxDistance, getDistanceUnit())}
              {browseCity ? ` of ${browseCity}` : ""}
            </Text>
            {!isAtMaxDistance(activeFilters.maxDistance, getDistanceUnit()) ? (
              <>
                <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                  Expand your distance to see more people.
                </Text>
                <TouchableOpacity
                  onPress={() => setShowFilter(true)}
                  style={[styles.expandBtn, { backgroundColor: colors.primary }]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.expandBtnText, { color: colors.primaryForeground }]}>Expand distance</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
                Check back soon for new people near you.
              </Text>
            )}
          </View>
        ) : (
          visibleProfiles.slice(0, 3).map((profile, index) => (
            <SwipeCard
              key={profile.id}
              profile={profile}
              isTop={index === 0}
              index={index}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
              sharedBoard={sharedBoardsWith(profile)[0]}
              // Leave room for the stacked cards peeking out below.
              maxHeight={cardAreaHeight !== undefined ? cardAreaHeight - 24 : undefined}
            />
          ))
        )}
      </View>

      {blocksLoaded && visibleProfiles.length > 0 && (
        <View style={[styles.actions, { bottom: actionsBottom, paddingHorizontal: 40 }]}>
          {canRewind ? (
            <TouchableOpacity
              onPress={handleRewind}
              style={[styles.actionBtn, styles.rewindBtn, { backgroundColor: colors.secondary }]}
              activeOpacity={0.8}
            >
              <Feather name="rotate-ccw" size={20} color={colors.gold} />
            </TouchableOpacity>
          ) : (
            <View style={styles.rewindPlaceholder} />
          )}

          <TouchableOpacity
            onPress={handleSwipeLeft}
            style={[styles.actionBtn, styles.passBtn, { backgroundColor: colors.secondary }]}
            activeOpacity={0.8}
          >
            <Feather name="x" size={26} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSwipeRight}
            style={[styles.actionBtn, styles.likeBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.8}
            disabled={dailyLikes === 0}
          >
            <Feather name="heart" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {blocksLoaded && visibleProfiles.length > 0 && topProfile && (
        <TouchableOpacity
          style={[styles.profileTap, { bottom: cardBottom + 16, right: 20 }]}
          onPress={() => router.push(`/profile/${topProfile.id}`)}
        >
          <Feather name="info" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      )}

      {showMatch && (
        <Animated.View
          style={[
            styles.matchOverlay,
            {
              opacity: matchAnim,
              transform: [{ scale: matchAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
            },
          ]}
        >
          <View style={[styles.matchCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.matchTitle, { color: colors.foreground }]}>It's a Match!</Text>
            <Text style={[styles.matchSub, { color: colors.mutedForeground }]}>
              You and {matchedName} liked each other
            </Text>
            {matchedNote ? (
              <View style={[styles.matchNoteCard, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.matchNoteText, { color: colors.foreground }]}>"{matchedNote}"</Text>
              </View>
            ) : null}
            {matchedSlowToReply && <SlowToReplyNotice name={matchedName} variant="match" />}
            <View style={styles.matchButtons}>
              <TouchableOpacity
                onPress={() => { dismissMatch(); router.push("/(tabs)/matches"); }}
                style={[styles.matchBtn, { backgroundColor: colors.primary }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.matchBtnText, { color: colors.primaryForeground }]}>Send Message</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={dismissMatch} style={styles.matchSkip}>
                <Text style={[styles.matchSkipText, { color: colors.mutedForeground }]}>Keep Swiping</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {dailyLikes === 0 && (
        <View style={[styles.lowLikesBar, { backgroundColor: colors.gold, bottom: cardBottom }]}>
          <Feather name="zap" size={14} color="#fff" />
          <Text style={styles.lowLikesText}>Out of likes — complete a challenge to earn more!</Text>
        </View>
      )}

      <FilterModal
        visible={showFilter}
        filters={activeFilters}
        onApply={handleApplyFilters}
        lastBrowseCityChange={lastBrowseCityChange}
        onClose={() => setShowFilter(false)}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
  centerHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 20,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  likesCounter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  likesText: {
    fontSize: 13,
    fontWeight: "700",
  },
  cardArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },
  browsingPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 8,
  },
  browsingText: { fontSize: 13, fontWeight: "600" },
  expandBtn: {
    marginTop: 8,
    height: 48,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  expandBtnText: { fontSize: 15, fontWeight: "600" },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  actions: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  actionBtn: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rewindBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  rewindPlaceholder: {
    width: 48,
    height: 48,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  likeBtn: {
    width: ACTIONS_HEIGHT,
    height: ACTIONS_HEIGHT,
    borderRadius: ACTIONS_HEIGHT / 2,
  },
  profileTap: {
    position: "absolute",
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  matchOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    padding: 40,
  },
  matchCard: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  matchTitle: {
    fontSize: 30,
    fontWeight: "800",
  },
  matchSub: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  matchNoteCard: {
    borderRadius: 12,
    padding: 14,
    width: "100%",
    alignItems: "center",
  },
  matchNoteText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 20,
  },
  matchButtons: {
    width: "100%",
    gap: 10,
    marginTop: 8,
  },
  matchBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  matchBtnText: {
    fontSize: 16,
    fontWeight: "700",
  },
  matchSkip: {
    paddingVertical: 12,
    alignItems: "center",
  },
  matchSkipText: {
    fontSize: 14,
  },
  lowLikesBar: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  lowLikesText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
});
