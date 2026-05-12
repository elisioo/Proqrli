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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
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
import { useVendor } from "@/lib/vendor-context";
import type { Permission } from "@/lib/mock-data";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
};

type NavSection = { title: string; items: NavItem[] };

const SECTIONS: NavSection[] = [
  {
    title: "Sell",
    items: [
      { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
      { to: "/vendor/rfqs", label: "RFQ inbox", icon: FileSearch, permission: "rfq:view" },
      { to: "/vendor/orders", label: "Marketplace orders", icon: ShoppingCart, permission: "orders:view" },
      { to: "/vendor/purchase-orders", label: "Purchase orders", icon: FileText, permission: "po:view" },
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
      { to: "/vendor/messages", label: "Messages", icon: MessageSquare, permission: "messages:view" },
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
  const { hasPermission, tenant, user } = useVendor();
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
          <Link to="/vendor" onClick={handleNavigate} className="flex items-center gap-2 min-w-0">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-sm bg-foreground text-background">
              <span className="font-display text-sm font-extrabold">P</span>
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight truncate group-data-[collapsible=icon]:hidden">
              ProqrLi
              <span className="ml-1 rounded-sm bg-foreground px-1.5 py-[1px] align-super font-mono text-[8px] font-bold uppercase tracking-widest text-background">
                Vendor
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
                      item.to === "/vendor"
                        ? pathname === "/vendor"
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
          <span className="t-label">Store</span>
          <span className="truncate text-xs font-medium text-foreground">{tenant.companyName}</span>
        </div>
        <div className="mt-1 truncate text-[11px] text-muted-foreground">
          {user.email}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
