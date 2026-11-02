import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterModal, DEFAULT_FILTERS, DiscoverFilters, getActiveFilterCount } from "@/components/FilterModal";
import { SlowToReplyNotice, hasSlowToReplyBadge } from "@/components/SlowToReplyNotice";
import { LikePanel } from "@/components/LikePanel";
import { ProfileScroll } from "@/components/ProfileScroll";
import { normalizeLookingFor } from "@/constants/lookingFor";
import type { LikeTarget } from "@/constants/prompts";
import { MOCK_CITY_DECKS, MOCK_CITY_PROFILES, MOCK_PROFILES, type Profile } from "@/constants/mockData";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { useCommunity } from "@/context/CommunityContext";
import { useColors } from "@/hooks/useColors";
import { getLastBrowseCityChange, recordBrowseCityChange, type BrowseCityChange } from "@/utils/browseCity";
import { matchesDiscoverFilters } from "@/utils/discoverFilters";
import { getHiddenProfileIds } from "@/utils/hiddenProfiles";
import { formatDistanceLimit, getDistanceUnit, isAtMaxDistance } from "@/utils/units";


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

  // Discover is one profile at a time, scrolled. A heart on a photo or
  // answer opens the like panel; X passes.
  const scrollRef = useRef<ScrollView>(null);
  const [likeTarget, setLikeTarget] = useState<LikeTarget | null>(null);
  const [toast, setToast] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 1800);
  };

  const moveOn = (profile: Profile) => {
    setProfiles((prev) => prev.filter((p) => p.id !== profile.id));
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  // The note goes to the server with the like once likes are stored there.
  const handleSendLike = (_note: string) => {
    if (!topProfile) return;
    const liked = topProfile;
    setLikeTarget(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!useLike()) return;
    setLastPassedProfile(null);
    moveOn(liked);
    if (Math.random() > 0.6) {
      setMatchedName(liked.name);
      setMatchedNote(liked.matchNote ?? "");
      setMatchedSlowToReply(hasSlowToReplyBadge(liked.badges));
      setShowMatch(true);
      Animated.spring(matchAnim, { toValue: 1, useNativeDriver: true, friction: 5 }).start();
    } else {
      showToast(`Like sent to ${liked.name}`);
    }
  };

  const handlePass = () => {
    if (!topProfile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLastPassedProfile(topProfile);
    moveOn(topProfile);
  };

  const handleRewind = () => {
    if (!lastPassedProfile) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProfiles((prev) => [lastPassedProfile, ...prev]);
    setLastPassedProfile(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  };

  const dismissMatch = () => {
    Animated.timing(matchAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setShowMatch(false);
      matchAnim.setValue(0);
    });
  };

  const topPad = insets.top + (Platform.OS === "web" ? 67 : 0);
  const bottomPad = insets.bottom + (Platform.OS === "web" ? 34 : 0) + 68;

  const isLegend = level >= 5;
  const canRewind = level >= 4 && lastPassedProfile !== null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, paddingBottom: 12 }]}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.secondary }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowFilter(true); }}
          activeOpacity={0.8}
          accessibilityLabel="Filters"
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

      {dailyLikes === 0 && (
        <View style={[styles.lowLikesBar, { backgroundColor: colors.gold }]}>
          <Feather name="zap" size={14} color="#fff" />
          <Text style={styles.lowLikesText}>Out of likes — complete a challenge to earn more!</Text>
        </View>
      )}

      <View style={styles.content}>
        {!blocksLoaded ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              Loading profiles…
            </Text>
          </View>
        ) : !topProfile ? (
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
          <ScrollView
            // A new ScrollView per person, so each profile starts at the top.
            key={topProfile.id}
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scroll, { paddingBottom: bottomPad + 96 }]}
          >
            <ProfileScroll
              profile={topProfile}
              sharedBoard={sharedBoardsWith(topProfile)[0]}
              onLike={setLikeTarget}
            />
          </ScrollView>
        )}
      </View>

      {blocksLoaded && topProfile && (
        <View style={[styles.floatingActions, { bottom: bottomPad + 16 }]}>
          <TouchableOpacity
            onPress={handlePass}
            style={[styles.passBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Pass on ${topProfile.name}`}
          >
            <Feather name="x" size={26} color={colors.mutedForeground} />
          </TouchableOpacity>
          {canRewind && (
            <TouchableOpacity
              onPress={handleRewind}
              style={[styles.rewindBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Bring back the last person you passed"
            >
              <Feather name="rotate-ccw" size={20} color={colors.gold} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {toast ? (
        <View style={[styles.toast, { backgroundColor: colors.primary }]} accessibilityLiveRegion="polite">
          <Text style={[styles.toastText, { color: colors.primaryForeground }]}>{toast}</Text>
        </View>
      ) : null}

      <LikePanel
        profile={likeTarget ? topProfile ?? null : null}
        target={likeTarget}
        likesLeft={dailyLikes}
        onSend={handleSendLike}
        onClose={() => setLikeTarget(null)}
      />

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
                <Text style={[styles.matchSkipText, { color: colors.mutedForeground }]}>Keep Browsing</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
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
  content: { flex: 1, justifyContent: "center" },
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
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
  floatingActions: {
    position: "absolute",
    left: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  passBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  rewindBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  toast: {
    position: "absolute",
    alignSelf: "center",
    top: 130,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: { fontSize: 14, fontWeight: "600" },
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
    marginHorizontal: 16,
    marginBottom: 8,
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
