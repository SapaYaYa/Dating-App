# Open items

Everything still to hash out, from the full review in November 2026. We work
through these one at a time; check an item off when it's decided (and note
the decision), and move build work to `GO_LIVE_CHECKLIST.md` once it's
agreed.

## 1. Decisions that block launch

- [ ] **Name:** have a trademark lawyer clear "Gentoo" for a dating app (the
      Gentoo Linux project holds a US software trademark). Check domains and
      social handles for Gentoo too.
- [ ] **Legal and safety basics:**
  - [ ] Terms of Service, Privacy Policy and Community Guidelines.
  - [ ] Delete account from inside the app (Apple requires it).
  - [ ] Decide what "Privacy & Safety" and "Help & Support" on Profile do
        (both do nothing today).
  - [ ] Age: is typing a birthday (18+) enough, or do we verify age?
  - [ ] Who reviews reports, how fast, and what happens to the reported
        person.
  - [ ] Real photo verification ("Get Verified" approves everyone today).
- [ ] **Challenges:** they're the only way to earn points (levels, free undo,
      6th pebble, Priority, extra pebbles) but they're placeholders with a
      "Mark Complete" button. Decide the real list, the points and pebbles
      each gives, and how often they repeat. Fix the misfits: "Ice Breaker"
      (ice-breakers were removed), "Super Connector" (5 matches a week clashes
      with "serious"), "Event Goer" (depends on events, never discussed).
- [ ] **Free vs. paid:** the subscription's price and perks (no ads? more
      pebbles? free undo?), decided before launch.

## 2. Product questions

- [ ] Level 3 name: keep "Huddle" or change it to "Pair"?
- [ ] What "Priority" (level 5) actually does: just a badge, or shown to
      more people?
- [ ] Community boards and events: do they launch? (Events were never
      discussed.)
- [ ] Push notifications: which ones (new pebble, match, message, Slow to
      reply warning, badge earned)? The switch does nothing today.
- [ ] Time zone loophole for the daily reset: ignore or close?
- [ ] Onboarding: should Gus welcome new users and explain pebbles?

## 3. Server work (in this order)

- [ ] Store pebbles (what they were for, the note) and load the Pebbles tab.
- [ ] Matches and chat, with real-time messages.
- [ ] Discover from real profiles, every filter and both distance limits on
      the server.
- [ ] Prompts and match notes.
- [ ] Photo uploads (photos are only on the person's phone today).
- [ ] Real challenges, Slow to reply, Great Chat, community boards.

## 4. Ads

- [ ] AdMob account, the SDK in a phone build, the Europe consent screen,
      and the server's "ad finished" address set in AdMob.
- [ ] Make sure the ad test mode is never on in production.

## 5. Brand

- [ ] Hire the illustrator with `ILLUSTRATOR_BRIEF.md`; full ownership of
      the art. Meanwhile, refine the app icon and logo.
- [ ] Change the app's internal ID from "mobile" to Gentoo before the first
      store build.
- [ ] App Store and Google Play listings, screenshots and descriptions.
- [ ] Confirm or change the tagline "Find your pebble."

## 6. Housekeeping

- [ ] Test on a real iPhone and Android phone (only the browser preview so
      far).
- [ ] Review and merge PR #1 into main.
- [ ] Add automated tests (server tests so far were one-off scripts).
- [ ] Production setup: Clerk keys, database, API address.
- [ ] Small leftovers: the preview's daily pebbles never reset; music is on
      hold; Instagram is dropped.
