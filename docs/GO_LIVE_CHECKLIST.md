# Go-live checklist

Everything that has to happen before Spark goes live with real users.
Check items off as they're done.

## Database and deploy

- [ ] Run `pnpm --filter @workspace/db run push` to create the new `blocks`
      and `unmatches` tables before deploying the API server.
- [ ] Test the new endpoints against a real database: `POST /blocks`,
      `POST /unmatches`, reporting (which also blocks), and the discovery list
      hiding blocked and unmatched people in both directions. These were
      only tested without a database.
- [ ] Make sure production builds never set `EXPO_PUBLIC_DEMO_MODE`. It skips
      sign-in and is only for browser previews.

## Replace sample data with real data

These screens still run on sample data (`MOCK_*` in
`artifacts/mobile/constants/mockData.ts`):

- [ ] **Discover:** load real profiles from `GET /profiles` instead of
      sample profiles.
- [ ] **Matches and chat:** store matches and messages on the server, and
      load them in the app. Both badges depend on this.
- [ ] **Likes:** load real likes.
- [ ] **Community and challenges:** decide whether these launch, and wire
      them to real data if so.
- [ ] **Photos:** add a photo upload service. Photos are currently saved as
      file paths on the user's phone, which no one else can open.

## Discover distance

- [ ] Load Discover from `GET /profiles` and apply every filter on the server
      (distance, age, Show Me and the rest). Today filters are saved but
      never change who appears.
- [ ] Save each user's location and maximum distance on the server: GPS
      ("Use My Location") or a searched city/ZIP.
- [ ] Only show two people to each other when both distance limits are met:
      each is within the other's maximum distance.
- [ ] Maximum distance is 1 to 150 miles, default 25 miles. The top of the
      range is a real limit, never "Anywhere".
- [ ] Show distances in miles or kilometers based on the user's country
      (150 miles is about 240 km, 25 miles about 40 km). The server
      calculates in kilometers today; convert for display.
- [ ] Replace the sample "2 mi away" text with each card's real rounded
      distance from the server.
- [ ] Board boost only reorders people already within both distance limits;
      it never adds anyone from farther away.

## Home city and browsing another city

- [ ] Store each user's home city ("Lives in ..."): set from their phone's
      location at sign-up, changeable in profile settings at most once a
      month. Store the city's coordinates, not just its name.
- [ ] Show "Lives in City, ST" on Discover cards, full profiles and in Likes.
      City and state only, never a neighborhood or exact location.
- [ ] Browsing city: users can pick another city in Discover filters at most
      once a week. Switching back to "Use My Location" is always allowed.
- [ ] While browsing another city, Discover shows people there, with
      distances measured from that city.
- [ ] Browsing users never appear in the other city's Discover. Their likes
      still reach the person they liked and show up in that person's Likes,
      mixed in with local likes (no separate section).
- [ ] "Both distance limits met" applies to Discover only. Likes can come
      from any distance.
- [ ] Replace the fixed US city and ZIP lists with a real city search that
      covers cities worldwide and returns coordinates.

## Slow to reply badge

- [ ] Track unanswered matches on the server: the other person's last
      message is 3+ days old with no reply, and no unmatch, block or report.
- [ ] Calculate the badge on the server using the rule in
      `artifacts/mobile/constants/replyBadge.ts` (last 2 weeks, 5+ unanswered
      and over 60%, warning at 3).
- [ ] Return each profile's badges from the API, and show those in the app
      instead of the sample badges.
- [ ] Send the warning and "you've earned the badge" messages based on the
      server's numbers (and decide whether they should also be push
      notifications).
- [ ] "Waiting on you" list: **Reply** should open the chat, and the match
      should clear once a reply is actually sent. In the sample version it
      clears instantly.

## Great Chat badge

- [ ] Store chat ratings (Great / Okay / Not great) on the server. They're
      currently saved only on the phone. Individual ratings must never be
      shown to the person who was rated.
- [ ] Track what the rule needs on the server: timely reply rate, conversations
      with 10+ messages and 4+ from each side, and each person's share of
      messages.
- [ ] Calculate the badge on the server using the rule in
      `artifacts/mobile/constants/greatChat.ts` (activity over 2 weeks,
      ratings over 30 days).
- [ ] Record when each reply is sent, so the server can tell timely replies
      (within 24 hours) from late ones. Only timely replies count toward
      Great Chat's reply rate; late replies still clear Slow to reply.
- [ ] Send the "you've earned Great Chat" message based on the server's
      numbers.

## Community boards

- [ ] Store boards, memberships, posts and comments on the server. They're
      sample data saved on the phone, so boards someone creates are visible
      only to them.
- [ ] Enforce the board rules on the server too (`artifacts/mobile/constants/boards.ts`):
      name and description limits, 3 boards per person, the duplicate-name
      check, and owners deleting only boards with fewer than 10 members.
- [ ] Send board and post reports to your team for review. Today a report
      only hides the board or post on the reporter's phone.
- [ ] Compute "Both in ..." tags and the Discover boost on the server,
      respecting each person's "Show my boards on Discover" setting.
- [ ] Hide blocked and unmatched people in boards on the server, not just
      on the phone.

## Quality

- [ ] Add automated tests. The project has none; at minimum cover the two
      badge rules and the API routes.
- [ ] Fix the type error in `artifacts/mockup-sandbox`
      that makes the workspace-wide `pnpm run typecheck` fail.
- [ ] Test the app on real iOS and Android devices, not only the browser
      preview.

## Release

- [ ] Review and merge pull request #1 into `main`.
- [ ] Set production environment variables: Clerk keys, `DATABASE_URL`,
      and the API domain.
