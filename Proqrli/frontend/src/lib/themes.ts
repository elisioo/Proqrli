// Per-vendor theme presets. Each defines the accent (button/link/active)
// and a soft tint used for hover/badges.
export type ThemePresetId = "default" | "forest" | "ocean" | "sunset" | "midnight";

export type ThemePreset = {
  id: ThemePresetId;
  name: string;
  description: string;
  // Default accent (hex) — vendors can override with the picker.
  accent: string;
  // Optional: forces dark base.
  dark?: boolean;
};

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default",
    name: "Ink",
    description: "Editorial black on warm paper. The ProcurLi default.",
    accent: "#181714",
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep green for industrial & raw-materials vendors.",
    accent: "#1f6f4a",
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue for logistics & IT equipment vendors.",
    accent: "#1e5fbf",
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm amber for chemicals & oil & gas vendors.",
    accent: "#c2410c",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark mode — high-contrast for focus work.",
    accent: "#a78bfa",
    dark: true,
  },
];

export const DEFAULT_THEME_ID: ThemePresetId = "default";
export const DEFAULT_ACCENT = THEME_PRESETS[0].accent;
