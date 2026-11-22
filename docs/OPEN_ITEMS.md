# Open items

Everything still to hash out, from the full review in November 2026. We work
through these one at a time; check an item off when it's decided (and note
the decision), and move build work to `GO_LIVE_CHECKLIST.md` once it's
agreed.

## 1. Decisions that block launch

- [x] **Name (decided):** the brand is **Gentoo Dating**, "Gentoo" for
      short, run by **For Happiness LLC** under a DBA. No lawyer. Our own
      search found no dating app named Gentoo; the Gentoo Foundation's US
      software trademark (GENTOO, reg. 2966511) is the known risk.
  - [ ] Register the DBA "Gentoo Dating" (and "Gentoo" if used publicly) for
        For Happiness LLC in its state, plus county if required.
  - [ ] Optional: file a USPTO trademark for GENTOO DATING ourselves
        ($350 per class; dating services class 45, app class 9).
  - [ ] Search the USPTO database (tmsearch.uspto.gov) for live GENTOO marks.
  - [ ] Check domains and social handles for Gentoo Dating.
  - [ ] Apple and Google developer accounts in the LLC's name (Apple needs a
        D-U-N-S number for an organization account).
  - [ ] Add the DBA to the LLC's bank account.
  - [x] State online-dating safety laws: decided **no criminal background
        checks**; the statement and 8 safety tips are built into sign-up
        (step 7, must be acknowledged) and Profile > Privacy & Safety.
  - Paperwork items (trade name filing, accounts, legal documents) now live
    in `ADMIN_CHECKLIST.md`.
- [ ] **Legal and safety basics:**
  - [x] Terms of Service, Privacy Policy and Community Guidelines drafted
        in `docs/legal/` (no lawyer, by choice).
  - [x] Disputes (decided): **courts, no arbitration.** Georgia law,
        Fulton County courts, small claims allowed, 60-day talk-first
        period. Revisit with a lawyer once there's real revenue (e.g. when
        the subscription launches); adding arbitration later needs users to
        accept the updated Terms.
  - [x] Sign-up: "I agree to the Terms of Service and Privacy Policy"
        checkbox built (last step, required to create an account); the
        documents are also linked under Profile > Privacy & Safety.
  - [x] Delete account from inside the app (Apple requires it): built under
        Profile > Pause or delete account, with a pause option and an
        optional "Why are you leaving?" question. Web deletion page text is
        in `docs/legal/DELETE_ACCOUNT_PAGE.md` (a form that emails us; we
        delete by hand within 30 days).
  - [x] "Privacy & Safety" on Profile now shows the safety tips and how to
        report and block.
  - [x] "Help & Support" (decided: option C): an in-app help screen with
        13 common questions and a Contact us email button, plus the same
        text for gentoodating.com/help (`docs/legal/HELP_PAGE.md`), which
        doubles as the stores' support URL.
  - [x] Age (decided: option B): the birthday check at sign-up, plus the
        App Store's and Google Play's age signals (`expo-age-range`). If the
        store says someone is under 18, the app shows an adults-only screen
        instead. No answer from the store falls back to the birthday. Needs
        a real phone to test.
  - [x] Report review (decided): a daily email of open reports to you;
        serious reports reviewed within 24 hours, the rest within 3 days;
        anyone reported by 3 different people is hidden from Discover until
        reviewed. Still open: warn, suspend and ban actions, and a review
        page (today you mark reports reviewed with an admin address).
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
