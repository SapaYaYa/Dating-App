import { Redirect, Stack } from "expo-router";

import { DEMO_MODE } from "@/constants/demo";

export default function AuthLayout() {
  if (DEMO_MODE) return <Redirect href="/" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
