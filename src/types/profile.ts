// Profile and customization types
export interface UserProfile {
  id: string;
  name: string;
  bio?: string;
  avatar: string; // Emoji or icon identifier
  favoriteColor: string; // Hex color
  joinDate: string;
  location?: string;
  favoritePosition?: "pitcher" | "blocker" | "both";
  playingSince?: string; // Year they started playing
}

export interface ProfileSettings {
  displayStatsOnProfile: boolean;
  shareableProfile: boolean;
  theme: "dark" | "light" | "auto";
}

// Available avatar options (emojis)
export const AVATAR_OPTIONS = [
  "👑", "🎯", "🌽", "🔥", "⚡", "💎", "🏆", "🎪",
  "🎨", "🎭", "🎪", "🎬", "🎮", "🎲", "🎰", "🃏",
  "👨", "👩", "🧔", "👱", "👴", "👵", "🧑", "👶",
  "😎", "🤠", "🥳", "😇", "🤓", "🧐", "🤩", "😈",
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼",
  "🦁", "🐯", "🐸", "🐵", "🐔", "🐧", "🐦", "🦅",
];

// Color presets for profile customization
export const COLOR_PRESETS = [
  { name: "Royal Purple", value: "#7c3aed" },
  { name: "Crimson Red", value: "#dc2626" },
  { name: "Ocean Blue", value: "#2563eb" },
  { name: "Forest Green", value: "#059669" },
  { name: "Sunset Orange", value: "#ea580c" },
  { name: "Gold", value: "#eab308" },
  { name: "Hot Pink", value: "#ec4899" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Emerald", value: "#10b981" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Cyan", value: "#06b6d4" },
];
