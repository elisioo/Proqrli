const THEME_PRESETS = [
  {
    id: "default",
    name: "Ink",
    description: "Editorial black on warm paper. The ProcurLi default.",
    accent: "#181714"
  },
  {
    id: "forest",
    name: "Forest",
    description: "Deep green for industrial & raw-materials vendors.",
    accent: "#1f6f4a"
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Cool blue for logistics & IT equipment vendors.",
    accent: "#1e5fbf"
  },
  {
    id: "sunset",
    name: "Sunset",
    description: "Warm amber for chemicals & oil & gas vendors.",
    accent: "#c2410c"
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Dark mode — high-contrast for focus work.",
    accent: "#a78bfa",
    dark: true
  }
];
const DEFAULT_THEME_ID = "default";
const DEFAULT_ACCENT = THEME_PRESETS[0].accent;
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const num = parseInt(v, 16);
  return { r: num >> 16 & 255, g: num >> 8 & 255, b: num & 255 };
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const toLin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * toLin(r) + 0.7152 * toLin(g) + 0.0722 * toLin(b);
}
function readableForeground(hex) {
  return luminance(hex) > 0.55 ? "#181714" : "#f6f4ef";
}
export {
  DEFAULT_THEME_ID as D,
  THEME_PRESETS as T,
  DEFAULT_ACCENT as a,
  hexToRgb as h,
  readableForeground as r
};
