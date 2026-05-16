/* eslint-disable prettier/prettier */
import { Link, useLocation } from "@tanstack/react-router";
import {
    LayoutDashboard,
    Building2,
    UsersRound,
    Store,
    Boxes,
    ScrollText,
    ServerCog,
    Settings,
    ShieldCheck,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: LucideIcon };
type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
    {
        title: "Overview",
        items: [
            { to: "/admin", label: "Control plane", icon: LayoutDashboard },
        ],
    },
    {
        title: "Tenants",
        items: [
            { to: "/admin/tenants", label: "Organizations", icon: Building2 },
            { to: "/admin/users", label: "Users & roles", icon: UsersRound },
            { to: "/admin/vendors", label: "Vendor registry", icon: Store },
        ],
    },
    {
        title: "Platform",
        items: [
            { to: "/admin/modules", label: "Modules", icon: Boxes },
            { to: "/admin/system", label: "System health", icon: ServerCog },
            { to: "/admin/audit", label: "Audit log", icon: ScrollText },
        ],
    },
    {
        title: "Manage",
        items: [
            { to: "/admin/settings", label: "Platform settings", icon: Settings },
        ],
    },
];

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
    const { pathname } = useLocation();

    return (
        <aside className="flex h-full w-full flex-col border-r border-foreground/15 bg-foreground text-background">
            {/* Brand */}
            <div className="border-b border-paper/10 px-6 py-5">
                <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-paper text-foreground">
                        <span className="font-display text-sm font-extrabold">P</span>
                    </span>
                    <span className="font-display text-lg font-extrabold tracking-tight">
                        ProcurLi
                        <span className="ml-1 rounded-sm bg-paper px-1.5 py-[1px] align-super font-mono text-[8px] font-bold uppercase tracking-widest text-foreground">
                            Admin
                        </span>
                    </span>
                </Link>
                <div className="mt-3 flex items-center gap-2 text-[11px] text-paper/45">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="font-mono uppercase tracking-[0.14em]">Platform owner</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
                {SECTIONS.map((section) => (
                    <div key={section.title} className="mb-6">
                        <div className="mb-2 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/40">
                            {section.title}
                        </div>
                        <ul className="space-y-[2px]">
                            {section.items.map((item) => {
                                const isActive =
                                    item.to === "/admin"
                                        ? pathname === "/admin"
                                        : pathname.startsWith(item.to);
                                return (
                                    <li key={item.to}>
                                        <Link
                                            to={item.to}
                                            onClick={onNavigate}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                                                isActive
                                                    ? "bg-paper text-foreground"
                                                    : "text-paper/70 hover:bg-paper/10 hover:text-paper",
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span className="flex-1 truncate">{item.label}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            <div className="border-t border-paper/10 bg-foreground px-4 py-4">
                <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/35">
                    Build
                </div>
                <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-display text-base font-extrabold text-paper">v1.0.0</span>
                    <span className="font-mono text-[10px] text-paper/40">edge · prod</span>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-paper/55">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    All systems nominal
                </div>
            </div>
        </aside>
    );
}
