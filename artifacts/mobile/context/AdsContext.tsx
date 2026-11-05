import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AD_RULES, REWARD_RULES, rewardsLeft, type RewardPlacement } from "@/constants/ads";

// The one place the app plays ads. Today it plays fake ads (the preview has
// no ad network); the real ad SDK and the server's reward check plug in here.

const STORAGE_KEY = "spark_ad_rewards";

type RewardLog = Record<RewardPlacement, number[]>;
const EMPTY_LOG: RewardLog = { extraLikes: [], undoPass: [], challengeDouble: [], citySkip: [] };

interface AdsContextType {
  /** Rewards left for a placement in its current day or week. */
  left: (placement: RewardPlacement) => number;
  /** Plays the ad(s) for a reward. Resolves true only if they played to the end. */
  watchRewardedAd: (placement: RewardPlacement) => Promise<boolean>;
}

const AdsContext = createContext<AdsContextType | null>(null);

interface Playing {
  placement: RewardPlacement;
  resolve: (earned: boolean) => void;
}

export function AdsProvider({ children }: { children: React.ReactNode }) {
  const [log, setLog] = useState<RewardLog>(EMPTY_LOG);
  const logRef = useRef(log);
  logRef.current = log;
  const [playing, setPlaying] = useState<Playing | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as Partial<RewardLog>;
        const next = { ...EMPTY_LOG };
        (Object.keys(EMPTY_LOG) as RewardPlacement[]).forEach((k) => {
          const v = parsed[k];
          if (Array.isArray(v)) next[k] = v.filter((t) => typeof t === "number");
        });
        setLog(next);
      })
      .catch(() => {});
  }, []);

  const left = useCallback((placement: RewardPlacement) => rewardsLeft(placement, log[placement]), [log]);

  const watchRewardedAd = useCallback((placement: RewardPlacement) => {
    if (rewardsLeft(placement, logRef.current[placement]) <= 0) return Promise.resolve(false);
    return new Promise<boolean>((resolve) => setPlaying({ placement, resolve }));
  }, []);

  const finish = (earned: boolean) => {
    if (!playing) return;
    if (earned) {
      const now = Date.now();
      // Keep only the last week; nothing older affects any limit.
      const keepSince = now - 8 * 24 * 60 * 60 * 1000;
      const next = {
        ...logRef.current,
        [playing.placement]: [...logRef.current[playing.placement].filter((t) => t >= keepSince), now],
      };
      setLog(next);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
    }
    playing.resolve(earned);
    setPlaying(null);
  };

  return (
    <AdsContext.Provider value={{ left, watchRewardedAd }}>
      {children}
      {playing && (
        <FakeRewardedAd adCount={REWARD_RULES[playing.placement].adsPerReward} onDone={finish} />
      )}
    </AdsContext.Provider>
  );
}

export function useAds() {
  const ctx = useContext(AdsContext);
  if (!ctx) throw new Error("useAds must be used within AdsProvider");
  return ctx;
}

/** A stand-in for a real rewarded ad: a countdown per ad, then the reward. */
function FakeRewardedAd({ adCount, onDone }: { adCount: number; onDone: (earned: boolean) => void }) {
  const insets = useSafeAreaInsets();
  const [adIndex, setAdIndex] = useState(0);
  const [seconds, setSeconds] = useState<number>(AD_RULES.FAKE_AD_SECONDS);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const complete = adIndex === adCount - 1 && seconds === 0;

  useEffect(() => {
    if (confirmLeave || complete) return;
    const t = setTimeout(() => {
      if (seconds > 1) setSeconds(seconds - 1);
      else if (adIndex < adCount - 1) {
        setAdIndex(adIndex + 1);
        setSeconds(AD_RULES.FAKE_AD_SECONDS);
      } else setSeconds(0);
    }, 1000);
    return () => clearTimeout(t);
  }, [seconds, adIndex, adCount, confirmLeave, complete]);

  return (
    <Modal visible animationType="fade" onRequestClose={() => (complete ? onDone(true) : setConfirmLeave(true))}>
      <View style={[styles.adRoot, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.adTop}>
          <View style={styles.adTag}>
            <Text style={styles.adTagText}>Ad{adCount > 1 ? ` ${adIndex + 1} of ${adCount}` : ""}</Text>
          </View>
          <TouchableOpacity
            onPress={() => (complete ? onDone(true) : setConfirmLeave(true))}
            style={styles.adClose}
            accessibilityRole="button"
            accessibilityLabel={complete ? "Close ad" : "Leave ad"}
          >
            <Feather name="x" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.adBody}>
          <Feather name="play-circle" size={64} color="rgba(255,255,255,0.5)" />
          <Text style={styles.adTitle}>Sample ad</Text>
          <Text style={styles.adSub}>Real ads will play here in the phone app.</Text>
        </View>

        {confirmLeave ? (
          <View style={styles.adConfirm}>
            <Text style={styles.adConfirmText}>Leave now and you won't get the reward.</Text>
            <View style={styles.adConfirmRow}>
              <TouchableOpacity onPress={() => setConfirmLeave(false)} style={[styles.adBtn, styles.adBtnPrimary]}>
                <Text style={styles.adBtnPrimaryText}>Keep watching</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDone(false)} style={styles.adBtn}>
                <Text style={styles.adBtnText}>Leave</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : complete ? (
          <TouchableOpacity onPress={() => onDone(true)} style={[styles.adBtn, styles.adBtnPrimary]}>
            <Text style={styles.adBtnPrimaryText}>Reward earned · Close</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.adCountdown} accessibilityLiveRegion="polite">
            Reward in {seconds + (adCount - 1 - adIndex) * AD_RULES.FAKE_AD_SECONDS}s
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  adRoot: { flex: 1, backgroundColor: "#111", paddingHorizontal: 20, justifyContent: "space-between" },
  adTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  adTag: { backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  adTagText: { color: "#fff", fontSize: 12, fontWeight: "700" },
  adClose: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  adBody: { alignItems: "center", gap: 10 },
  adTitle: { color: "#fff", fontSize: 24, fontWeight: "800" },
  adSub: { color: "rgba(255,255,255,0.7)", fontSize: 14, textAlign: "center" },
  adCountdown: { color: "#fff", fontSize: 15, fontWeight: "600", textAlign: "center", height: 52, lineHeight: 52 },
  adConfirm: { gap: 12 },
  adConfirmText: { color: "#fff", fontSize: 15, textAlign: "center" },
  adConfirmRow: { gap: 10 },
  adBtn: { height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },
  adBtnPrimary: { backgroundColor: "#fff", borderColor: "#fff" },
  adBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  adBtnPrimaryText: { color: "#111", fontSize: 16, fontWeight: "700" },
});
