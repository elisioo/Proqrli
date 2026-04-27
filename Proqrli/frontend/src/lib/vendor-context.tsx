/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
// Vendor session context — holds the current TENANT_USER, their role, and theme.
// In a real backend this would come from `auth.uid()` + `user_roles` + `tenant_user`.
// Here it's persisted to localStorage so the role/theme survive reloads.

import * as React from "react";
import {
  ROLE_LABELS,
  ROLE_PERMISSIONS,
  TEAM_MEMBERS,
  CURRENT_TENANT,
  type Permission,
  type TeamMember,
  type VendorRole,
  type VendorTenant,
} from "./mock-data";
import {
  DEFAULT_ACCENT,
  DEFAULT_THEME_ID,
  THEME_PRESETS,
  type ThemePresetId,
} from "./themes";
import { hexToRgb, readableForeground } from "./color-utils";

type VendorState = {
  tenant: VendorTenant;
  user: TeamMember;
  role: VendorRole;
  permissions: Permission[];
  themeId: ThemePresetId;
  accent: string;
  setUser: (id: string) => void;
  setThemeId: (id: ThemePresetId) => void;
  setAccent: (hex: string) => void;
  hasPermission: (p: Permission) => boolean;
};

const VendorCtx = React.createContext<VendorState | null>(null);

const LS_USER = "procurli:vendor:userId";
const LS_THEME = "procurli:vendor:themeId";
const LS_ACCENT = "procurli:vendor:accent";

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
  // Soft tint for hover / badges.
  const soft = `rgba(${r}, ${g}, ${b}, 0.12)`;

  root.style.setProperty("--accent-solid", accent);
  root.style.setProperty("--accent-foreground-solid", fg);
  root.style.setProperty("--accent-soft", soft);
}

export function VendorProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdRaw] = React.useState<string>(() =>
    readLS(LS_USER, TEAM_MEMBERS[0].id),
  );
  const [themeId, setThemeIdRaw] = React.useState<ThemePresetId>(
    () => readLS(LS_THEME, DEFAULT_THEME_ID) as ThemePresetId,
  );
  const [accent, setAccentRaw] = React.useState<string>(() =>
    readLS(LS_ACCENT, DEFAULT_ACCENT),
  );

  const user =
    TEAM_MEMBERS.find((m) => m.id === userId) ?? TEAM_MEMBERS[0];
  const role = user.role;
  const permissions = ROLE_PERMISSIONS[role];

  const setUser = React.useCallback((id: string) => {
    setUserIdRaw(id);
    try { window.localStorage.setItem(LS_USER, id); } catch { /* empty */ }
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

  const value: VendorState = React.useMemo(() => ({
    tenant: CURRENT_TENANT,
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

  return <VendorCtx.Provider value={value}>{children}</VendorCtx.Provider>;
}

export function useVendor() {
  const ctx = React.useContext(VendorCtx);
  if (!ctx) throw new Error("useVendor must be used inside <VendorProvider>");
  return ctx;
}

export function useRoleLabel() {
  const { role } = useVendor();
  return ROLE_LABELS[role];
}
