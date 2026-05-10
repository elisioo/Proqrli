/* eslint-disable prettier/prettier */
/* eslint-disable no-empty */
// Buyer session context. Mirrors VendorProvider but for the procurement side.
// Supports two modes:
//   1. MOCK — user picked from BUYER_TEAM array (demo / dev without backend)
//   2. REAL — user logged in via /api/auth/login (real DB session)
//
// Detection: if localStorage has "procurli:buyer:realUser" JSON, use REAL mode.
// In REAL mode the BuyerTeamMember is synthesised from the stored AuthUser.

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
import type { AuthUser } from "./api";

// ─── Storage keys ─────────────────────────────────────────────────────────────
const LS_MOCK_USER = "procurli:buyer:userId";
const LS_THEME     = "procurli:buyer:themeId";
const LS_ACCENT    = "procurli:buyer:accent";
/** JSON-serialised AuthUser — set after a real /api/auth/login */
const LS_REAL_USER = "procurli:buyer:realUser";

// ─── Context type ─────────────────────────────────────────────────────────────
type BuyerState = {
  tenant: BuyerTenant;
  user: BuyerTeamMember;
  role: BuyerRole;
  permissions: BuyerPermission[];
  themeId: ThemePresetId;
  accent: string;
  /** true when session comes from the real API, false for mock demo */
  isRealSession: boolean;
  setUser: (id: string) => void;
  setThemeId: (id: ThemePresetId) => void;
  setAccent: (hex: string) => void;
  hasPermission: (p: BuyerPermission) => boolean;
  /** Call after a successful /api/auth/logout to clear real session */
  clearRealSession: () => void;
  /** Manual update of the real user session */
  setRealUser: (au: AuthUser) => void;
  /** Re-fetch the current user profile from /api/auth/me */
  refreshUser: () => Promise<void>;
};

const BuyerCtx = React.createContext<BuyerState | null>(null);

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

/** Build a synthetic BuyerTeamMember from an API AuthUser */
function syntheticMember(au: AuthUser): BuyerTeamMember {
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
    role:       (au.role as BuyerRole) in BUYER_ROLE_PERMISSIONS
                  ? (au.role as BuyerRole)
                  : "buyer_procurement",
    department: au.position || "",
    position:   au.position,
    contactNumber: au.contactNumber,
    active:     true,
    joinedAt:   "",
    initials:   initials || "??",
  };
}

/** Build a synthetic BuyerTenant from an API AuthUser */
function syntheticTenant(au: AuthUser): BuyerTenant {
  return {
    id:            `tnt:${au.tenantId}`,
    companyName:   au.companyName,
    industry:      "",
    contactEmail:  au.email,
    budgetYTD:     0,
    budgetLimit:   0,
    certifiedBadge: false,
  };
}

function applyTheme(themeId: ThemePresetId, accent: string) {
  if (typeof document === "undefined") return;
  const root   = document.documentElement;
  const preset = THEME_PRESETS.find((t) => t.id === themeId);
  root.classList.toggle("dark", preset?.dark ?? false);

  const fg           = readableForeground(accent);
  const { r, g, b }  = hexToRgb(accent);
  const soft         = `rgba(${r}, ${g}, ${b}, 0.12)`;

  root.style.setProperty("--accent-solid",            accent);
  root.style.setProperty("--accent-foreground-solid", fg);
  root.style.setProperty("--accent-soft",             soft);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function BuyerProvider({ children }: { children: React.ReactNode }) {
  // ── Real user state (from API login) ───────────────────────────────────────
  // localStorage is used only as a loading hint (avoids flash of wrong UI).
  // The server cookie is ALWAYS the authoritative source of identity.
  const [realUser, setRealUserState] = React.useState<AuthUser | null>(() => readRealUser());
  const [sessionVerified, setSessionVerified] = React.useState(false);

  // On every mount (including refreshes), verify the session against the server.
  // This prevents stale localStorage from showing the wrong user after switching accounts.
  React.useEffect(() => {
    let cancelled = false;
    import("./api").then(({ authApi }) => {
      authApi.me()
        .then((au) => {
          if (cancelled) return;
          // Server confirmed a valid session — always use server's data
          writeLS(LS_REAL_USER, JSON.stringify(au));
          setRealUserState(au);
          setSessionVerified(true);
        })
        .catch(() => {
          if (cancelled) return;
          // No valid server session — clear any stale localStorage
          removeLS(LS_REAL_USER);
          setRealUserState(null);
          setSessionVerified(true);
        });
    });
    return () => { cancelled = true; };
  // Run once on mount only
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mock user state (demo switcher) ───────────────────────────────────────
  const [mockUserId, setMockUserIdRaw] = React.useState<string>(() =>
    readLS(LS_MOCK_USER, BUYER_TEAM[0].id),
  );

  // ── Theme ─────────────────────────────────────────────────────────────────
  const [themeId, setThemeIdRaw] = React.useState<ThemePresetId>(
    () => readLS(LS_THEME, DEFAULT_THEME_ID) as ThemePresetId,
  );
  const [accent, setAccentRaw] = React.useState<string>(
    () => readLS(LS_ACCENT, DEFAULT_ACCENT),
  );

  // ── Derived user / tenant / role ──────────────────────────────────────────
  const isRealSession = realUser !== null;

  const user: BuyerTeamMember = isRealSession
    ? syntheticMember(realUser!)
    : (BUYER_TEAM.find((m) => m.id === mockUserId) ?? BUYER_TEAM[0]);

  const tenant: BuyerTenant = isRealSession
    ? syntheticTenant(realUser!)
    : CURRENT_BUYER_TENANT;

  const role: BuyerRole = user.role;
  const permissions    = BUYER_ROLE_PERMISSIONS[role] ?? [];

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
  // without prop-drilling (they don't have BuyerCtx access yet at that point).
  React.useEffect(() => {
    (window as unknown as Record<string, unknown>).__buyerSetRealSession = setRealSession;
    return () => {
      delete (window as unknown as Record<string, unknown>).__buyerSetRealSession;
    };
  }, [setRealSession]);

  // ── Theme effect ──────────────────────────────────────────────────────────
  React.useEffect(() => {
    applyTheme(themeId, accent);
  }, [themeId, accent]);

  // ── Context value ─────────────────────────────────────────────────────────
  const value: BuyerState = React.useMemo(
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

  return <BuyerCtx.Provider value={value}>{children}</BuyerCtx.Provider>;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useBuyer() {
  const ctx = React.useContext(BuyerCtx);
  if (!ctx) throw new Error("useBuyer must be used inside <BuyerProvider>");
  return ctx;
}

export function useBuyerRoleLabel() {
  const { role } = useBuyer();
  return BUYER_ROLE_LABELS[role];
}
