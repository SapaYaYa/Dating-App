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
        reviewed. Serious reports (now including Underage, and Scam or asking
        for money) are also emailed instantly. Still open: warn, suspend and
        ban actions, and a review page (today you mark reports reviewed with
        an admin address).
  - [x] Photo verification (decided: option C): turned off for launch, so
        no Verified badge, Get Verified card or "Verified only" filter
        (`PHOTO_VERIFICATION_ENABLED` in `constants/verification.ts`).
        Later, once there's revenue: an automatic face match (Amazon
        Rekognition, AWS Face Liveness or Persona), after researching the
        biometric privacy laws (Illinois, Texas, Washington) and costs.
- [x] **Challenges (decided):** the full plan is in `CHALLENGES_PLAN.md`:
      4 daily, 3 weekly (reset Monday) and 6 one-time challenges, all
      checked automatically; levels at 250 / 750 / 1,300 / 2,000 points, so
      Priority takes an active user about 3 months. Building it needs
      pebbles and chat on the server first.
  - [ ] Later: **Event Goer** challenge, once community events exist.
- [x] **Free vs. paid (decided):** launch **free with ads**; add a
      subscription a few months after launch, designed using real usage.
  - [ ] Later: the subscription's price and perks. Ideas so far: no ads, a
        few more pebbles a day, free undo at any level, see who sent you
        pebbles first, browse another city more often. Never sell levels or
        Priority (that would undercut challenges).

## 2. Product questions

- [x] Level 3 name (decided): keep **"Huddle"**. "Pair" would clash with
      the "It's a pair!" match pop-up.
- [x] Priority (level 5) (decided): **shown to more people.** Among people
      whose filters they fit, Priority profiles come up a bit earlier in
      Discover, capped at 1 in 4 cards; never shown to anyone outside
      their filters. The label stays private (only they see it). Not
      buildable until Discover uses the server's real profiles.
- [x] Community boards and events (decided): **launch without boards.**
      Add them once enough people use Gentoo in a city. Events come later
      still (with the Event Goer challenge).
- [x] Push notifications (decided):
  - New match and new message: on, sent right away.
  - New pebbles: on, bundled at most once a day ("3 people sent you
    pebbles").
  - Slow to reply warning: on, at most once a day, before the badge would
    appear.
  - Badge or level earned, and daily pebbles refreshed: no notification
    (shown in the app).
  - Quiet hours 10pm to 8am in the person's time zone; anything due then
    waits until 8am.
  - Settings: one switch per type instead of the single Notifications
    switch.
  - Sending needs the server (matches and chat on the server first) and a
    phone build with Expo push notifications.
- [ ] Time zone loophole for the daily reset: ignore or close?
- [ ] Onboarding: should Gus welcome new users and explain pebbles?

## 3. Server work (in this order)

- [ ] Store pebbles (what they were for, the note) and load the Pebbles tab.
- [ ] Matches and chat, with real-time messages.
- [ ] Discover from real profiles, every filter and both distance limits on
      the server.
- [ ] Prompts and match notes.
- [ ] Photo uploads (photos are only on the person's phone today).
- [ ] Real challenges (`CHALLENGES_PLAN.md`), Slow to reply, Great Chat,
      community boards.

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
