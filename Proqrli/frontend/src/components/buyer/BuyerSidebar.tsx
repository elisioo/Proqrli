import { Link, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Store,
  Users,
  FileSignature,
  FileSearch,
  ClipboardList,
  FileText,
  PackageCheck,
  Boxes,
  Receipt,
  Wallet,
  ShieldAlert,
  MessageSquare,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuyer } from "@/lib/buyer-context";
import type { BuyerPermission } from "@/lib/buyer-mock-data";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: BuyerPermission;
  badge?: string | number;
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Source",
    items: [
      { to: "/buyer", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
      { to: "/buyer/marketplace", label: "Marketplace", icon: Store, permission: "marketplace:browse" },
      { to: "/buyer/vendors", label: "Vendors", icon: Users, permission: "vendors:view" },
    ],
  },
  {
    title: "Procure",
    items: [
      { to: "/buyer/inventory", label: "Inventory", icon: Boxes, permission: "inventory:view", badge: "!" },
      { to: "/buyer/requisitions", label: "Requisitions", icon: ClipboardList, permission: "requisitions:view", badge: 1 },
      { to: "/buyer/rfqs", label: "RFQs", icon: FileSearch, permission: "rfq:view" },
      { to: "/buyer/quotations", label: "Quotations", icon: FileSignature, permission: "quotations:view", badge: 3 },
      { to: "/buyer/purchase-orders", label: "Purchase orders", icon: FileText, permission: "po:view", badge: 1 },
      { to: "/buyer/receipts", label: "Goods receipts", icon: PackageCheck, permission: "receipts:view" },
    ],
  },
  {
    title: "Pay",
    items: [
      { to: "/buyer/bills", label: "Bills", icon: Receipt, permission: "bills:view", badge: 2 },
      { to: "/buyer/payments", label: "Payments", icon: Wallet, permission: "payments:view" },
    ],
  },
  {
    title: "Govern",
    items: [
      { to: "/buyer/risk", label: "Risk & Compliance", icon: ShieldAlert, permission: "risk:view", badge: 4 },
      { to: "/buyer/messages", label: "Messages", icon: MessageSquare, permission: "messages:view", badge: 3 },
    ],
  },
  {
    title: "Manage",
    items: [
      { to: "/buyer/settings", label: "Settings", icon: Settings, permission: "settings:view" },
    ],
  },
];

export function BuyerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission, tenant } = useBuyer();
  const { pathname } = useLocation();

  const budgetPct = Math.min(100, Math.round((tenant.budgetYTD / tenant.budgetLimit) * 100));

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-paper">
      {/* Brand */}
      <div className="border-b border-border px-6 py-5">
        <Link to="/buyer" onClick={onNavigate} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-foreground text-background">
            <span className="font-display text-sm font-extrabold">P</span>
          </span>
          <span className="font-display text-lg font-extrabold tracking-tight">
            ProqrLi
            <span className="ml-1 rounded-sm bg-foreground px-1.5 py-[1px] align-super font-mono text-[8px] font-bold uppercase tracking-widest text-background">
              Buyer
            </span>
          </span>
        </Link>
        <div className="mt-3 flex items-center justify-between">
          <span className="t-label">Workspace</span>
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
                    item.to === "/buyer"
                      ? pathname === "/buyer"
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

      {/* Budget footer */}
      <div className="border-t border-border bg-paper-mid px-4 py-4">
        <div className="t-label mb-2">YTD Budget</div>
        <div className="flex items-baseline justify-between">
          <span className="font-display text-lg font-extrabold">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(tenant.budgetYTD)}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            of {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(tenant.budgetLimit)}
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-paper-dark">
          <div
            className="h-full bg-foreground transition-all"
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
          {budgetPct}% used · {100 - budgetPct}% remaining this fiscal year.
        </p>
      </div>
    </aside>
  );
}
