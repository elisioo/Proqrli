/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
// Vendor session context — holds the current TENANT_USER, their role, and theme.
// Supports two modes:
//   1. MOCK — user picked from TEAM_MEMBERS array (demo / dev without backend)
//   2. REAL — user logged in via /api/auth/login (real DB session)
//
// Detection: if localStorage has "procurli:vendor:realUser" JSON, use REAL mode.

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
import type { AuthUser } from "./api";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const LS_MOCK_USER = "procurli:vendor:userId";
const LS_THEME     = "procurli:vendor:themeId";
const LS_ACCENT    = "procurli:vendor:accent";
const LS_REAL_USER = "procurli:vendor:realUser";

// ─── Context type ─────────────────────────────────────────────────────────────
type VendorState = {
  tenant: VendorTenant;
  user: TeamMember;
  role: VendorRole;
  permissions: Permission[];
  themeId: ThemePresetId;
  accent: string;
  isRealSession: boolean;
  setUser: (id: string) => void;
  setThemeId: (id: ThemePresetId) => void;
  setAccent: (hex: string) => void;
  hasPermission: (p: Permission) => boolean;
  clearRealSession: () => void;
  setRealUser: (au: AuthUser) => void;
  refreshUser: () => Promise<void>;
};

const VendorCtx = React.createContext<VendorState | null>(null);

// ─── Helpers ──────────────────────────────────────────────────────────────────
function readLS(key: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  try { return window.localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}

function writeLS(key: string, value: string) {
  try { window.localStorage.setItem(key, value); } catch {}
}

function removeLS(key: string) {
  try { window.localStorage.removeItem(key); } catch {}
}

function readRealUser(): AuthUser | null {
  const json = readLS(LS_REAL_USER, "");
  if (!json) return null;
  try { return JSON.parse(json) as AuthUser; } catch { return null; }
}

/** Build a synthetic TeamMember from an API AuthUser */
function syntheticMember(au: AuthUser): TeamMember {
  const initials = au.fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  return {
    id:         `real:${au.userId}`,
    name:       au.fullName || au.email,
    email:      au.email,
    role:       (au.role as VendorRole) in ROLE_PERMISSIONS
                  ? (au.role as VendorRole)
                  : "vendor_owner",
    department: au.position || "",
    active:     true,
    joinedAt:   "",
    initials:   initials || "??",
  };
}

/** Build a synthetic VendorTenant from an API AuthUser */
function syntheticTenant(au: AuthUser): VendorTenant {
  return {
    id:             `tnt:${au.tenantId}`,
    companyName:    au.companyName,
    industry:       "",
    contactEmail:   au.email,
    status:         "Active",
    riskScore:      0,
    riskClass:      "Low",
    storeSlug:      "",
    tagline:        "",
    storeBio:       "",
    certifiedBadge: false,
  };
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

// ─── Provider ─────────────────────────────────────────────────────────────────
export function VendorProvider({ children }: { children: React.ReactNode }) {
  // ── Real user state (from API login) ───────────────────────────────────────
  const [realUser, setRealUserState] = React.useState<AuthUser | null>(() => readRealUser());
  const [sessionVerified, setSessionVerified] = React.useState(false);

  // On every mount, verify the session against the server.
  React.useEffect(() => {
    let cancelled = false;
    import("./api").then(({ authApi }) => {
      authApi.me()
        .then((au) => {
          if (cancelled) return;
          writeLS(LS_REAL_USER, JSON.stringify(au));
          setRealUserState(au);
          setSessionVerified(true);
        })
        .catch(() => {
          if (cancelled) return;
          removeLS(LS_REAL_USER);
          setRealUserState(null);
          setSessionVerified(true);
        });
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mock user state (demo switcher) ───────────────────────────────────────
  const [mockUserId, setMockUserIdRaw] = React.useState<string>(() =>
    readLS(LS_MOCK_USER, TEAM_MEMBERS[0].id),
  );

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [themeId, setThemeIdRaw] = React.useState<ThemePresetId>(
    () => readLS(LS_THEME, DEFAULT_THEME_ID) as ThemePresetId,
  );
  const [accent, setAccentRaw] = React.useState<string>(() =>
    readLS(LS_ACCENT, DEFAULT_ACCENT),
  );

  // ── Derived user / tenant / role ──────────────────────────────────────────
  const isRealSession = realUser !== null;

  const user: TeamMember = isRealSession
    ? syntheticMember(realUser!)
    : (TEAM_MEMBERS.find((m) => m.id === mockUserId) ?? TEAM_MEMBERS[0]);

  const tenant: VendorTenant = isRealSession
    ? syntheticTenant(realUser!)
    : CURRENT_TENANT;

  const role: VendorRole = user.role;
  const permissions = ROLE_PERMISSIONS[role] ?? [];

  // ── Setters ───────────────────────────────────────────────────────────────
  const setUser = React.useCallback((id: string) => {
    setMockUserIdRaw(id);
    writeLS(LS_MOCK_USER, id);
  }, []);

  const setThemeId = React.useCallback((id: ThemePresetId) => {
    setThemeIdRaw(id);
    writeLS(LS_THEME, id);
    const preset = THEME_PRESETS.find((t) => t.id === id);
    if (preset) {
      setAccentRaw(preset.accent);
      writeLS(LS_ACCENT, preset.accent);
    }
  }, []);

  const setAccent = React.useCallback((hex: string) => {
    setAccentRaw(hex);
    writeLS(LS_ACCENT, hex);
  }, []);

  /** Called by login/register success to switch to real-session mode */
  const setRealSession = React.useCallback((au: AuthUser) => {
    writeLS(LS_REAL_USER, JSON.stringify(au));
    setRealUserState(au);
  }, []);

  /** Called after /api/auth/logout */
  const clearRealSession = React.useCallback(() => {
    removeLS(LS_REAL_USER);
    setRealUserState(null);
  }, []);

  // Expose setRealSession globally so login.tsx / register.tsx can call it
  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).__vendorSetRealSession = setRealSession;
    return () => {
      delete (window as unknown as Record<string, unknown>).__vendorSetRealSession;
    };
  }, [setRealSession]);

  // ── Theme effect ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    applyTheme(themeId, accent);
  }, [themeId, accent]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value: VendorState = React.useMemo(
    () => ({
      tenant,
      user,
      role,
      permissions,
      themeId,
      accent,
      isRealSession,
      setUser,
      setThemeId,
      setAccent,
      hasPermission: (p) => permissions.includes(p),
      clearRealSession,
      setRealUser: setRealSession,
      refreshUser: async () => {
        try {
          const { authApi } = await import("./api");
          const au = await authApi.me();
          setRealSession(au);
        } catch (err) {
          console.error("Failed to refresh user:", err);
        }
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenant, user, role, permissions, themeId, accent, isRealSession, setUser, setThemeId, setAccent, clearRealSession, setRealSession],
  );

  return <VendorCtx.Provider value={value}>{children}</VendorCtx.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useVendor() {
  const ctx = React.useContext(VendorCtx);
  if (!ctx) throw new Error("useVendor must be used inside <VendorProvider>");
  return ctx;
}

export function useRoleLabel() {
  const { role } = useVendor();
  return ROLE_LABELS[role];
}
