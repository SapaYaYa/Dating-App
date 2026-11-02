// Profile prompts: everyone answers 3 at sign-up. People like a specific
// answer (or photo) in Discover, with an optional note.
export const PROMPT_RULES = {
  COUNT: 3,
  ANSWER_MAX: 150,
} as const;

export const LIKE_NOTE_MAX = 140;

export interface PromptAnswer {
  question: string;
  answer: string;
}

export const PROMPT_LIST = [
  "My ideal Sunday is...",
  "I'm known for...",
  "A perfect first date...",
  "The way to win me over is...",
  "A typical Friday night...",
  "I geek out on...",
  "A green flag I look for...",
  "Two truths and a lie...",
  "The best trip I've taken...",
  "My simple pleasures...",
  "I'm looking for...",
  "My unpopular opinion...",
  "Together, we could...",
  "I'll know it's a match if...",
  "My love language is...",
  "Dating me is like...",
  "My go-to karaoke song...",
  "Let's debate this topic...",
  "The last thing that made me laugh out loud...",
  "A random fact I love...",
];

/** What a like was for: one photo or one prompt answer. */
export type LikeTarget = { kind: "photo"; index: number } | { kind: "prompt"; index: number };

/** All 3 prompts chosen and answered. */
export function promptsComplete(prompts: PromptAnswer[] | undefined): boolean {
  return (
    (prompts ?? []).filter((p) => p.question && p.answer.trim().length > 0).length >=
    PROMPT_RULES.COUNT
  );
}
