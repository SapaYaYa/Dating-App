# Server work plan

Everything the server still has to do before Gentoo can launch with real
people, in the order to build it. Written November 2026, after all the
product decisions in `OPEN_ITEMS.md` were made.

Today the app runs mostly on sample data (`MOCK_*` in
`artifacts/mobile/constants/mockData.ts`). Only sign-in, the profile itself,
safety actions, daily pebble counts, ads, browsing another city, pause and
delete, notification settings and report review are on the server.

**How each step is built** (same as everything so far): add the endpoints to
`lib/api-spec/openapi.yaml` and run codegen; add tables in `lib/db/src/schema`;
write the routes in `artifacts/api-server/src/routes`; connect the app, keeping
sample data for the browser preview (demo mode); test against a real
database; add test items to `TESTING_CHECKLIST.md`; then add any new table to
account deletion (`routes/account.ts`).

## Already on the server

| Area | Endpoints |
|---|---|
| Profile (save, load, Discover list) | `GET/PUT /profiles/me`, `GET /profiles` |
| Pause and delete account | `PUT /profiles/me/pause`, `DELETE /profiles/me` |
| Report, block, unmatch | `POST /reports`, `POST /blocks`, `POST /unmatches` |
| Daily pebble count (5, or 6 at level 5, plus extras) | `GET /likes/allowance`, `POST /likes/spend` |
| Rewarded ads and their limits | `/ads/sessions…`, `/ads/admob-callback` |
| Browsing another city (weekly limit) | `GET/PUT /browse-city` |
| Notification settings | `GET/PUT /notification-settings` |
| Report review (auto-hide, daily and instant email) | `/admin/…` |

## The order

| Step | What | Why this order |
|---|---|---|
| 1 | Profile essentials: photo uploads, prompts, match note, home city, location | Nobody can see anyone's photos today, and pebbles can target answers |
| 2 | Discover from real profiles | People need to find each other before they can send pebbles |
| 3 | Pebbles | Liking is how matches start |
| 4 | Matches and chat | The core of the app; both badges depend on it |
| 5 | Badges: Slow to reply and Great Chat | Calculated from real chats |
| 6 | Challenges, levels and Priority | Most challenges check pebbles, chats and badges |
| 7 | Push notifications | Sent when matches, messages and pebbles happen |
| 8 | Safety follow-ups | Ban records, actions on reports, under-18 signals |
| 9 | Production setup and automated tests | Before real users |

Steps 1 to 4 are the minimum for two people to meet and talk. Steps 5 to 9
are needed before launch too.

---

## Step 1: Profile essentials

**Photo uploads**
- Upload photos to cloud storage and save their web addresses on the
  profile. Today photos are file paths on the person's own phone, which no
  one else can open.
- Resize and compress on upload; strip location data from photos.
- 3 to 8 photos (already enforced), in the order the person sets.
- Deleting a photo or the account deletes the files too.
- **Decide:** storage service (for example Cloudflare R2, Amazon S3 or
  Supabase Storage), and whether to scan photos automatically for nudity
  (Apple expects apps with user content to filter objectionable material;
  reports alone may not be enough).

**Prompts**
- Store the 3 prompt answers (question from the list in
  `constants/prompts.ts`, answer up to 150 characters); required when a
  profile is created, editable later.

**Match note**
- Store each person's match note (up to 150 characters). Only people they've
  matched with ever receive it; never in Discover.

**Profile limits**
- Bio up to 150 characters and up to 5 interests from the list in
  `constants/profileFields.ts` (the server allows longer bios and 20
  free-text interests today).

**Home city and location**
- Home city ("Lives in City, ST") with coordinates, set from the phone's
  location at sign-up, changeable once every 30 days.
- Current location (GPS, or a searched city or ZIP) and maximum distance
  (1 to 150 miles, default 25).
- **Decide:** a city search service that covers cities worldwide and returns
  coordinates (replaces the fixed US list).

**Done when:** a profile made on one phone shows the same photos, prompts,
bio, interests and home city on another phone, and none of it leaks the
exact location or the birthday.

## Step 2: Discover from real profiles

- Load Discover from `GET /profiles` instead of sample profiles.
- Apply every filter on the server (age, Show Me, distance and the rest).
  Today filters are saved but never change who appears.
- **Both distance limits:** two people only see each other when each is
  within the other's maximum distance.
- Browsing another city: show people there, with distances from that city;
  browsing people never appear in that city's Discover.
- Already hidden today: paused people, blocked and unmatched people (both
  ways), and anyone reported by 3 different people until reviewed.
- Return each card's rounded distance (shown in miles or kilometers by
  country) and badges.
- Page through results instead of sending everyone at once.
- Priority boost waits for step 6 (levels).

**Done when:** two test accounts in range see each other with the right
distance; out of range, filtered out, paused or blocked, they don't.

## Step 3: Pebbles

- Save each pebble with who sent it, to whom, what it was for (which photo
  or which prompt answer) and the optional note (up to 140 characters).
  Spending still goes through the daily count (`POST /likes/spend`).
- Pebbles tab: load the real people who sent you pebbles, with what they
  liked and their note.
- Giving a pebble back creates a match (step 4) and shows "It's a pair!"
  with the other person's match note.
- Pebbles can come from any distance (the distance limits apply to Discover
  only).
- Hide pebbles and notes from people you've blocked or unmatched, including
  ones sent before.
- Reporting a note sends it, with the reason, to report review, and hides it
  for the reporter on every device.
- Undo a pass (free from level 4, otherwise an ad) is already counted on the
  server; connect it to real profiles.

**Done when:** account A sends a pebble with a note on B's second photo; B
sees it in the Pebbles tab; B gives one back and both see "It's a pair!".

## Step 4: Matches and chat

- Store matches and messages (text first; voice messages are a separate
  decision).
- **Real-time:** new messages appear without refreshing. **Decide:**
  WebSockets on our own server, or a hosted service (for example Ably or
  Pusher); polling is a stopgap.
- Matches list with the latest message, unread counts and "New Matches".
- Record when each message was sent and read (both badges need reply times).
- Unmatch, block and report end the chat for both people and hide it;
  deleting an account removes their side as the Privacy Policy describes.
- Chat ratings (Great / Okay / Not great), saved on the server and never
  shown to the person rated.
- **Decide:** whether to filter messages automatically for scams and abuse
  at launch, or rely on reports.

**Done when:** two matched accounts chat in real time on two phones, unread
counts are right, and unmatching removes the chat for both.

## Step 5: Badges

Rules are already written in the app; the server calculates them from real
chats and returns each profile's badges.

- **Slow to reply** (`constants/replyBadge.ts`): unanswered means the other
  person's last message waited 3+ days with no reply; last 2 weeks; badge at
  5+ unanswered and over 60%, warning at 3. A late reply clears a match.
- **Great Chat** (`constants/greatChat.ts`): replies within 24 hours to at
  least 80% of matches who messaged, 3+ long conversations (10+ messages,
  4+ from each side), balanced share of messages, and at least 3 people
  rating it, 75%+ "Great". Activity over 2 weeks, ratings over 30 days.
- "Waiting on you" list from real data; Reply opens the chat, and the match
  clears only when a reply is actually sent.
- The warning and "you've earned it" messages come from the server's
  numbers.

## Step 6: Challenges, levels and Priority

Everything is specified in `CHALLENGES_PLAN.md`.

- Check each challenge automatically from real pebbles, messages, profile
  data and badges; award points and pebbles on the server; remove the "Mark
  Complete" button and the placeholder challenges.
- Daily challenges reset at local midnight, weekly ones Monday at local
  midnight.
- Levels change from 500 points each to 250 / 750 / 1,300 / 2,000 (level 5 is
  the top), in both the server (`lib/rewards.ts`) and the app.
- **Priority boost** in Discover: among people who fit the viewer's filters,
  level-5 people come a bit earlier, at most 1 in every 4 cards; the label
  stays private.

## Step 7: Push notifications

- Expo push notifications in a phone build; ask permission at a sensible
  moment (for example after the first match); save each phone's push token;
  remove it on sign-out and account deletion.
- Send: new match and new message right away; pebbles bundled at most once
  a day; Slow to reply reminder at most once a day, before the badge.
- Respect each person's switches (`notification_settings`, already stored)
  and quiet hours, 10pm to 8am in their time zone (hold until 8am).

## Step 8: Safety follow-ups

- **Actions on reports:** warn, suspend and ban (today a review only records
  "no action" or "action taken"), and a simple review page instead of the
  admin web addresses.
- **Ban records:** keep a minimal record of banned people (not their
  profile) so they can't rejoin, including after they delete their account.
- **Under-18 signals:** when the app store says someone is under 18, tell the
  server so an existing account is removed, not just blocked on that phone.
- Store proof of accepting the Terms (version and time) at sign-up.

## Step 9: Production setup and automated tests

- Production accounts in the LLC's name: Clerk (sign-in), database and
  server hosting, photo storage, Resend (report emails).
- Server settings: `CLERK_SECRET_KEY`, `DATABASE_URL`, `RESEND_API_KEY`,
  `REPORTS_DIGEST_TO`, `ADMIN_TOKEN`; never `ADS_TEST_MODE` in production.
- Run the database push for every table added above; set up backups.
- Error monitoring and logs.
- **Automated tests** for the server: so far every endpoint was tested with
  one-off scripts against a local database. Turn those into a test suite
  that runs on every change.

## Not part of launch

- Community boards (switched off; `BOARDS_ENABLED`), with board posts,
  comments and their reports.
- Events and the Event Goer challenge.
- The subscription.
- Photo verification (switched off; `PHOTO_VERIFICATION_ENABLED`).

## Decisions still to make along the way

| Step | Decision |
|---|---|
| 1 | Photo storage service; automatic nudity scanning or not |
| 1 | City search service |
| 4 | Real-time messaging: own WebSockets or a hosted service |
| 4 | Voice messages at launch or later |
| 4 | Automatic message filtering or reports only |
| 9 | Hosting for the server and database |
