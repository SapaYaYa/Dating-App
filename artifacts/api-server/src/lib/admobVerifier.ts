import { verify } from "node:crypto";

// Checks AdMob's server-side verification (SSV) callbacks. AdMob signs the
// query string with one of Google's published keys; the signature and key_id
// are always the last two parameters, and everything before "&signature="
// is what was signed.
// https://developers.google.com/admob/android/ssv

const KEYS_URL =
  process.env.ADMOB_VERIFIER_KEYS_URL ?? "https://www.gstatic.com/admob/reward/verifier-keys.json";
const CACHE_MS = 24 * 60 * 60 * 1000;
const MIN_REFETCH_MS = 60 * 1000;

let cache: { keys: Map<string, string>; fetchedAt: number } | null = null;

async function loadKeys(force: boolean): Promise<Map<string, string>> {
  const now = Date.now();
  if (cache && !force && now - cache.fetchedAt < CACHE_MS) return cache.keys;
  // An unknown key_id may mean Google rotated keys; refetch, but not more
  // than once a minute however many bad callbacks arrive.
  if (cache && force && now - cache.fetchedAt < MIN_REFETCH_MS) return cache.keys;

  const res = await fetch(KEYS_URL);
  if (!res.ok) throw new Error(`AdMob verifier keys: HTTP ${res.status}`);
  const body = (await res.json()) as { keys?: { keyId?: number | string; pem?: string }[] };
  const keys = new Map<string, string>();
  for (const k of body.keys ?? []) {
    if (k.keyId !== undefined && typeof k.pem === "string") keys.set(String(k.keyId), k.pem);
  }
  cache = { keys, fetchedAt: now };
  return keys;
}

/** The callback's parameters if its signature is valid, otherwise null. */
export async function verifyAdMobCallback(rawQuery: string): Promise<URLSearchParams | null> {
  const cut = rawQuery.indexOf("&signature=");
  if (cut < 0) return null;
  const signed = rawQuery.slice(0, cut);
  const params = new URLSearchParams(rawQuery);
  const signature = params.get("signature");
  const keyId = params.get("key_id");
  if (!signature || !keyId) return null;

  const pem = (await loadKeys(false)).get(keyId) ?? (await loadKeys(true)).get(keyId);
  if (!pem) return null;

  // Web-safe base64 of a DER-encoded ECDSA signature.
  const sig = Buffer.from(signature.replace(/-/g, "+").replace(/_/g, "/"), "base64");
  try {
    return verify("sha256", Buffer.from(signed), { key: pem, dsaEncoding: "der" }, sig) ? params : null;
  } catch {
    return null;
  }
}
