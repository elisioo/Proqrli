// Buyer session context. Mirrors VendorProvider but for the procurement side.
// Re-uses the same theme tokens (--accent-solid, etc.) so theming is shared
// across both portals when a tenant uses both.

import * as React from "react";
import {
  BUYER_ROLE_LABELS,
  BUYER_ROLE_PERMISSIONS,
  BUYER_TEAM,
  CURRENT_BUYER_TENANT,
  type BuyerPermission,
  type BuyerRole,
  type BuyerTeamMember,
  type BuyerTenant,
} from "./buyer-mock-data";
import {
  DEFAULT_ACCENT,
  DEFAULT_THEME_ID,
  THEME_PRESETS,
  type ThemePresetId,
} from "./themes";
import { hexToRgb, readableForeground } from "./color-utils";

type BuyerState = {
  tenant: BuyerTenant;
  user: BuyerTeamMember;
  role: BuyerRole;
  permissions: BuyerPermission[];
  themeId: ThemePresetId;
  accent: string;
  setUser: (id: string) => void;
  setThemeId: (id: ThemePresetId) => void;
  setAccent: (hex: string) => void;
  hasPermission: (p: BuyerPermission) => boolean;
};

const BuyerCtx = React.createContext<BuyerState | null>(null);

const LS_USER = "procurli:buyer:userId";
const LS_THEME = "procurli:buyer:themeId";
const LS_ACCENT = "procurli:buyer:accent";

function readLS(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function applyTheme(themeId: ThemePresetId, accent: string) {
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

export function BuyerProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdRaw] = React.useState<string>(() =>
    readLS(LS_USER, BUYER_TEAM[0].id),
  );
  const [themeId, setThemeIdRaw] = React.useState<ThemePresetId>(
    () => readLS(LS_THEME, DEFAULT_THEME_ID) as ThemePresetId,
  );
  const [accent, setAccentRaw] = React.useState<string>(() =>
    readLS(LS_ACCENT, DEFAULT_ACCENT),
  );

  const user = BUYER_TEAM.find((m) => m.id === userId) ?? BUYER_TEAM[0];
  const role = user.role;
  const permissions = BUYER_ROLE_PERMISSIONS[role];

  const setUser = React.useCallback((id: string) => {
    setUserIdRaw(id);
    try { window.localStorage.setItem(LS_USER, id); } catch {}
  }, []);

  const setThemeId = React.useCallback((id: ThemePresetId) => {
    setThemeIdRaw(id);
    try { window.localStorage.setItem(LS_THEME, id); } catch {}
    const preset = THEME_PRESETS.find((t) => t.id === id);
    if (preset) {
      setAccentRaw(preset.accent);
      try { window.localStorage.setItem(LS_ACCENT, preset.accent); } catch {}
    }
  }, []);

  const setAccent = React.useCallback((hex: string) => {
    setAccentRaw(hex);
    try { window.localStorage.setItem(LS_ACCENT, hex); } catch {}
  }, []);

  React.useEffect(() => {
    applyTheme(themeId, accent);
  }, [themeId, accent]);

  const value: BuyerState = React.useMemo(() => ({
    tenant: CURRENT_BUYER_TENANT,
    user,
    role,
    permissions,
    themeId,
    accent,
    setUser,
    setThemeId,
    setAccent,
    hasPermission: (p) => permissions.includes(p),
  }), [user, role, permissions, themeId, accent, setUser, setThemeId, setAccent]);

  return <BuyerCtx.Provider value={value}>{children}</BuyerCtx.Provider>;
}

export function useBuyer() {
  const ctx = React.useContext(BuyerCtx);
  if (!ctx) throw new Error("useBuyer must be used inside <BuyerProvider>");
  return ctx;
}

export function useBuyerRoleLabel() {
  const { role } = useBuyer();
  return BUYER_ROLE_LABELS[role];
}
