import { Link, useLocation } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuBadge,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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
      { to: "/buyer/inventory", label: "Inventory", icon: Boxes, permission: "inventory:view" },
      { to: "/buyer/requisitions", label: "Requisitions", icon: ClipboardList, permission: "requisitions:view" },
      { to: "/buyer/rfqs", label: "RFQs", icon: FileSearch, permission: "rfq:view" },
      { to: "/buyer/quotations", label: "Quotations", icon: FileSignature, permission: "quotations:view" },
      { to: "/buyer/purchase-orders", label: "Purchase orders", icon: FileText, permission: "po:view" },
      { to: "/buyer/receipts", label: "Goods receipts", icon: PackageCheck, permission: "receipts:view" },
    ],
  },
  {
    title: "Pay",
    items: [
      { to: "/buyer/bills", label: "Bills", icon: Receipt, permission: "bills:view" },
      { to: "/buyer/payments", label: "Payments", icon: Wallet, permission: "payments:view" },
    ],
  },
  {
    title: "Govern",
    items: [
      { to: "/buyer/risk", label: "Risk & Compliance", icon: ShieldAlert, permission: "risk:view" },
      { to: "/buyer/messages", label: "Messages", icon: MessageSquare, permission: "messages:view" },
    ],
  },
  {
    title: "Manage",
    items: [
      { to: "/buyer/settings", label: "Settings", icon: Settings, permission: "settings:view" },
      { to: "/buyer/team", label: "Team", icon: Users, permission: "team:view" },
    ],
  },
];

export function BuyerSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { hasPermission, tenant, user } = useBuyer();
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  const handleNavigate = () => {
    if (onNavigate) onNavigate();
    setOpenMobile(false);
  };

  return (
    <Sidebar className="border-r border-border bg-paper">
      <SidebarHeader className="border-b border-border px-6 py-[18px]">
        <div className="flex items-center justify-between">
          <Link to="/buyer" onClick={handleNavigate} className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-foreground text-background">
              <span className="font-display text-sm font-extrabold">P</span>
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight truncate group-data-[collapsible=icon]:hidden">
              ProqrLi
              <span className="ml-1 rounded-sm bg-foreground px-1.5 py-[1px] align-super font-mono text-[8px] font-bold uppercase tracking-widest text-background">
                Buyer
              </span>
            </span>
          </Link>
          <SidebarTrigger className="group-data-[collapsible=icon]:hidden text-muted-foreground hover:text-foreground" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {SECTIONS.map((section) => {
          const visible = section.items.filter((i) => hasPermission(i.permission));
          if (visible.length === 0) return null;

          return (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel className="t-label">{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visible.map((item) => {
                    const isActive =
                      item.to === "/buyer"
                        ? pathname === "/buyer"
                        : pathname.startsWith(item.to);

                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <Link to={item.to} onClick={handleNavigate} className="flex items-center">
                            <item.icon className="h-4 w-4" />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-paper-mid px-4 py-4 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between">
          <span className="t-label">Workspace</span>
          <span className="truncate text-xs font-medium text-foreground">{tenant.companyName}</span>
        </div>
        <div className="mt-1 truncate text-[11px] text-muted-foreground">
          {user.email}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
