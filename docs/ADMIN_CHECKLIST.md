# Admin checklist

Business and paperwork tasks to finish before launch: filings, accounts,
legal documents and contracts. App and server work lives in
`GO_LIVE_CHECKLIST.md`; open questions live in `OPEN_ITEMS.md`.

The business: **For Happiness LLC** (Georgia, Fulton County), doing business
as **Gentoo Dating** ("Gentoo" for short).

## Business name

- [ ] **Register the trade name "Gentoo Dating"** for For Happiness LLC with
      the Fulton County Clerk of Superior Court, Recording Division
      (136 Pryor St. SW, Atlanta; (404) 613-5371). Due within 30 days of
      first using the name. Filing fee about $164 to $175 (sources disagree;
      confirm with the clerk). The registration form is
      "Application to Register a Business" (trade name).
- [ ] **Publish the trade name notice** in Fulton County's legal newspaper,
      the Daily Report, once a week for two weeks (about $40, paid to the
      paper; (404) 521-1227).
- [ ] Also register **"Gentoo"** as a trade name if we use it on its own in
      public (store listing, website, marketing).
- [ ] Add the trade names to the LLC's **bank account** so payments to
      "Gentoo Dating" are accepted.
- [ ] Search **tmsearch.uspto.gov** for live GENTOO marks (dating and social
      services class 45; software classes 9 and 42).
- [ ] Optional: file a **USPTO trademark** for GENTOO DATING ourselves
      ($350 per class; class 45 dating services, class 9 the app).
- [ ] Check and register **domains** (e.g. gentoodating.com) and **social
      handles** for Gentoo Dating.
- [ ] Check whether **Fulton County or the city** you operate from requires
      a general business license for an online business.

## App stores and services

- [ ] Get a free **D-U-N-S number** for For Happiness LLC (needed for
      Apple's organization account, and Google's).
- [ ] **Apple Developer Program** as an organization in the LLC's name
      ($99 a year). Seller name will show as For Happiness LLC.
- [ ] **Reserve the app name "Gentoo"** in App Store Connect right away;
      subtitle along the lines of "Dating for real connection".
- [ ] **Google Play developer account** as an organization (one-time fee).
- [ ] **AdMob account** in the LLC's name (see the Ads section of
      `GO_LIVE_CHECKLIST.md`).
- [ ] Production accounts in the LLC's name: Clerk (sign-in), database and
      server hosting, photo storage.
- [ ] A **support email address** and a support web page (both stores ask
      for them). Help text is ready in `docs/legal/HELP_PAGE.md`; publish it
      at gentoodating.com/help and set up the help@gentoodating.com inbox.

## Legal documents

- [x] **Terms of Service** drafted (`docs/legal/TERMS_OF_SERVICE.md`).
- [x] **Privacy Policy** drafted (`docs/legal/PRIVACY_POLICY.md`).
- [x] **Community Guidelines** drafted
      (`docs/legal/COMMUNITY_GUIDELINES.md`).
- Drafts are in `docs/legal/` (Terms of Service, Privacy Policy, Community
  Guidelines). Before publishing, fill in the [bracketed] placeholders:
  effective date, mailing address, final support email, cancellation
  instructions. (The data deletion page is set to
  gentoodating.com/delete-account.)
- [ ] Publish all three at the addresses the app links to:
      gentoodating.com/terms, /privacy and /guidelines (set in
      `artifacts/mobile/constants/legal.ts`; change them there if the domain
      differs). Also link them in the store listings.
- [ ] **Mailing address** for the policies and the copyright agent (a PO box
      or the LLC's registered agent address works).
- [ ] **Register a DMCA copyright agent** with the U.S. Copyright Office
      ($6, renew every 3 years); put the agent's details in the Terms.
- [ ] **Web page for account deletion requests** (Google Play requires a
      web link as well as in-app deletion). Text is ready in
      `docs/legal/DELETE_ACCOUNT_PAGE.md`. Publish it at
      gentoodating.com/delete-account with a simple form (account email and
      an optional reason) that emails help@gentoodating.com, and give that
      address to Google Play. Handle each request by hand within 30 days:
      confirm it came from the account's owner, delete the account, and
      reply when done.
- [ ] **Confirm which states give a 3-business-day right to cancel** a
      dating subscription (New York and Illinois confirmed; others reported
      in dating apps' terms include Arizona, California, Connecticut, Iowa,
      Minnesota, North Carolina, Ohio, Rhode Island and Wisconsin) and how
      we'll process those refunds.
- [ ] **Check whether Georgia's privacy bill (SB 111) became law** and, if
      so, what it requires (sources conflict). The draft Privacy Policy
      already gives every user access, correction, deletion and appeal
      rights.
- [ ] **State dating-safety laws:** before launch, check New Jersey's and
      New York's current wording against our in-app safety notice and the
      "no criminal background screenings" statement (built into sign-up and
      Profile > Privacy & Safety).
- [ ] **Watch the state app store age laws** (Texas in force since the
      Fifth Circuit's May 2026 stay; Utah private lawsuits only; Louisiana
      and Alabama reportedly delayed to 2027). The app already blocks anyone
      the App Store or Google Play says is under 18; re-check before launch
      and whenever a new state law takes effect.
- [ ] App Store **age rating questionnaire** (dating apps are 18+/17+) and
      the **privacy "nutrition labels"** (Apple) and **data safety form**
      (Google).

## Contracts

- [ ] **Illustrator contract** with full ownership of the art and source
      files transferred to For Happiness LLC (see `ILLUSTRATOR_BRIEF.md`).
