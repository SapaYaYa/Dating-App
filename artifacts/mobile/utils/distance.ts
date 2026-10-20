/**
 * Formats a distance value into an approximate, privacy-safe display string.
 * Accepts either:
 *   - a pre-rounded integer from the server (kilometres) → formatDistance(5)
 *   - a legacy raw string for backwards compat     → formatDistance("1.2 km away")
 *
 * Always rounds to the nearest whole unit so sub-unit precision is never shown.
 *
 * Examples (numeric):
 *   5   → "~5 km away"
 *   0   → "< 1 km away"
 *
 * Examples (string, legacy):
 *   "1.2 km away"  → "~1 km away"
 *   "0.4 mi away"  → "< 1 mi away"
 *   "3 mi away"    → "~3 mi away"
 *   "12.7 km"      → "~13 km away"
 */
export function formatDistance(raw: string | number, unit: "km" | "mi" = "km"): string {
  if (raw === null || raw === undefined || raw === "") return "";

  if (typeof raw === "number") {
    if (!isFinite(raw) || raw < 1) {
      return `< 1 ${unit} away`;
    }
    return `~${Math.round(raw)} ${unit} away`;
  }

  const detectedUnit = raw.includes("km") ? "km" : "mi";
  const match = raw.match(/[\d.]+/);
  if (!match) return raw;

  const value = parseFloat(match[0]);
  if (isNaN(value)) return raw;

  if (value < 1) {
    return `< 1 ${detectedUnit} away`;
  }

  const rounded = Math.round(value);
  return `~${rounded} ${detectedUnit} away`;
}
