# Gentoo: illustrator brief

Everything an illustrator needs to draw Gentoo's final brand art. The app
already runs with rough placeholder versions of each piece (see "References"
below), so the art drops straight into known spots.

## About Gentoo

- **What it is:** a dating app for people who are serious about finding
  someone. You scroll one profile at a time and give a pebble to a photo or
  answer you like.
- **The story:** gentoo penguins court by searching for the perfect pebble
  and giving it to their partner. In Gentoo, a like is a pebble. When two
  people give each other one, "It's a pair!"
- **Personality:** a mix of classy and fun. Warm, sincere, a little playful.
  **Never cheeky or suggestive.** Think Duolingo's friendliness with a calmer,
  more grown-up feel.
- **Inspirations the founders like:** Bumble (one theme everywhere),
  Cash App / Spotify / Instagram (one bold, simple symbol), Waze / Duolingo
  (a friendly character).

## Colors (Antarctic palette)

| Name | Hex | Use |
|---|---|---|
| Deep sea | `#1E5A7A` | App icon background, logo |
| Beak orange | `#C9431C` | Buttons (light mode) |
| Bright beak | `#E8572A` | The penguin's beak and feet, hearts |
| Ice | `#CFE8F5` | Soft accents, badges |
| Snow | `#F5F9FC` | Light background |
| Charcoal | `#17181A` | Penguin feathers, text |
| Night | `#0E1A22` | Dark-mode background |
| Night card | `#16262F` | Dark-mode cards |
| Ice (dark mode) | `#8FCBEA` | Logo and accents in dark mode |

**Every illustration must work on both Snow (light mode) and Night (dark
mode).** A black penguin disappears on Night, so please plan for that, for
example with a subtle rim light or outline that works on both. Today the app
puts a soft ice-blue glow behind the penguins in dark mode as a stopgap.

## Getting the gentoo right

- White band or patches over and between the eyes (the gentoo's "bonnet").
- Bright orange-red beak and orange feet.
- Black head and back, white belly.
- Avoid traits of other penguins, such as an emperor penguin's yellow neck
  patches.
- Rounded, friendly proportions; readable as a silhouette.

## Deliverables

In priority order: 1 to 3 are needed first.

### 1. App icon (the pebble)
A smooth pebble with a heart, on deep-sea blue. It's what people tap on their
home screen, so it must read at very small sizes.
- **iOS:** 1024×1024 PNG, square, no transparency and no rounded corners
  (iOS rounds them).
- **Android adaptive icon:** a foreground layer (1024×1024 with the artwork
  inside the central safe zone) plus the background color, and a one-color
  monochrome version for themed icons.
- **Web:** favicons (16, 32, 48 px) and a 180×180 Apple touch icon.
- **Splash screen:** the pebble on deep-sea blue.
- Check that it reads at 29 px (the smallest iOS size) and in the
  notification bar.

### 2. Logo and wordmark
- The word **"gentoo"**, all lowercase, with the pebble mark beside it.
- Versions: color on Snow, color on Night, and one-color (white and
  charcoal).
- Shown in the app header at about 22 px tall.

### 3. Gus, the mascot (character sheet)
Gus is a gentoo penguin: kind, a little shy, quietly encouraging, and on your
side.
- A character sheet with front, three-quarter and side views, and a
  silhouette.
- **Poses, each tied to a spot in the app:**

  | Pose | Where it's used |
  |---|---|
  | Holding a pebble with a heart (default) | Welcome and onboarding, empty Pebbles tab ("No pebbles yet") |
  | Looking around, hand over eyes or with binoculars | Empty Discover ("Gus is out looking") |
  | Waving | Sign-in and welcome screens |
  | Celebrating | Level-ups and challenge rewards |
  | Patiently waiting or sitting | Loading and "check back soon" moments |
  | Searching for a pebble | Out of pebbles ("watch a short ad for 3 more") |

### 4. The pair ("It's a pair!")
Two gentoos leaning in toward each other with a heart above them. This is
the match moment, shown in a pop-up card about 150 px wide.

### 5. Pebble icon set
- **Filled pebble with heart:** the like button on photos and answers, and
  the "Send a pebble" button, at 24 to 34 px.
- **Outline pebble:** the tab bar icon, on a 24 px grid with a 2 px stroke,
  to match the app's other line icons (the Feather icon set).
- **Small pebble:** for counters like "4 pebbles".

### 6. Level badges
Five small badge illustrations, one per level: **Pebble, Waddle, Huddle,
Colony, Legend.**

### 7. Optional: animations
- **Match:** the two penguins waddle in from each side and a heart pops up.
- **Sending a pebble:** the pebble hops off the button.
- Delivered as Lottie (JSON) files, or as separate layered artwork so they
  can be animated later.

## File formats

- **SVG** for everything (the app draws its art as SVG), with each element on
  named layers.
- **PNG** at 1x, 2x and 3x as a backup for illustrations.
- **Source files** (Figma, Illustrator or similar).
- Keep shapes simple: no tiny details that disappear at small sizes, and no
  gradients in the icon.

## Ownership

The contract should give Gentoo full ownership of the artwork and source
files (a full rights transfer), so the brand can be trademarked and used
everywhere: app, stores, website, ads and merchandise.

## References

- Current placeholders in the app: `artifacts/mobile/components/Gentoo.tsx`
  (pebble, Gus, the pair) and `artifacts/mobile/assets/images/icon.png` (app
  icon).
- Concept sketches: `docs/branding/gentoo-world.png`,
  `docs/branding/gentoo-screens-light.png` and
  `docs/branding/gentoo-screens-dark.png`.
- Brand decisions and wording: `docs/BRANDING.md`.
