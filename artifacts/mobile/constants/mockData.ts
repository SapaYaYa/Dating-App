export interface Profile {
  id: string;
  name: string;
  age: number;
  distance: string;
  occupation: string;
  bio: string;
  images: string[];
  interests: string[];
  spotify: { song: string; artist: string };
  instagram: { posts: number; username: string };
  profileQuestions: Array<{ question: string; answer: string }>;
  iceBreakers: string[];
  verified: boolean;
  likesYou?: boolean;
  likeNote?: string;
  matchNote?: string;
}

export interface Match {
  id: string;
  profile: Profile;
  matchedAt: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  hasIceBreaker?: boolean;
  matchNote?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isOwn: boolean;
  type?: "text" | "voice";
  audioUri?: string;
  duration?: number;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  members: number;
  posts: number;
  category: string;
  emoji: string;
  trending: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  category: string;
  free: boolean;
  price?: string;
  hostImage: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly";
  points: number;
  progress: number;
  total: number;
  completed: boolean;
  icon: string;
}

export const MOCK_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Emma",
    age: 24,
    distance: "2 mi away",
    occupation: "Software Engineer",
    bio: "Coffee addict, dog lover, and aspiring chef. Looking for someone to explore farmers markets with on Sunday mornings.",
    images: ["https://randomuser.me/api/portraits/women/44.jpg"],
    interests: ["Coffee", "Cooking", "Dogs", "Travel", "Yoga"],
    spotify: { song: "Levitating", artist: "Dua Lipa" },
    instagram: { posts: 342, username: "@emma.creates" },
    profileQuestions: [
      { question: "My ideal Sunday is...", answer: "Farmers market then cooking something new" },
      { question: "My love language is...", answer: "Acts of service and quality time" },
    ],
    iceBreakers: ["Best coffee spot in the city?", "Favorite recipe you've tried recently?"],
    verified: true,
  },
  {
    id: "2",
    name: "Jake",
    age: 27,
    distance: "5 mi away",
    occupation: "Photographer",
    bio: "Chasing golden hour light and good conversations. Film photography enthusiast. Always planning the next adventure.",
    images: ["https://randomuser.me/api/portraits/men/32.jpg"],
    interests: ["Photography", "Travel", "Music", "Outdoors", "Film"],
    spotify: { song: "Golden Hour", artist: "JVKE" },
    instagram: { posts: 512, username: "@jakeshootsfilm" },
    profileQuestions: [
      { question: "A perfect date for me...", answer: "Sunset picnic with vinyl records playing" },
      { question: "My biggest passion is...", answer: "Capturing moments before they're gone" },
    ],
    iceBreakers: ["What's your favorite photo you've ever taken?", "Best travel memory?"],
    verified: true,
    likesYou: true,
    matchNote: "Let's find our golden hour together — I'll bring the camera.",
    likeNote: "Your travel photos are stunning!",
  },
  {
    id: "3",
    name: "Sofia",
    age: 22,
    distance: "1 mi away",
    occupation: "Art Student",
    bio: "Gallery hopping by day, studio chaos by night. I paint feelings, not things. Looking for someone who appreciates the weird and wonderful.",
    images: ["https://randomuser.me/api/portraits/women/17.jpg"],
    interests: ["Art", "Museums", "Coffee", "Indie Music", "Books"],
    spotify: { song: "Motion Sickness", artist: "Phoebe Bridgers" },
    instagram: { posts: 187, username: "@sofia.paints" },
    profileQuestions: [
      { question: "Two truths and a lie...", answer: "I speak 3 languages, own 7 plants, hate coffee (lie!)" },
      { question: "I'm looking for...", answer: "Someone who will visit galleries and share playlists with me" },
    ],
    iceBreakers: ["Favorite artist of all time?", "What emotion would you paint today?"],
    verified: false,
    matchNote: "I paint feelings — and right now I'm feeling pretty excited about this.",
  },
  {
    id: "4",
    name: "Marcus",
    age: 29,
    distance: "3 mi away",
    occupation: "Executive Chef",
    bio: "Michelin-trained chef who cooks for love, not stars. My kitchen is always open. Let me cook you dinner on the first date.",
    images: ["https://randomuser.me/api/portraits/men/75.jpg"],
    interests: ["Cooking", "Wine", "Travel", "Jazz", "Fitness"],
    spotify: { song: "Good Life", artist: "OneRepublic" },
    instagram: { posts: 894, username: "@chefmarcus" },
    profileQuestions: [
      { question: "My superpower is...", answer: "Making anyone feel at home with food" },
      { question: "The way to my heart is...", answer: "Appreciate the meal I cooked you" },
    ],
    iceBreakers: ["What's your comfort food?", "Best meal you've ever had?"],
    verified: true,
    likesYou: true,
    matchNote: "First date is dinner at my place. I'll cook — that's a promise.",
  },
  {
    id: "5",
    name: "Ava",
    age: 25,
    distance: "4 mi away",
    occupation: "Yoga Instructor",
    bio: "Chasing balance, not perfection. Morning person who loves farmers markets, meditation, and hiking new trails.",
    images: ["https://randomuser.me/api/portraits/women/68.jpg"],
    interests: ["Yoga", "Hiking", "Meditation", "Health", "Nature"],
    spotify: { song: "Sunrise", artist: "Norah Jones" },
    instagram: { posts: 421, username: "@ava.mindful" },
    profileQuestions: [
      { question: "I'm weirdly good at...", answer: "Headstands and parallel parking" },
      { question: "Ideal weekend...", answer: "Hiking a new trail, then soaking in the views" },
    ],
    iceBreakers: ["Favorite hiking trail?", "Morning person or night owl?"],
    verified: true,
  },
  {
    id: "6",
    name: "Liam",
    age: 26,
    distance: "6 mi away",
    occupation: "Musician",
    bio: "Plays guitar in a band you've probably heard of once. Writes songs at 2am and regrets it at 7am. Seeking my muse.",
    images: ["https://randomuser.me/api/portraits/men/11.jpg"],
    interests: ["Music", "Songwriting", "Vinyl", "Concerts", "Coffee"],
    spotify: { song: "Electric Feel", artist: "MGMT" },
    instagram: { posts: 256, username: "@liamplaysmusic" },
    profileQuestions: [
      { question: "Song that defines me...", answer: "Changes weekly honestly" },
      { question: "First date idea...", answer: "Record store, then live music" },
    ],
    iceBreakers: ["What's your most-played song lately?", "Favorite live show you've seen?"],
    verified: false,
  },
  {
    id: "7",
    name: "Zara",
    age: 23,
    distance: "2 mi away",
    occupation: "UX Designer",
    bio: "I care deeply about how things work AND look. Design obsessed. Plant mom. Amateur ceramicist. Looking for real conversations.",
    images: ["https://randomuser.me/api/portraits/women/90.jpg"],
    interests: ["Design", "Ceramics", "Plants", "Architecture", "Coffee"],
    spotify: { song: "Blinding Lights", artist: "The Weeknd" },
    instagram: { posts: 378, username: "@zara.designs" },
    profileQuestions: [
      { question: "I'm known for...", answer: "Having too many plants and strong opinions on fonts" },
      { question: "My simple pleasure...", answer: "Finding a perfect color palette in nature" },
    ],
    iceBreakers: ["Serif or sans-serif?", "Most beautiful thing you've seen this week?"],
    verified: true,
    likesYou: true,
    matchNote: "I designed my ideal match in my head for years. Glad you showed up.",
  },
  {
    id: "8",
    name: "Noah",
    age: 28,
    distance: "8 mi away",
    occupation: "Emergency Doctor",
    bio: "Save lives by day, amateur sommelier by night. Life is short — drink good wine, travel often, love deeply.",
    images: ["https://randomuser.me/api/portraits/men/45.jpg"],
    interests: ["Wine", "Travel", "Reading", "Cooking", "Cycling"],
    spotify: { song: "Budapest", artist: "George Ezra" },
    instagram: { posts: 143, username: "@dr.noah.adventures" },
    profileQuestions: [
      { question: "Best advice I've received...", answer: "Say yes to things that make you nervous" },
      { question: "I'm reading...", answer: "The Midnight Library and loving every page" },
    ],
    iceBreakers: ["Favorite wine region?", "Best book in the last year?"],
    verified: true,
  },
  {
    id: "9",
    name: "Mia",
    age: 24,
    distance: "3 mi away",
    occupation: "Travel Blogger",
    bio: "32 countries, 1 suitcase. I find beauty in train stations and street food. Life's a trip — come along.",
    images: ["https://randomuser.me/api/portraits/women/63.jpg"],
    interests: ["Travel", "Photography", "Street Food", "Writing", "Languages"],
    spotify: { song: "Wanderlust", artist: "Ryn Weaver" },
    instagram: { posts: 1240, username: "@mia.wanders" },
    profileQuestions: [
      { question: "Next destination on my list...", answer: "Japan in cherry blossom season" },
      { question: "I can't live without...", answer: "My camera and a window seat" },
    ],
    iceBreakers: ["Most underrated country you've visited?", "Best street food ever?"],
    verified: true,
    matchNote: "Pack light and let's go. I'll show you somewhere you've never been.",
  },
  {
    id: "10",
    name: "Ethan",
    age: 30,
    distance: "7 mi away",
    occupation: "Startup Founder",
    bio: "Building things that matter. Failed 2x, succeeded 1x. Learner, runner, bad dancer but enthusiastic about it.",
    images: ["https://randomuser.me/api/portraits/men/22.jpg"],
    interests: ["Startups", "Running", "Books", "Coffee", "Podcasts"],
    spotify: { song: "Empire State of Mind", artist: "Jay-Z" },
    instagram: { posts: 89, username: "@ethan.builds" },
    profileQuestions: [
      { question: "My 5-year plan...", answer: "Exit one startup, start another, travel more" },
      { question: "I admire people who...", answer: "Do scary things anyway" },
    ],
    iceBreakers: ["Best podcast recommendation?", "What are you building right now?"],
    verified: true,
  },
  {
    id: "11",
    name: "Luna",
    age: 22,
    distance: "1 mi away",
    occupation: "Actress",
    bio: "Method actor, professional overthinker, and accidental plant killer. Theatre kid who never grew out of it.",
    images: ["https://randomuser.me/api/portraits/women/26.jpg"],
    interests: ["Theatre", "Film", "Reading", "Yoga", "Coffee"],
    spotify: { song: "The Night We Met", artist: "Lord Huron" },
    instagram: { posts: 567, username: "@luna.acts" },
    profileQuestions: [
      { question: "The last thing that made me cry...", answer: "A dog commercial, obviously" },
      { question: "I could talk about...", answer: "Character motivation for hours" },
    ],
    iceBreakers: ["Favorite movie of all time?", "What role would you want to play?"],
    verified: false,
    likesYou: true,
    matchNote: "You matched me! Now I'm somehow more nervous than before an audition.",
  },
  {
    id: "12",
    name: "Kai",
    age: 27,
    distance: "9 mi away",
    occupation: "Marine Biologist",
    bio: "I study ocean currents and collect sea glass. More comfortable underwater than at parties. Passionate about our blue planet.",
    images: ["https://randomuser.me/api/portraits/men/59.jpg"],
    interests: ["Ocean", "Diving", "Science", "Hiking", "Photography"],
    spotify: { song: "Into the Deep", artist: "Ludovico Einaudi" },
    instagram: { posts: 234, username: "@kai.deep.sea" },
    profileQuestions: [
      { question: "Most amazing thing I've seen...", answer: "A whale shark in the wild. Life-changing." },
      { question: "My unpopular opinion...", answer: "The ocean is more interesting than outer space" },
    ],
    iceBreakers: ["Scared of deep water or fascinated?", "Most alien creature you know of?"],
    verified: true,
  },
  {
    id: "13",
    name: "Jade",
    age: 25,
    distance: "4 mi away",
    occupation: "Pediatric Nurse",
    bio: "I heal kids by day and do pottery by night. Big heart, strong coffee, cannot handle sad movie endings.",
    images: ["https://randomuser.me/api/portraits/women/12.jpg"],
    interests: ["Pottery", "Kids", "Cooking", "Running", "Art"],
    spotify: { song: "Lover", artist: "Taylor Swift" },
    instagram: { posts: 298, username: "@jade.creates" },
    profileQuestions: [
      { question: "I'm basically a...", answer: "Human golden retriever" },
      { question: "Guilty pleasure...", answer: "Reality TV and premium ice cream at 11pm" },
    ],
    iceBreakers: ["Favorite pottery piece you've made?", "How do you unwind after a hard day?"],
    verified: true,
  },
  {
    id: "14",
    name: "Finn",
    age: 28,
    distance: "5 mi away",
    occupation: "Architect",
    bio: "I design spaces that make people feel things. Amateur bread baker and very serious chess player (not really). Gentle giant.",
    images: ["https://randomuser.me/api/portraits/men/88.jpg"],
    interests: ["Architecture", "Chess", "Baking", "Museums", "Jazz"],
    spotify: { song: "Take Five", artist: "Dave Brubeck Quartet" },
    instagram: { posts: 167, username: "@finn.arch" },
    profileQuestions: [
      { question: "My most controversial take...", answer: "Comic Sans has its place and I'll die on this hill" },
      { question: "I'm happiest when...", answer: "There's fresh bread in the oven" },
    ],
    iceBreakers: ["Favorite building in the world?", "Sourdough or focaccia?"],
    verified: false,
  },
  {
    id: "15",
    name: "Aria",
    age: 23,
    distance: "2 mi away",
    occupation: "Professional Dancer",
    bio: "Ballet trained, hip-hop at heart. I express myself best when music is playing. Looking for someone with rhythm in their soul.",
    images: ["https://randomuser.me/api/portraits/women/33.jpg"],
    interests: ["Dance", "Music", "Fitness", "Fashion", "Film"],
    spotify: { song: "Savage", artist: "Megan Thee Stallion" },
    instagram: { posts: 1089, username: "@aria.moves" },
    profileQuestions: [
      { question: "I feel most alive when...", answer: "On stage with the lights on" },
      { question: "Dealbreaker for me...", answer: "Someone who says they have no rhythm" },
    ],
    iceBreakers: ["What song makes you want to dance?", "Can you dance or are you a spectator?"],
    verified: true,
    likesYou: true,
    matchNote: "Yes! Now tell me — what song are we dancing to first?",
    likeNote: "Your profile is so real and refreshing",
  },
];

export const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    profile: MOCK_PROFILES[1],
    matchedAt: "2025-04-30",
    lastMessage: "Can't wait for Saturday!",
    lastMessageTime: "2m ago",
    unreadCount: 2,
    hasIceBreaker: false,
    matchNote: "We matched on travel photography!",
  },
  {
    id: "m2",
    profile: MOCK_PROFILES[3],
    matchedAt: "2025-04-29",
    lastMessage: "I'll cook you that pasta dish",
    lastMessageTime: "1h ago",
    unreadCount: 0,
    hasIceBreaker: false,
  },
  {
    id: "m3",
    profile: MOCK_PROFILES[6],
    matchedAt: "2025-04-28",
    lastMessage: "Serif for body, sans-serif for headings. Fight me.",
    lastMessageTime: "3h ago",
    unreadCount: 1,
    hasIceBreaker: false,
  },
  {
    id: "m4",
    profile: MOCK_PROFILES[10],
    matchedAt: "2025-04-27",
    lastMessage: undefined,
    lastMessageTime: undefined,
    unreadCount: 0,
    hasIceBreaker: true,
  },
  {
    id: "m5",
    profile: MOCK_PROFILES[14],
    matchedAt: "2025-04-26",
    lastMessage: "My fave is anything by Childish Gambino",
    lastMessageTime: "Yesterday",
    unreadCount: 0,
    hasIceBreaker: false,
  },
  {
    id: "m6",
    profile: MOCK_PROFILES[0],
    matchedAt: "2025-05-01",
    lastMessage: undefined,
    lastMessageTime: undefined,
    unreadCount: 0,
    hasIceBreaker: true,
  },
];

export const MOCK_CHAT_MESSAGES: { [matchId: string]: ChatMessage[] } = {
  m1: [
    { id: "1", senderId: "jake", text: "Hey! Your travel photos are amazing btw", timestamp: "10:20 AM", isOwn: false },
    { id: "2", senderId: "me", text: "Thank you! I see you shoot film too, love that", timestamp: "10:22 AM", isOwn: true },
    { id: "3", senderId: "jake", text: "Yeah! There's something magical about it. Do you develop your own?", timestamp: "10:24 AM", isOwn: false },
    { id: "4", senderId: "me", text: "Not yet but I want to learn! Any good darkrooms nearby?", timestamp: "10:25 AM", isOwn: true },
    { id: "5", senderId: "jake", text: "There's one downtown! I could show you sometime", timestamp: "10:27 AM", isOwn: false },
    { id: "6", senderId: "me", text: "I'd love that! When are you free?", timestamp: "10:28 AM", isOwn: true },
    { id: "7", senderId: "jake", text: "Can't wait for Saturday!", timestamp: "2:15 PM", isOwn: false },
    { id: "8", senderId: "jake", text: "Also do you prefer morning or afternoon?", timestamp: "2:16 PM", isOwn: false },
  ],
  m2: [
    { id: "1", senderId: "marcus", text: "You mentioned you like Italian food in your profile!", timestamp: "Yesterday", isOwn: false },
    { id: "2", senderId: "me", text: "It's my weakness honestly. Pasta, pizza, all of it.", timestamp: "Yesterday", isOwn: true },
    { id: "3", senderId: "marcus", text: "What if I cooked for you on our first date?", timestamp: "Yesterday", isOwn: false },
    { id: "4", senderId: "me", text: "You had me at 'I'll cook'. What are you making?", timestamp: "Yesterday", isOwn: true },
    { id: "5", senderId: "marcus", text: "I'll cook you that pasta dish", timestamp: "1h ago", isOwn: false },
  ],
  m3: [
    { id: "1", senderId: "zara", text: "Serif or sans-serif? This is important.", timestamp: "Yesterday", isOwn: false },
    { id: "2", senderId: "me", text: "Depends on context. But I lean sans-serif.", timestamp: "Yesterday", isOwn: true },
    { id: "3", senderId: "zara", text: "Bold. I respect that but we need to discuss more.", timestamp: "Yesterday", isOwn: false },
    { id: "4", senderId: "zara", text: "Serif for body, sans-serif for headings. Fight me.", timestamp: "3h ago", isOwn: false },
  ],
  m5: [
    { id: "1", senderId: "aria", text: "Ok so the ice breaker got me thinking...", timestamp: "Yesterday", isOwn: false },
    { id: "2", senderId: "me", text: "What song makes you want to dance? Right?", timestamp: "Yesterday", isOwn: true },
    { id: "3", senderId: "aria", text: "Yes!! It changes literally every week for me", timestamp: "Yesterday", isOwn: false },
    { id: "4", senderId: "aria", text: "My fave is anything by Childish Gambino", timestamp: "Yesterday", isOwn: false },
  ],
};

export const MOCK_BOARDS: Board[] = [
  {
    id: "b1",
    title: "Coffee & Conversations",
    description: "For those who believe every great connection starts with a good cup.",
    members: 4821,
    posts: 312,
    category: "Lifestyle",
    emoji: "☕",
    trending: true,
  },
  {
    id: "b2",
    title: "Adventure Seekers",
    description: "Hiking, travel, and outdoor experiences. Find your adventure partner.",
    members: 6203,
    posts: 547,
    category: "Travel",
    emoji: "🏔️",
    trending: true,
  },
  {
    id: "b3",
    title: "Foodie Dates",
    description: "Restaurant recommendations, cooking dates, and food adventures.",
    members: 8941,
    posts: 1230,
    category: "Food",
    emoji: "🍜",
    trending: false,
  },
  {
    id: "b4",
    title: "Night Owls",
    description: "Late night conversations, 2am thoughts, finding your fellow insomniac.",
    members: 3156,
    posts: 892,
    category: "Social",
    emoji: "🌙",
    trending: false,
  },
  {
    id: "b5",
    title: "Bookworms & Beyond",
    description: "Share your reading list, discuss stories, find your literary soulmate.",
    members: 5672,
    posts: 423,
    category: "Culture",
    emoji: "📚",
    trending: true,
  },
  {
    id: "b6",
    title: "Music Lovers",
    description: "Share playlists, concert experiences, and find your music match.",
    members: 7344,
    posts: 876,
    category: "Music",
    emoji: "🎵",
    trending: false,
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: "e1",
    title: "Singles Wine Tasting",
    description: "An intimate evening exploring 6 curated wines from around the world. Meet fellow wine lovers.",
    date: "Fri, May 9",
    time: "7:00 PM",
    location: "Vino Bar, Downtown",
    attendees: 24,
    category: "Food & Drink",
    free: false,
    price: "$35",
    hostImage: "https://randomuser.me/api/portraits/women/55.jpg",
  },
  {
    id: "e2",
    title: "Morning Yoga in the Park",
    description: "Start your weekend right with a group yoga session followed by coffee and connections.",
    date: "Sat, May 10",
    time: "8:30 AM",
    location: "Central Park, East Lawn",
    attendees: 38,
    category: "Wellness",
    free: true,
    hostImage: "https://randomuser.me/api/portraits/women/68.jpg",
  },
  {
    id: "e3",
    title: "Photography Walk: City at Dusk",
    description: "Explore the city with your camera as the sun goes down. All skill levels welcome.",
    date: "Sat, May 10",
    time: "6:00 PM",
    location: "Brooklyn Bridge",
    attendees: 15,
    category: "Arts",
    free: true,
    hostImage: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "e4",
    title: "Cooking Class: Pasta from Scratch",
    description: "Learn to make authentic Italian pasta from a professional chef. Hands-on and delicious.",
    date: "Sun, May 11",
    time: "3:00 PM",
    location: "Chef's Kitchen Studio",
    attendees: 12,
    category: "Food & Drink",
    free: false,
    price: "$65",
    hostImage: "https://randomuser.me/api/portraits/men/75.jpg",
  },
  {
    id: "e5",
    title: "Board Game Mixer",
    description: "Casual evening of board games, laughs, and meeting new people. Beginners welcome!",
    date: "Thu, May 8",
    time: "6:30 PM",
    location: "The Social Lounge",
    attendees: 31,
    category: "Social",
    free: false,
    price: "$10",
    hostImage: "https://randomuser.me/api/portraits/men/22.jpg",
  },
];

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: "c1",
    title: "Early Bird",
    description: "Send your first message before noon",
    type: "daily",
    points: 15,
    progress: 1,
    total: 1,
    completed: true,
    icon: "sun",
  },
  {
    id: "c2",
    title: "Ice Breaker",
    description: "Use an ice-breaker on a new match",
    type: "daily",
    points: 20,
    progress: 0,
    total: 1,
    completed: false,
    icon: "message-circle",
  },
  {
    id: "c3",
    title: "Community Voice",
    description: "Post in a community board",
    type: "daily",
    points: 10,
    progress: 0,
    total: 1,
    completed: false,
    icon: "users",
  },
  {
    id: "c4",
    title: "Response Streak",
    description: "Respond to 3 messages within 1 hour",
    type: "daily",
    points: 25,
    progress: 1,
    total: 3,
    completed: false,
    icon: "zap",
  },
  {
    id: "c5",
    title: "Super Connector",
    description: "Get 5 new matches this week",
    type: "weekly",
    points: 50,
    progress: 2,
    total: 5,
    completed: false,
    icon: "heart",
  },
  {
    id: "c6",
    title: "Event Goer",
    description: "RSVP to 2 community events this week",
    type: "weekly",
    points: 250,
    progress: 1,
    total: 2,
    completed: false,
    icon: "calendar",
  },
  {
    id: "c7",
    title: "Conversationalist",
    description: "Have 10 conversation exchanges this week",
    type: "weekly",
    points: 50,
    progress: 7,
    total: 10,
    completed: false,
    icon: "message-square",
  },
  {
    id: "c8",
    title: "Profile Complete",
    description: "Complete all profile sections",
    type: "weekly",
    points: 30,
    progress: 4,
    total: 5,
    completed: false,
    icon: "user",
  },
  {
    id: "c9",
    title: "Perfect Week",
    description: "Open the app every day for 7 days in a row",
    type: "weekly",
    points: 50,
    progress: 3,
    total: 7,
    completed: false,
    icon: "calendar",
  },
];

export const ICE_BREAKERS = [
  "What's the best trip you've ever taken?",
  "If you could only eat one cuisine forever, what would it be?",
  "What's your go-to Sunday morning activity?",
  "What song always puts you in a good mood?",
  "Something you've always wanted to try but haven't yet?",
  "What's your most unpopular opinion?",
  "Best live music experience you've had?",
  "If you could live anywhere for a year, where?",
  "Morning routine: structured or chaotic?",
  "What's the last thing that made you genuinely laugh?",
];

export const PROFILE_QUESTIONS = [
  "My ideal Sunday is...",
  "The way to my heart is...",
  "I'm looking for someone who...",
  "My love language is...",
  "Two truths and a lie...",
  "My biggest passion is...",
  "I feel most alive when...",
  "My superpower is...",
  "A perfect date for me is...",
  "I'm weirdly good at...",
];
