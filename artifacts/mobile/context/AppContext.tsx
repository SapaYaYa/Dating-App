import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLikeAllowance, spendLike, type LikeAllowance } from "@workspace/api-client-react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

import { DEMO_MODE } from "@/constants/demo";
import { MOCK_CHALLENGES, type Challenge } from "@/constants/mockData";
import { useAuth } from "@/context/AuthContext";

interface AppContextType {
  dailyLikes: number;
  baseLikes: number;
  bonusLikes: number;
  maxDailyLikes: number;
  totalPoints: number;
  currentStreak: number;
  level: number;
  challenges: Challenge[];
  /** Today's likes and ad limits from the server; null in the preview. */
  allowance: LikeAllowance | null;
  /** Reloads likes from the server (no-op in the preview). */
  refreshLikes: () => Promise<void>;
  useLike: () => boolean;
  earnLikes: (count: number) => void;
  completeChallenge: (id: string) => void;
  addPoints: (pts: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [baseLikes, setBaseLikes] = useState(5);
  const [bonusLikes, setBonusLikes] = useState(0);
  const [totalPoints, setTotalPoints] = useState(1240);
  const [currentStreak, setCurrentStreak] = useState(5);
  const [challenges, setChallenges] = useState<Challenge[]>(MOCK_CHALLENGES);

  // With the server, it owns likes, level and ad limits; the phone only shows
  // them. The preview (demo mode) keeps everything on the phone.
  const { user } = useAuth();
  const [allowance, setAllowance] = useState<LikeAllowance | null>(null);

  const refreshLikes = useCallback(async () => {
    if (DEMO_MODE || !user) return;
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setAllowance(await getLikeAllowance(timeZone ? { timeZone } : undefined));
    } catch {
      // Keep what's shown; the next refresh will catch up.
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refreshLikes();
  }, [refreshLikes]);

  const level = allowance ? allowance.level : Math.floor(totalPoints / 500) + 1;
  const maxDailyLikes = allowance ? allowance.dailyLikes : level >= 5 ? 6 : 5;
  const dailyLikes = allowance ? allowance.likesLeft : baseLikes + bonusLikes;

  useEffect(() => {
    AsyncStorage.getItem("app_state").then((stored) => {
      if (stored) {
        const state = JSON.parse(stored);
        if (state.baseLikes !== undefined) setBaseLikes(state.baseLikes);
        if (state.bonusLikes !== undefined) setBonusLikes(state.bonusLikes);
        if (state.totalPoints !== undefined) setTotalPoints(state.totalPoints);
        if (state.currentStreak !== undefined) setCurrentStreak(state.currentStreak);
      }
    });
  }, []);

  const saveState = (base: number, bonus: number, points: number, streak: number) => {
    AsyncStorage.setItem(
      "app_state",
      JSON.stringify({ baseLikes: base, bonusLikes: bonus, totalPoints: points, currentStreak: streak })
    );
  };

  const useLike = () => {
    if (allowance) {
      if (allowance.likesLeft <= 0) return false;
      // Shown right away; the server has the final say.
      setAllowance({ ...allowance, likesLeft: allowance.likesLeft - 1, used: allowance.used + 1 });
      spendLike()
        .then(setAllowance)
        .catch(() => refreshLikes());
      return true;
    }
    const total = baseLikes + bonusLikes;
    if (total <= 0) return false;
    if (baseLikes > 0) {
      const next = baseLikes - 1;
      setBaseLikes(next);
      saveState(next, bonusLikes, totalPoints, currentStreak);
    } else {
      const next = bonusLikes - 1;
      setBonusLikes(next);
      saveState(baseLikes, next, totalPoints, currentStreak);
    }
    return true;
  };

  const earnLikes = (count: number) => {
    // With the server, likes are granted there (ads now, real challenges
    // later); just reload them.
    if (allowance) {
      refreshLikes();
      return;
    }
    const next = bonusLikes + count;
    setBonusLikes(next);
    saveState(baseLikes, next, totalPoints, currentStreak);
  };

  const addPoints = (pts: number) => {
    const next = totalPoints + pts;
    setTotalPoints(next);
    saveState(baseLikes, bonusLikes, next, currentStreak);
  };

  const completeChallenge = (id: string) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === id && !c.completed) {
          addPoints(c.points);
          return { ...c, completed: true, progress: c.total };
        }
        return c;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        dailyLikes,
        baseLikes,
        bonusLikes,
        maxDailyLikes,
        totalPoints,
        currentStreak,
        level,
        challenges,
        allowance,
        refreshLikes,
        useLike,
        earnLikes,
        completeChallenge,
        addPoints,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
