import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { T as TEAM_MEMBERS, A as ROLE_PERMISSIONS, E as CURRENT_TENANT } from "./router.js";
import { T as THEME_PRESETS, D as DEFAULT_THEME_ID, a as DEFAULT_ACCENT, r as readableForeground, h as hexToRgb } from "./color-utils.js";
const VendorCtx = reactExports.createContext(null);
const LS_USER = "procurli:vendor:userId";
const LS_THEME = "procurli:vendor:themeId";
const LS_ACCENT = "procurli:vendor:accent";
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
function VendorProvider({ children }) {
  const [userId, setUserIdRaw] = reactExports.useState(
    () => readLS(LS_USER, TEAM_MEMBERS[0].id)
  );
  const [themeId, setThemeIdRaw] = reactExports.useState(
    () => readLS(LS_THEME, DEFAULT_THEME_ID)
  );
  const [accent, setAccentRaw] = reactExports.useState(
    () => readLS(LS_ACCENT, DEFAULT_ACCENT)
  );
  const user = TEAM_MEMBERS.find((m) => m.id === userId) ?? TEAM_MEMBERS[0];
  const role = user.role;
  const permissions = ROLE_PERMISSIONS[role];
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
    tenant: CURRENT_TENANT,
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
  return /* @__PURE__ */ jsxRuntimeExports.jsx(VendorCtx.Provider, { value, children });
}
function useVendor() {
  const ctx = reactExports.useContext(VendorCtx);
  if (!ctx) throw new Error("useVendor must be used inside <VendorProvider>");
  return ctx;
}
export {
  VendorProvider as V,
  useVendor as u
};
