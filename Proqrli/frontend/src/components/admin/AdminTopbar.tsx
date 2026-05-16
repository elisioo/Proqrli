/* eslint-disable prettier/prettier */
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bell, LogOut, Search, ShieldCheck } from "lucide-react";
import { authApi, type AuthUser } from "@/lib/api";

export function AdminTopbar() {
    const navigate = useNavigate();
    const [user, setUser] = useState<AuthUser | null>(null);

    useEffect(() => {
        authApi.me().then(setUser).catch(() => setUser(null));
    }, []);

    const handleExit = async () => {
        try {
            await authApi.logout();
        } finally {
            navigate({ to: "/" });
        }
    };

    const name = user?.fullName || user?.email || "Super Admin";
    const role = user?.role || "superadmin";

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-paper/95 px-4 backdrop-blur md:px-8">
            <div className="flex flex-1 items-center gap-3">
                <div className="hidden items-center gap-1.5 rounded-sm border border-foreground/20 bg-foreground px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-paper md:inline-flex">
                    <ShieldCheck className="h-3 w-3" />
                    Restricted area
                </div>
                <div className="relative hidden max-w-md flex-1 md:block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
                    <input
                        type="search"
                        placeholder="Search tenants, users, modules…"
                        className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                </div>
            </div>

            <div className="flex items-center gap-3">
            
                <div className="hidden items-center gap-3 border-l border-border pl-3 md:flex">
                    <div className="text-right">
                        <div className="font-display text-sm font-bold leading-tight">{name}</div>
                        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                            {role}
                        </div>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-sm font-bold text-paper">
                        {name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                    </span>
                </div>
                <button
                    type="button"
                    onClick={handleExit}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-[12px] hover:bg-muted"
                    title="Exit admin"
                >
                    <LogOut className="h-3.5 w-3.5" />
                    Exit
                </button>
            </div>
        </header>
    );
}
