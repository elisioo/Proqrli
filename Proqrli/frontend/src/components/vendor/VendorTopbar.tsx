/* eslint-disable prettier/prettier */
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, LogOut, Palette, Search, UserCog } from "lucide-react";
import { useVendor } from "@/lib/vendor-context";
import { TEAM_MEMBERS, ROLE_LABELS, ROLE_DESCRIPTIONS } from "@/lib/mock-data";
import { authApi } from "@/lib/api";
import { THEME_PRESETS } from "@/lib/themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function VendorTopbar() {
  const { user, role, setUser, themeId, setThemeId, accent, setAccent, isRealSession, clearRealSession } = useVendor();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    if (isRealSession) {
      try { await authApi.logout(); } catch { /* ignore */ }
    }
    try {
      window.localStorage.removeItem("procurli:vendor:realUser");
      window.localStorage.removeItem("procurli:vendor:userId");
    } catch { /* ignore */ }
    clearRealSession();
    navigate({ to: "/login" });
  };

  const { state, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-paper/85 px-4 backdrop-blur md:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        {(isMobile || state === "collapsed") && (
          <SidebarTrigger className="-ml-1" />
        )}

        {/* Search */}
        <div className="relative hidden w-full max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search orders, products, buyers..."
            className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">

        {/* Theme picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-2 px-3">
              <span
                className="h-3 w-3 rounded-full border border-border"
                style={{ background: accent }}
              />
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[280px]">
          <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest">
            Preset themes
          </DropdownMenuLabel>
          <div className="grid grid-cols-1 gap-1 p-1">
            {THEME_PRESETS.map((p) => {
              const active = themeId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setThemeId(p.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-sm border p-2 text-left transition-colors",
                    active ? "border-foreground bg-muted" : "border-transparent hover:bg-muted",
                  )}
                >
                  <span
                    className="h-8 w-8 flex-shrink-0 rounded-sm border border-border"
                    style={{ background: p.accent }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="truncate text-[11px] text-muted-foreground">{p.description}</div>
                  </div>
                  {active && <div className="h-2 w-2 rounded-full bg-foreground" />}
                </button>
              );
            })}
          </div>
          <DropdownMenuSeparator />
          <div className="p-2">
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Custom accent
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded-sm border border-border bg-transparent p-0"
              />
              <input
                type="text"
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="h-9 flex-1 rounded-sm border border-border bg-card px-2 font-mono text-xs uppercase outline-none focus:border-foreground"
              />
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              Save your preferred accent in <Link to="/vendor/settings" className="underline">Settings → Theme</Link>.
            </p>
          </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        </Button>

        {/* Role / user */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 items-center gap-2 rounded-sm px-2.5 transition-colors hover:bg-muted">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                {user.initials}
              </span>
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold leading-tight">{user.name}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {ROLE_LABELS[role]}
                </div>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[300px]">
            {/* Real session badge */}
            {isRealSession && (
              <>
                <div className="px-3 py-2">
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-[11px] text-muted-foreground">{user.email}</div>
                  <div className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                    {ROLE_LABELS[role]}
                  </div>
                </div>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Demo user-switcher (mock mode only) */}
            {!isRealSession && (
              <>
                <DropdownMenuLabel className="font-mono text-[10px] uppercase tracking-widest">
                  Switch demo user (RBAC)
                </DropdownMenuLabel>
                <div className="max-h-[280px] overflow-y-auto p-1">
                  {TEAM_MEMBERS.filter((m) => m.active).map((m) => {
                    const active = m.id === user.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setUser(m.id)}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-sm border p-2 text-left transition-colors",
                          active ? "border-foreground bg-muted" : "border-transparent hover:bg-muted",
                        )}
                      >
                        <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                          {m.initials}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-sm font-semibold">{m.name}</span>
                            <span className="rounded-sm bg-accent px-1.5 py-[1px] font-mono text-[9px] font-bold uppercase tracking-widest text-accent-foreground">
                              {ROLE_LABELS[m.role]}
                            </span>
                          </div>
                          <div className="text-[11px] leading-snug text-muted-foreground">
                            {ROLE_DESCRIPTIONS[m.role]}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem onClick={() => navigate({ to: "/vendor/settings" })}>
              <UserCog className="mr-2 h-4 w-4" /> Account settings
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleSignOut}
              className="text-rose-600 focus:text-rose-600"
            >
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
