# Testing checklist

Everything to test in Spark, kept up to date as features are added or
changed. Check items off as you test them, and un-check them when the feature
changes.

- **Part 1** can be tested now, before the server is connected: in the
  browser preview (demo mode, sample data) or on a phone with Expo Go.
- **Part 2** needs the server and a database.
- **Part 3** is for every release.

**Tips:** the preview remembers what you do in your browser. Open it in a
private/incognito window to start fresh. To test kilometers, set your phone
(or browser) region to a country like France or Canada.

---

## Part 1: Without the server (sample data)

### Sign-up and sign-in (real app only, needs your Clerk key; not in the preview)
- [ ] Register: name (max 50 characters), birthday, gender, Show Me, email,
      password, bio, photos.
- [ ] Under 18 can't continue; exactly 18 today can.
- [ ] Photos: at least 1 required at sign-up, max 3.
- [ ] Email verification code: correct code, wrong code, resend.
- [ ] Sign in with email and password; wrong password message.
- [ ] Second-factor email code at sign-in, if prompted.
- [ ] Reset password flow.
- [ ] Sign out returns to the login screen.

### Discover
- [ ] Cards show name, age, occupation, distance, "Lives in City, ST",
      interests and a profile question.
- [ ] Like and pass buttons sit fully above the tab bar, on small and large
      screens; the card never covers the Spark header.
- [ ] Swipe right/left and the buttons do the same thing.
- [ ] Likes counter goes down with each like; at 0, the like button is
      disabled and the "Out of likes" bar appears.
- [ ] "It's a Match!" pop-up appears on a match; Send Message and Keep
      Swiping both work.
- [ ] Rewind appears at level 4+ and brings back the last passed card.
- [ ] Info button opens the full profile, including for people from another
      city.
- [ ] Blocked and unmatched people never appear.

### Discover filters and distance
- [ ] Maximum distance runs 1-150 mi, default 25 mi. 150 shows "150 mi",
      never "Anywhere".
- [ ] With a kilometer region: 1-240 km, default 40 km; cards say "~3 km away".
- [ ] Lowering the distance hides people farther away; raising it brings
      them back.
- [ ] Age, interests and "verified only" filters hide people who don't match.
- [ ] Nobody left in range: "No one new within 25 mi" with Expand distance,
      which opens the filters.
- [ ] At the maximum distance, it says "Check back soon" with no button.
- [ ] Filter count badge shows on the filter button when filters are active.
- [ ] Reset all restores the defaults.
- [ ] "Use My Location" asks for permission and shows your city (phone only).

### Browsing another city and home city
- [ ] Pick New York in filters: deck switches to New York people, and
      "Browsing New York, NY" shows at the top. Distances are from New York.
- [ ] Clearing the city or using your location returns to your local deck.
- [ ] Picking a different city within a week shows the "browse a new city
      again on ..." message; the same city or your location is still allowed.
- [ ] Profile → Home city: change it, then reopening says it's locked for a
      month with the next date.
- [ ] "Lives in City, ST" appears on cards, full profiles and in Likes.
      City and state only.

### Likes
- [ ] Likes show "Lives in City, ST", plus distance for local people.
- [ ] A like from another city (Maya, Brooklyn) is mixed in with local likes.
- [ ] Like back makes a match; pass removes them.

### Matches and chat
- [ ] New Matches row and Conversations list show the right people.
- [ ] Ghost badge on Slow to reply matches; Great Chat badge on Great Chat
      matches; neither on others.
- [ ] Messages read oldest at the top, newest at the bottom; a sent message
      appears at the bottom.
- [ ] Ice-breakers show in an empty chat and send when tapped.
- [ ] Voice messages: record, preview, send, play back (phone only).
- [ ] Message length limit is enforced.

### Report, block and unmatch
- [ ] Chat "..." menu shows Report, Block and Unmatch on iOS, Android and web.
- [ ] Block and Unmatch ask to confirm; Cancel does nothing.
- [ ] Block: back to Matches, the person is gone everywhere (Discover, Likes,
      Matches, boards).
- [ ] Unmatch: same, the person is gone everywhere.
- [ ] Report: pick a category, add a note, submit (needs the server; fails
      in the preview). The confirmation says they've been blocked; Done
      leaves the chat.

### Slow to reply badge
- [ ] Others see it only after matching: match pop-up notice, chat warning
      bar, ghost by the name, ghost on the photo in Matches. Never on Discover.
- [ ] Wording uses the person's name, never "he/she/her".
- [ ] Closing the chat warning bar keeps it closed for that person; the ghost
      by the name stays.
- [ ] Your own: the one-time "You've earned the badge" message, the profile
      card with "6 of 8 unanswered", and "See matches".
- [ ] Waiting on you: Reply and Unmatch clear matches; after 2, the badge goes
      away and the wording switches to the warning.
- [ ] The advance warning appears once when reaching 3 unanswered without the
      badge (needs a fresh start or the server to see in full).

### Great Chat badge
- [ ] Shown before and after matching: "Great Chat" next to Verified on
      Discover cards, on the full profile, by the name in chat, on the photo
      in Matches.
- [ ] Your own card shows no numbers, only the badge and a short explanation.
- [ ] Late replies to waiting matches never earn Great Chat.
- [ ] Rating card ("How's your conversation with Jake going?") appears inside
      a chat with 10+ messages and 4+ from each person, and nowhere else.
- [ ] Great / Okay / Not great each save and show "Thanks! Jake won't see your
      answer." Reopening the chat never asks again.
- [ ] Not now hides it; it comes back once, 3+ days later, only if there are
      new messages; a second Not now hides it for good.
- [ ] Never asked after a block, report or unmatch.

### Community boards
- [ ] Community shows boards only; no Events tab.
- [ ] Trending, Your Boards and All Boards sections; search finds boards by
      name, category or description.
- [ ] Join and Leave stick after leaving and coming back.
- [ ] Create Board: name, description, category and icon are required;
      character counters work.
- [ ] Same name after tidying is blocked with a link to the existing board
      ("Music Fans" vs "Music Lovers").
- [ ] Close names show "Similar boards. Join one instead?"
- [ ] A 4th board is refused while you have 3.
- [ ] Board page: description, members, Join/Leave, posts and comments. You
      must join to post or comment.
- [ ] Posts and comments show first name and photo only; tapping a name or
      photo does nothing (no profile, like or message).
- [ ] Delete your own post; report someone else's (it disappears for you
      with a thank-you note).
- [ ] Owner: Edit description saves; Delete board asks to confirm and only
      appears under 10 members.
- [ ] Report a board you don't own; it disappears for you.
- [ ] Blocked and unmatched people's posts and comments are hidden.

### Boards and Discover
- [ ] "Both in Coffee & Conversations" on Discover cards for people who share
      a board with you.
- [ ] Board-mates appear earlier in your deck, but only people already in it.
- [ ] Profile → "Show my boards on Discover" off removes the tags and the
      boost; on brings them back.
- [ ] People who turned it off themselves (Sofia) never show the tag.

### Profile
- [ ] Add and remove photos. Check the minimum: sign-up allows 1 photo, but
      the Profile screen says "min 3 required" and blocks deleting below 3.
      Decide which is right.
- [ ] Match note saves (max 150 characters).
- [ ] Get Verified flow runs. It's a placeholder that approves automatically.
- [ ] Level, streak and Priority (level 5+) badges show correctly.

### Challenges
- [ ] Completing a challenge marks it done and adds the right number of
      likes and points.
- [ ] Level goes up with points.

### Demo mode (preview only)
- [ ] Opens signed in as the sample user, Alex.
- [ ] Sign Out resets the sample profile instead of showing a login screen.

---

## Part 2: With the server

### Accounts and profiles
- [ ] Sign-up saves the profile to the server; signing in on another device
      shows the same profile and photos.
- [ ] Photo upload works, and other people can see your photos.
- [ ] Server rejects: age under 18 or over 120, bad birthday format, invalid
      coordinates, over-long name/bio/occupation, more than 9 photos or 20
      interests.
- [ ] Another user's exact birthday and coordinates are never returned.
- [ ] Unknown address returns a JSON "Not found"; broken JSON returns a JSON
      error; server errors never show stack traces.
- [ ] Requests without sign-in get 401.

### Discover
- [ ] Discover loads real profiles from the server.
- [ ] Every filter is applied on the server (distance, age, Show Me and the
      rest).
- [ ] Both distance limits must be met in Discover: you're within their limit
      and they're within yours.
- [ ] Real distances on cards, rounded, in the right unit.
- [ ] Browsing another city: you see people there; they never see you in
      their Discover; your likes still reach them.
- [ ] Weekly browsing limit and monthly home city limit enforced on the
      server, not just the phone.
- [ ] City search covers cities worldwide, not just the US list.

### Likes, matches and chat
- [ ] A like reaches the other person's Likes from any distance, mixed in
      with local likes.
- [ ] Liking back creates a match for both people.
- [ ] Messages send and arrive in real time on both phones.

### Safety
- [ ] Report saves on the server and blocks the person, in one step.
- [ ] Block and unmatch save on the server; the person disappears for both
      people, on every device.
- [ ] Blocking or unmatching twice doesn't error.
- [ ] You can't report, block or unmatch yourself.
- [ ] Board and post reports reach your team.

### Badges
- [ ] Slow to reply is calculated on the server from real messages: 3+ days
      unanswered, last 2 weeks, 5+ and over 60%, warning at 3.
- [ ] A late reply, unmatch, block or report clears an unanswered match.
- [ ] Great Chat is calculated on the server: timely replies (within 24
      hours), long balanced conversations, and ratings over 30 days.
- [ ] Ratings are saved on the server and never shown to the person rated.
- [ ] Badges show for other people based on the server, not sample data.
- [ ] The warning and "earned" messages are based on real numbers.

### Community
- [ ] Boards, posts and comments are shared: a board one person creates is
      visible to everyone.
- [ ] Board rules enforced on the server (limits, duplicates, 3 per person,
      owner delete under 10 members).
- [ ] "Both in ..." tags and the boost come from the server and respect
      everyone's opt-out.

---

## Part 3: Every release

- [ ] Test on a real iPhone and a real Android phone, not just the browser.
- [ ] Small (iPhone SE size) and large screens: nothing hidden or overlapping.
- [ ] Light and dark mode: all text readable, badges visible.
- [ ] Slow or no internet: the app doesn't crash; blocks and unmatches still
      apply on the phone.
- [ ] Screen reader (VoiceOver/TalkBack): buttons and badges are announced.
- [ ] Production builds never have demo mode turned on.
- [ ] Everything on the go-live checklist (`docs/GO_LIVE_CHECKLIST.md`) is done
      before launch.
