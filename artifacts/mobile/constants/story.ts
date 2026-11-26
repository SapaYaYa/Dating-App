// Why Gentoo is called Gentoo, and why a penguin. The same text is used in
// the welcome, the "Why Gentoo?" screen, Help & Support, the help web page
// and the store listings (docs/STORE_LISTING.md); change them together.

export const STORY_TITLE = "Why a penguin?";

export const STORY_PARAGRAPHS = [
  "When a gentoo penguin finds the one, it searches the beach for the perfect pebble and offers it as a gift.",
  "If the pebble is accepted, the two build a nest together, and many pairs stay together season after season.",
  "On Gentoo, you give pebbles too, a few a day, to people you're truly interested in.",
] as const;

/** All of it in one paragraph (Help & Support, the help web page). */
export const STORY_TEXT = STORY_PARAGRAPHS.join(" ");

/** For store listings and other small spaces. */
export const STORY_ONE_LINER =
  "Named after the gentoo penguin, which courts its partner with the perfect pebble.";
