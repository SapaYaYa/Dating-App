// Gentoo's "Antarctic" palette: ice, sea, and the gentoo's orange beak against
// black and white feathers. See docs/BRANDING.md. Text colors meet 4.5:1 on
// the backgrounds they're used on.
const colors = {
  light: {
    text: "#17181A",
    tint: "#1E5A7A",
    background: "#F5F9FC", // snow
    foreground: "#17181A", // charcoal
    card: "#FFFFFF",
    cardForeground: "#17181A",
    primary: "#C9431C", // beak orange: main buttons, white text
    primaryForeground: "#FFFFFF",
    secondary: "#E6F0F6",
    secondaryForeground: "#17181A",
    muted: "#EEF4F8",
    mutedForeground: "#4A5560", // slate
    accent: "#C9431C", // hearts, pebbles, highlights
    accentForeground: "#FFFFFF",
    destructive: "#D92D20",
    destructiveForeground: "#FFFFFF",
    border: "#DCE4EA",
    input: "#EEF4F8",
    // Brand: the logo, app icon, links and the active tab.
    brand: "#1E5A7A", // deep sea
    brandForeground: "#F5F9FC",
    ice: "#CFE8F5", // badges and note bubbles (charcoal text)
    // A soft glow so the black penguin stands out (needed in dark mode).
    penguinGlow: "transparent",
    superLike: "#2196F3",
    gold: "#B7791F",
    green: "#2F855A",
    slowReply: "#5B4BC4",
    slowReplyBg: "#F0EDFB",
    slowReplyTitle: "#43369A",
    slowReplyText: "#3B3355",
    greatChat: "#C2410C",
    greatChatBg: "#FFF1E6",
    greatChatText: "#5C2A0E",
  },
  dark: {
    text: "#F5F9FC",
    tint: "#8FCBEA",
    background: "#0E1A22", // Antarctic night
    foreground: "#F5F9FC",
    card: "#16262F",
    cardForeground: "#F5F9FC",
    primary: "#F0683B", // bright beak orange, charcoal text
    primaryForeground: "#17181A",
    secondary: "#1F3340",
    secondaryForeground: "#F5F9FC",
    muted: "#1A2C37",
    mutedForeground: "#A9B8C4",
    accent: "#F0683B",
    accentForeground: "#17181A",
    destructive: "#FF6B5E",
    destructiveForeground: "#17181A",
    border: "#22343F",
    input: "#16262F",
    brand: "#8FCBEA", // ice blue on night
    brandForeground: "#0E1A22",
    ice: "#1F4A61",
    penguinGlow: "rgba(143,203,234,0.22)",
    superLike: "#42A5F5",
    gold: "#F6C453",
    green: "#4ADE80",
    slowReply: "#9D8FF0",
    slowReplyBg: "#26213D",
    slowReplyTitle: "#CFC6FF",
    slowReplyText: "#DAD5F2",
    greatChat: "#FDBA74",
    greatChatBg: "#3A2416",
    greatChatText: "#FBE3CF",
  },
  radius: 14,
};

export default colors;
