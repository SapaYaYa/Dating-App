import { requestAgeRangeAsync } from "expo-age-range";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { AgeBlocked } from "@/components/AgeBlocked";
import { DEMO_MODE } from "@/constants/demo";
import { useColors } from "@/hooks/useColors";
import { ADULT_AGE, type AgeVerdict, ageVerdict } from "@/utils/ageSignal";

/** Give up waiting for the store after this long and fall back to the birthday check. */
const TIMEOUT_MS = 10_000;

async function checkStoreAge(): Promise<AgeVerdict> {
  const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS));
  try {
    const range = await Promise.race([requestAgeRangeAsync({ threshold1: ADULT_AGE }), timeout]);
    return ageVerdict(range);
  } catch {
    // Declined to share, not available in their region or OS, or an error.
    return "unknown";
  }
}

/**
 * Asks the phone's app store (Apple or Google) for the person's age range
 * when the app opens. Under 18: shows the adults-only screen instead of the
 * app. 18+ or no answer: the app opens and the sign-up birthday check applies.
 * Skipped in the browser and the demo preview.
 */
export function AgeGate({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  const skip = Platform.OS === "web" || DEMO_MODE;
  const [verdict, setVerdict] = useState<AgeVerdict | "checking">(skip ? "unknown" : "checking");

  useEffect(() => {
    if (skip) return;
    let active = true;
    checkStoreAge().then((v) => {
      if (active) setVerdict(v);
    });
    return () => {
      active = false;
    };
  }, [skip]);

  if (verdict === "checking") {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator />
      </View>
    );
  }
  if (verdict === "minor") return <AgeBlocked />;
  return <>{children}</>;
}
