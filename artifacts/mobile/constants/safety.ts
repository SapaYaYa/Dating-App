// Dating-safety disclosures required by several states' online dating laws
// (New Jersey, New York, Texas, Illinois, Florida and others). Shown at
// sign-up (acknowledged before creating an account) and anytime under
// Profile > Privacy & Safety. Before launch, check the wording against the
// current New Jersey and New York text (docs/ADMIN_CHECKLIST.md).

/** We don't screen members; New Jersey and Texas require saying so. */
export const BACKGROUND_CHECK_STATEMENT =
  "Gentoo does not conduct criminal background screenings of its members.";

/** The first tip is New York's required statement (GBL 394-cc). */
export const SAFETY_TIPS: { title: string; body: string }[] = [
  {
    title: "Act with caution",
    body: "There is no substitute for acting with caution when communicating with any stranger who wants to meet you.",
  },
  {
    title: "Keep personal details private",
    body: "Don't share your last name, home address, workplace, phone number or financial details until you know someone.",
  },
  {
    title: "Never send money",
    body: "Never send money or financial information, whatever the story. Report anyone who asks.",
  },
  {
    title: "Profiles can be fake",
    body: "Anyone can make up a name, photos or a job. Video chat before you meet.",
  },
  {
    title: "Meet in public, get there yourself",
    body: "Meet in a busy public place. Arrange your own way there, and don't agree to be picked up at home.",
  },
  {
    title: "Tell a friend",
    body: "Tell a friend where you're going and who you're meeting.",
  },
  {
    title: "Trust your gut",
    body: "Watch your drink, and leave whenever you feel uncomfortable.",
  },
  {
    title: "Report and block",
    body: "Report and block anyone who makes you uneasy. If you're ever in danger, call 911.",
  },
];
