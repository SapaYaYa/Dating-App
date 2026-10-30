// Community board rules. Any signed-in user can create boards; there is no
// verification step.
export const BOARD_RULES = {
  NAME_MAX: 40,
  DESCRIPTION_MAX: 150,
  POST_MAX: 500,
  COMMENT_MAX: 300,
  /** Boards one person can have created at a time. */
  MAX_CREATED_PER_USER: 3,
  /** An owner can delete their board only while it has fewer members than this. */
  OWNER_DELETE_MAX_MEMBERS: 10,
} as const;

export const BOARD_CATEGORIES = [
  "Lifestyle",
  "Food",
  "Outdoors",
  "Travel",
  "Music",
  "Culture",
  "Sports",
  "Games",
  "Social",
  "Other",
] as const;

export const BOARD_ICONS = ["☕", "🏔️", "🍜", "🌙", "📚", "🎵", "🎨", "⚽", "🎮", "🐶", "🎬", "🌱", "✈️", "🍷", "🧘", "💻"];

// Words that don't change what a board is about, so "The Hiking Club" and
// "Hiking" count as the same board.
const FILLER_WORDS = new Set([
  "the", "a", "an", "and", "of", "for", "club", "clubs", "group", "groups", "lovers",
  "lover", "fans", "fan", "crew", "society", "community", "people",
]);

function stem(word: string): string {
  for (const suffix of ["ings", "ing", "ers", "er", "s"]) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
      return word.slice(0, -suffix.length);
    }
  }
  return word;
}

/** Tidies a board name for comparison: "The Sunday Hikers!" -> "sunday hik". */
export function normalizeBoardName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !FILLER_WORDS.has(w))
    .map(stem)
    .join(" ");
}

function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

/**
 * Compares a new board name with existing boards. `exact` is a board with the
 * same name once tidied (creating is blocked); `similar` are close names that
 * are only suggested ("Join it instead?").
 */
export function findSimilarBoards<T extends { title: string }>(
  name: string,
  boards: T[],
): { exact: T | null; similar: T[] } {
  const wanted = normalizeBoardName(name);
  if (wanted.length < 3) return { exact: null, similar: [] };

  let exact: T | null = null;
  const similar: T[] = [];
  for (const board of boards) {
    const existing = normalizeBoardName(board.title);
    if (!existing) continue;
    if (existing === wanted) {
      exact = exact ?? board;
    } else if (
      (existing.length >= 3 && (existing.includes(wanted) || wanted.includes(existing))) ||
      (Math.min(existing.length, wanted.length) >= 5 && editDistance(existing, wanted) <= 2)
    ) {
      similar.push(board);
    }
  }
  return { exact, similar: similar.slice(0, 3) };
}
