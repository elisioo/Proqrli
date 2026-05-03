/* eslint-disable prettier/prettier */
import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ShoppingCart,
  FileText,
  FileSearch,
  Package,
  Store,
  Truck,
  Receipt,
  Wallet,
  ShieldCheck,
  Users,
  MessageSquare,
  Star,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVendor } from "@/lib/vendor-context";
import type { Permission } from "@/lib/mock-data";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  badge?: string | number;
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Sell",
    items: [
      { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
      { to: "/vendor/rfqs", label: "RFQ inbox", icon: FileSearch, permission: "rfq:view", badge: 2 },
      { to: "/vendor/orders", label: "Marketplace orders", icon: ShoppingCart, permission: "orders:view", badge: 3 },
      { to: "/vendor/purchase-orders", label: "Purchase orders", icon: FileText, permission: "po:view", badge: 2 },
      { to: "/vendor/products", label: "Product catalogue", icon: Package, permission: "products:view" },
      { to: "/vendor/storefront", label: "Storefront", icon: Store, permission: "storefront:view" },
    ],
  },
  {
    title: "Operate",
    items: [
      { to: "/vendor/deliveries", label: "Deliveries", icon: Truck, permission: "deliveries:view" },
      { to: "/vendor/invoices", label: "Invoices", icon: Receipt, permission: "invoices:view" },
      { to: "/vendor/payouts", label: "Payouts", icon: Wallet, permission: "payouts:view" },
      { to: "/vendor/compliance", label: "Compliance", icon: ShieldCheck, permission: "compliance:view" },
    ],
  },
  {
    title: "Engage",
    items: [
      { to: "/vendor/buyers", label: "Buyers", icon: Users, permission: "buyers:view" },
      { to: "/vendor/messages", label: "Messages", icon: MessageSquare, permission: "messages:view", badge: 3 },
      { to: "/vendor/reviews", label: "Reviews", icon: Star, permission: "reviews:view" },
    ],
  },
  {
    title: "Manage",
    items: [
      { to: "/vendor/settings", label: "Settings", icon: Settings, permission: "settings:view" },
    ],
  },
];

export function VendorSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission, tenant } = useVendor();
  const { pathname } = useLocation();

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-paper">
      {/* Brand */}
      <div className="border-b border-border px-6 py-5">
        <Link to="/vendor" onClick={onNavigate} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-foreground text-background">
            <span className="font-display text-sm font-extrabold">P</span>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            ProqrLi
            <span className="ml-1 rounded-sm bg-foreground px-1.5 py-[1px] align-super font-mono text-[8px] font-bold uppercase tracking-widest text-background">
              Vendor
            </span>
          </span>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="t-label">Store</span>
          <span className="truncate text-xs font-medium text-foreground">{tenant.companyName}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {SECTIONS.map((section) => {
          const visible = section.items.filter((i) => hasPermission(i.permission));
          if (visible.length === 0) return null;
          return (
            <div key={section.title} className="mb-6">
              <div className="mb-2 px-3 t-label">{section.title}</div>
              <ul className="space-y-[2px]">
                {visible.map((item) => {
                  const isActive =
                    item.to === "/vendor"
                      ? pathname === "/vendor"
                      : pathname.startsWith(item.to);
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={onNavigate}
                        className={cn(
                          "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                          isActive
                            ? "bg-foreground text-background"
                            : "text-ink-soft hover:bg-muted hover:text-foreground",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge != null && (
                          <span
                            className={cn(
                              "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold",
                              isActive
                                ? "bg-background/15 text-background"
                                : "bg-accent text-accent-foreground",
                            )}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {/* Risk badge footer */}
      <div className="border-t border-border bg-paper-mid px-4 py-4">
        <div className="t-label mb-2">Your risk score</div>
        <div className="flex items-center justify-between">
          <span className="font-display text-2xl font-extrabold">{tenant.riskClass}</span>
          <span className="rounded-sm border border-emerald-300 bg-emerald-50 px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
            ML · {(tenant.riskScore * 100).toFixed(0)}%
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          Keep on-time delivery above 92% to maintain Low risk.
        </p>
      </div>
    </aside>
  );
}
