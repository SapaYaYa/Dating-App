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
- [ ] Track what the rule needs on the server: reply rate, conversations
      with 10+ messages and 4+ from each side, and each person's share of
      messages.
- [ ] Calculate the badge on the server using the rule in
      `artifacts/mobile/constants/greatChat.ts` (activity over 2 weeks,
      ratings over 30 days).
- [ ] Decide how to stop users jumping straight from Slow to reply to Great
      Chat by sending quick late replies (options: count only timely replies
      toward Great Chat, add a cooldown, or both).
- [ ] Send the "you've earned Great Chat" message based on the server's
      numbers.

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
