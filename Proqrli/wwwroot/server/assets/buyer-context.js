import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { B as BUYER_TEAM, F as BUYER_ROLE_PERMISSIONS, H as CURRENT_BUYER_TENANT } from "./router.js";
import { T as THEME_PRESETS, D as DEFAULT_THEME_ID, a as DEFAULT_ACCENT, r as readableForeground, h as hexToRgb } from "./color-utils.js";
const BuyerCtx = reactExports.createContext(null);
const LS_USER = "procurli:buyer:userId";
const LS_THEME = "procurli:buyer:themeId";
const LS_ACCENT = "procurli:buyer:accent";
function readLS(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}
function applyTheme(themeId, accent) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const preset = THEME_PRESETS.find((t) => t.id === themeId);
  root.classList.toggle("dark", preset?.dark ?? false);
  const fg = readableForeground(accent);
  const { r, g, b } = hexToRgb(accent);
  const soft = `rgba(${r}, ${g}, ${b}, 0.12)`;
  root.style.setProperty("--accent-solid", accent);
  root.style.setProperty("--accent-foreground-solid", fg);
  root.style.setProperty("--accent-soft", soft);
}
function BuyerProvider({ children }) {
  const [userId, setUserIdRaw] = reactExports.useState(
    () => readLS(LS_USER, BUYER_TEAM[0].id)
  );
  const [themeId, setThemeIdRaw] = reactExports.useState(
    () => readLS(LS_THEME, DEFAULT_THEME_ID)
  );
  const [accent, setAccentRaw] = reactExports.useState(
    () => readLS(LS_ACCENT, DEFAULT_ACCENT)
  );
  const user = BUYER_TEAM.find((m) => m.id === userId) ?? BUYER_TEAM[0];
  const role = user.role;
  const permissions = BUYER_ROLE_PERMISSIONS[role];
  const setUser = reactExports.useCallback((id) => {
    setUserIdRaw(id);
    try {
      window.localStorage.setItem(LS_USER, id);
    } catch {
    }
  }, []);
  const setThemeId = reactExports.useCallback((id) => {
    setThemeIdRaw(id);
    try {
      window.localStorage.setItem(LS_THEME, id);
    } catch {
    }
    const preset = THEME_PRESETS.find((t) => t.id === id);
    if (preset) {
      setAccentRaw(preset.accent);
      try {
        window.localStorage.setItem(LS_ACCENT, preset.accent);
      } catch {
      }
    }
  }, []);
  const setAccent = reactExports.useCallback((hex) => {
    setAccentRaw(hex);
    try {
      window.localStorage.setItem(LS_ACCENT, hex);
    } catch {
    }
  }, []);
  reactExports.useEffect(() => {
    applyTheme(themeId, accent);
  }, [themeId, accent]);
  const value = reactExports.useMemo(() => ({
    tenant: CURRENT_BUYER_TENANT,
    user,
    role,
    permissions,
    themeId,
    accent,
    setUser,
    setThemeId,
    setAccent,
    hasPermission: (p) => permissions.includes(p)
  }), [user, role, permissions, themeId, accent, setUser, setThemeId, setAccent]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerCtx.Provider, { value, children });
}
function useBuyer() {
  const ctx = reactExports.useContext(BuyerCtx);
  if (!ctx) throw new Error("useBuyer must be used inside <BuyerProvider>");
  return ctx;
}
export {
  BuyerProvider as B,
  useBuyer as u
};
