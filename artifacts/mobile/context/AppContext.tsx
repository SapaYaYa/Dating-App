import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

import { MOCK_CHALLENGES, type Challenge } from "@/constants/mockData";

interface AppContextType {
  dailyLikes: number;
  baseLikes: number;
  bonusLikes: number;
  maxDailyLikes: number;
  totalPoints: number;
  currentStreak: number;
  level: number;
  challenges: Challenge[];
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

  const level = Math.floor(totalPoints / 500) + 1;
  const maxDailyLikes = level >= 5 ? 6 : 5;
  const dailyLikes = baseLikes + bonusLikes;

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
