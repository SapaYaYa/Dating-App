# Admin checklist

Business and paperwork tasks to finish before launch, **in the order to do
them**. App and server work lives in `GO_LIVE_CHECKLIST.md` and
`SERVER_WORK_PLAN.md`; open questions live in `OPEN_ITEMS.md`.

The business: **For Happiness LLC** (Georgia, Fulton County), doing business
as **Gentoo Dating** ("Gentoo" for short).

Prices are approximate; confirm them when you pay.

## At a glance

| Step | What | Cost | Takes |
|---|---|---|---|
| 1 | Check the name, grab the domain, start the D-U-N-S number | Domain about $10–20 a year; rest free | A day (D-U-N-S: up to about 30 days to arrive) |
| 2 | Register the trade name and publish the notice | About $164–175 + about $40 | 2–3 weeks (notice runs 2 weeks) |
| 3 | Bank, email, mailing address, business license | Email $0–8 a month; PO box varies | A week |
| 4 | Apple and Google developer accounts, AdMob | Apple $99 a year; Google $25 once | Days, once the D-U-N-S arrives |
| 5 | Legal pages finished and published | DMCA agent $6 | A week |
| 6 | Legal checks before launch | Free | A few days |
| 7 | With your technical person: production accounts, store forms | Varies | Near launch |
| 8 | Ongoing safety routine | Free | From launch |
| — | Anytime: illustrator contract; optional trademark | Trademark $350 per class | — |

**Required costs before launch: roughly $350–400**, plus the email inbox,
mailing address and hosting.

## Step 1: Protect the name (this week)

Do these first: they're free or cheap, and they tell you whether to spend
money on the rest.

- [ ] Search **tmsearch.uspto.gov** for live GENTOO marks (dating and social
      services class 45; software classes 9 and 42). If someone holds GENTOO
      for dating or apps, stop and rethink before paying for anything else.
      The known one is the Gentoo Foundation's software mark (reg. 2966511).
- [ ] Register the **domain** gentoodating.com (about $10–20 a year), and
      grab the **social handles** for Gentoo Dating. Everything else (email,
      website, legal pages, the Apple account) uses the domain.
- [ ] **Request a free D-U-N-S number** for For Happiness LLC now: it can take
      up to about 30 days, and both the Apple and Google organization
      accounts need it (step 4). Apple's D-U-N-S lookup on its developer site
      is often faster than requesting from Dun & Bradstreet directly. The
      LLC's legal name and address must match exactly everywhere.

## Step 2: Register the business name (within 30 days of using it publicly)

Georgia requires this within 30 days of first using the name, so do it
before the website or store listings go public.

- [ ] **Register the trade name "Gentoo Dating"** for For Happiness LLC with
      the Fulton County Clerk of Superior Court, Recording Division
      (136 Pryor St. SW, Atlanta; (404) 613-5371). Filing fee about $164 to
      $175 (sources disagree; confirm with the clerk). The form is the
      "Application to Register a Business" (trade name).
- [ ] Register **"Gentoo"** on the same filing or right after, since the
      store listing and website use it on its own.
- [ ] **Publish the trade name notice** in Fulton County's legal newspaper,
      the Daily Report, once a week for two weeks (about $40, paid to the
      paper; (404) 521-1227). The clerk's office can tell you whether you or
      they send it to the paper.

## Step 3: Set up the business basics

- [ ] Add the trade names to the LLC's **bank account** (bring the filed
      trade name registration), so payments to "Gentoo Dating" are accepted.
- [ ] Set up the **help@gentoodating.com inbox** (needs the domain). The app,
      legal pages, report emails and deletion requests all use it.
- [ ] Get a **mailing address** for the policies and the copyright agent: a
      PO box or the LLC's registered agent address. Don't use a home
      address; it will be public.
- [ ] Check whether **Fulton County or your city** requires a general
      business license for an online business.

## Step 4: App store and ad accounts (once the D-U-N-S number arrives)

- [ ] **Apple Developer Program** as an organization in the LLC's name ($99 a
      year). Needs the D-U-N-S number, a website on the domain, and the
      authority to sign for the LLC. The seller name will show as For
      Happiness LLC.
- [ ] **Reserve the app name "Gentoo"** in App Store Connect right away. The
      app's permanent ID must be chosen first: it's pinned in `OPEN_ITEMS.md`
      (Brand) for you and your technical person.
- [ ] **Google Play developer account** as an organization ($25 once; also
      uses the D-U-N-S number).
- [ ] **AdMob account** in the LLC's name (see the Ads section of
      `GO_LIVE_CHECKLIST.md`).

## Step 5: Finish and publish the legal pages

All drafts are in `docs/legal/` and `docs/STORE_LISTING.md`.

- [x] **Terms of Service** drafted (`docs/legal/TERMS_OF_SERVICE.md`).
- [x] **Privacy Policy** drafted (`docs/legal/PRIVACY_POLICY.md`).
- [x] **Community Guidelines** drafted
      (`docs/legal/COMMUNITY_GUIDELINES.md`).
- [ ] **Register a DMCA copyright agent** with the U.S. Copyright Office ($6,
      renew every 3 years). Needs the mailing address (step 3). Put the
      agent's details in the Terms.
- [ ] **Fill in the [bracketed] placeholders** in the drafts: effective date,
      mailing address, final support email, DMCA agent. (The subscription
      cancellation instructions can wait; there's no subscription at
      launch. The data deletion page is set to
      gentoodating.com/delete-account.)
- [ ] **Publish the website pages** at the addresses the app links to:
  - gentoodating.com/terms, /privacy and /guidelines (set in
    `artifacts/mobile/constants/legal.ts`; change them there if the domain
    differs)
  - /help (`docs/legal/HELP_PAGE.md`): also the support web page both
    stores ask for
  - /delete-account (`docs/legal/DELETE_ACCOUNT_PAGE.md`), with a simple
    form (account email and an optional reason) that emails
    help@gentoodating.com. Give that address to Google Play. Handle each
    request by hand within 30 days: confirm it came from the account's
    owner, delete the account, and reply when done.
  - the home page line and About page ("Why a penguin?") from
    `docs/STORE_LISTING.md`

## Step 6: Legal checks before launch

- [ ] **Check whether Georgia's privacy bill (SB 111) became law** and, if
      so, what it requires (sources conflict). The draft Privacy Policy
      already gives every user access, correction, deletion and appeal
      rights.
- [ ] **State dating-safety laws:** check New Jersey's and New York's current
      wording against our in-app safety notice and the "no criminal
      background screenings" statement (built into sign-up and Profile >
      Privacy & Safety).
- [ ] **Re-check the state app store age laws** (Texas in force since the
      Fifth Circuit's May 2026 stay; Utah private lawsuits only; Louisiana
      and Alabama reportedly delayed to 2027). The app already blocks anyone
      the App Store or Google Play says is under 18.

## Step 7: With your technical person, near launch

- [ ] **Production accounts in the LLC's name:** Clerk (sign-in), database
      and server hosting, photo storage, and **Resend** (the report emails).
- [ ] App Store **age rating questionnaire** (dating apps are 18+), Apple's
      **privacy "nutrition labels"** and Google's **data safety form**.
      These describe what the finished app collects, including the ad SDK,
      so fill them in once the app is built.
- [ ] **Store listings:** descriptions are drafted in
      `docs/STORE_LISTING.md`; add screenshots from a phone build.

## Step 8: Safety routine (from launch, ongoing)

- [ ] **Review reports on time:** read the daily report email (8am Eastern)
      and the instant emails for serious reports. Serious reports
      (harassment, violence, inappropriate photos, anyone under 18, scams)
      within **24 hours**, everything else within **3 days**. Anyone
      reported by 3 different people is hidden from Discover until you mark
      their reports reviewed.
- [ ] Decide **who covers report review** when you're away.
- [ ] **Watch the state app store age laws** and re-check whenever a new one
      takes effect.

## Anytime

- [ ] **Illustrator contract** with full ownership of the art and source
      files transferred to For Happiness LLC (see `ILLUSTRATOR_BRIEF.md`).
      Ideally before the store screenshots and final icon.
- [ ] Optional: file a **USPTO trademark** for GENTOO DATING ourselves ($350
      per class; class 45 dating services, class 9 the app). Worth doing
      after the step 1 search comes back clear, and before marketing spend.

## Later (before the subscription launches)

- [ ] **Confirm which states give a 3-business-day right to cancel** a dating
      subscription (New York and Illinois confirmed; others reported in
      dating apps' terms include Arizona, California, Connecticut, Iowa,
      Minnesota, North Carolina, Ohio, Rhode Island and Wisconsin) and how
      we'll process those refunds. Then add the cancellation instructions to
      the Terms.
