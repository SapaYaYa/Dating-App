import * as WebBrowser from "expo-web-browser";

// Where the legal documents will be published (drafts: docs/legal/). The
// pages must exist at these addresses before launch (docs/ADMIN_CHECKLIST.md).
export const LEGAL_URLS = {
  terms: "https://gentoodating.com/terms",
  privacy: "https://gentoodating.com/privacy",
  guidelines: "https://gentoodating.com/guidelines",
} as const;

/** Opens a legal page in an in-app browser. */
export function openLegal(page: keyof typeof LEGAL_URLS) {
  WebBrowser.openBrowserAsync(LEGAL_URLS[page]).catch(() => {});
}
