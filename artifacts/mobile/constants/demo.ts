// Set EXPO_PUBLIC_DEMO_MODE=1 at build time to skip Clerk and sign in as a
// sample user. Used for browser previews where no Clerk key or API is available.
export const DEMO_MODE = process.env.EXPO_PUBLIC_DEMO_MODE === "1";
