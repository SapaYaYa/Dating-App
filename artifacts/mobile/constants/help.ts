import { AD_RULES, REWARD_RULES } from "@/constants/ads";
import { BOARDS_ENABLED } from "@/constants/features";
import { LOCATION_RULE } from "@/constants/location";
import { SLOW_REPLY_RULE } from "@/constants/replyBadge";

// Help & Support answers. The same text is on the website's help page
// (docs/legal/HELP_PAGE.md); change both together.

export const SUPPORT_EMAIL = "help@gentoodating.com"; // placeholder until the domain is live

export interface HelpTopic {
  question: string;
  answer: string;
}

export interface HelpSection {
  title: string;
  topics: HelpTopic[];
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    title: "Pebbles and matches",
    topics: [
      {
        question: "What's a pebble?",
        answer:
          "A pebble is how you like someone on Gentoo, like a gentoo penguin giving a pebble to the one it likes. Tap the pebble on any photo or answer in someone's profile, and add a note if you want.",
      },
      {
        question: "How many pebbles do I get?",
        answer: `You get 5 pebbles a day (6 at level 5). They reset at midnight. Need more? Watch a short ad for ${AD_RULES.EXTRA_LIKES_PER_AD} more (up to ${REWARD_RULES.extraLikes.limit} times a day), or complete a challenge.`,
      },
      {
        question: "How do I get a match?",
        answer:
          "When someone gives you a pebble, they show up in the Pebbles tab. Give a pebble back and it's a pair: you match and can start chatting in Matches.",
      },
      {
        question: "Can I undo a pass?",
        answer: `Yes, tap undo right after passing. It takes a short ad, or it's free from level ${AD_RULES.FREE_UNDO_LEVEL}.`,
      },
    ],
  },
  {
    title: "Your profile",
    topics: [
      {
        question: "How do I change my profile?",
        answer:
          "Go to Profile. Add or remove photos (3 to 8), edit your prompts, and tap Edit Profile for your bio and interests.",
      },
      {
        question: "Can I change my home city?",
        answer: `Yes, under Profile > Home city, once every ${LOCATION_RULE.HOME_CITY_CHANGE_DAYS} days. To look around another city without moving, use the filters on Discover.`,
      },
      {
        question: 'What do "Slow to reply" and "Great Chat" mean?',
        answer: `They're badges others can see. "Slow to reply" shows when you leave a lot of matches waiting more than ${SLOW_REPLY_RULE.UNANSWERED_AFTER_DAYS} days for an answer; replying clears it. "Great Chat" is earned by replying quickly, having real conversations and getting great ratings from your matches.`,
      },
    ],
  },
  {
    title: "Levels, points and challenges",
    topics: [
      {
        question: "How do levels work?",
        answer:
          "Complete challenges to earn points. Points raise your level, from Pebble up to Legend, and higher levels unlock perks like free undo, an extra daily pebble and a Priority badge. See the Challenges tab.",
      },
    ],
  },
  {
    title: "Safety",
    topics: [
      {
        question: "How do I report or block someone?",
        answer:
          "In a chat, tap the menu (•••). You can also report from someone's profile or from a pebble note. Reporting also blocks them, so you won't see each other again.",
      },
      {
        question: "Does Gentoo do background checks?",
        answer:
          "No. Gentoo does not conduct criminal background screenings of its members. Read our safety tips under Profile > Privacy & Safety. If you're ever in danger, call 911.",
      },
    ],
  },
  {
    title: "Your account",
    topics: [
      {
        question: "How do I take a break?",
        answer:
          "Go to Profile > Pause or delete account and tap Pause my account. New people won't see you, your matches and chats stay, and you can unpause anytime.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Go to Profile > Pause or delete account and tap Delete my account. Can't get into the app? Visit gentoodating.com/delete-account. Deleting doesn't cancel a subscription; cancel that in your App Store or Google Play settings.",
      },
      {
        question: "Why do I see ads?",
        answer:
          `Ads keep Gentoo free. You'll see an occasional sponsored card on Discover${BOARDS_ENABLED ? " and sponsored posts in boards" : ""}, and you can choose to watch short ads for rewards like extra pebbles.`,
      },
    ],
  },
];
