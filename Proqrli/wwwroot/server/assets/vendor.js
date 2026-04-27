import { U as jsxRuntimeExports, r as reactExports, _ as Outlet } from "./worker-entry.js";
import { u as useVendor, V as VendorProvider } from "./vendor-context.js";
import { L as Link, u as useNavigate, R as ROLE_LABELS, T as TEAM_MEMBERS, a as ROLE_DESCRIPTIONS } from "./router.js";
import { u as useLocation, L as LayoutDashboard, F as FileSearch, M as MessageSquare, S as Settings, a as Sheet, b as SheetTrigger, B as Button, c as Menu, d as SheetContent, D as DropdownMenu, e as DropdownMenuTrigger, P as Palette, f as DropdownMenuContent, g as DropdownMenuLabel, h as DropdownMenuSeparator, i as Bell, C as ChevronDown, j as DropdownMenuItem, U as UserCog, k as LogOut } from "./sheet.js";
import { c as cn } from "./utils.js";
import { S as ShoppingCart } from "./shopping-cart.js";
import { F as FileText } from "./file-text.js";
import { P as Package } from "./package.js";
import { S as Store } from "./store.js";
import { T as Truck } from "./truck.js";
import { R as Receipt } from "./receipt.js";
import { W as Wallet } from "./wallet.js";
import { S as ShieldCheck } from "./shield-check.js";
import { U as Users } from "./users.js";
import { S as Star } from "./star.js";
import { T as THEME_PRESETS } from "./color-utils.js";
import { S as Search } from "./search.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon.js";
import "./index3.js";
import "./chevron-right.js";
import "./check.js";
import "./x.js";
const SECTIONS = [
  {
    title: "Sell",
    items: [
      { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard:view" },
      { to: "/vendor/rfqs", label: "RFQ inbox", icon: FileSearch, permission: "rfq:view", badge: 2 },
      { to: "/vendor/orders", label: "Marketplace orders", icon: ShoppingCart, permission: "orders:view", badge: 3 },
      { to: "/vendor/purchase-orders", label: "Purchase orders", icon: FileText, permission: "po:view", badge: 2 },
      { to: "/vendor/products", label: "Product catalogue", icon: Package, permission: "products:view" },
      { to: "/vendor/storefront", label: "Storefront", icon: Store, permission: "storefront:view" }
    ]
  },
  {
    title: "Operate",
    items: [
      { to: "/vendor/deliveries", label: "Deliveries", icon: Truck, permission: "deliveries:view" },
      { to: "/vendor/invoices", label: "Invoices", icon: Receipt, permission: "invoices:view" },
      { to: "/vendor/payouts", label: "Payouts", icon: Wallet, permission: "payouts:view" },
      { to: "/vendor/compliance", label: "Compliance", icon: ShieldCheck, permission: "compliance:view" }
    ]
  },
  {
    title: "Engage",
    items: [
      { to: "/vendor/buyers", label: "Buyers", icon: Users, permission: "buyers:view" },
      { to: "/vendor/messages", label: "Messages", icon: MessageSquare, permission: "messages:view", badge: 3 },
      { to: "/vendor/reviews", label: "Reviews", icon: Star, permission: "reviews:view" }
    ]
  },
  {
    title: "Manage",
    items: [
      { to: "/vendor/settings", label: "Settings", icon: Settings, permission: "settings:view" }
    ]
  }
];
function VendorSidebar({ onNavigate }) {
  const { hasPermission, tenant } = useVendor();
  const { pathname } = useLocation();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex h-full w-full flex-col border-r border-border bg-paper", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-6 py-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendor", onClick: onNavigate, className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-sm bg-foreground text-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-extrabold", children: "P" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-lg font-extrabold tracking-tight", children: [
          "ProqrLi",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 rounded-sm bg-foreground px-1.5 py-[1px] align-super font-mono text-[8px] font-bold uppercase tracking-widest text-background", children: "Vendor" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", children: "Store" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-xs font-medium text-foreground", children: tenant.companyName })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 overflow-y-auto px-3 py-4", children: SECTIONS.map((section) => {
      const visible = section.items.filter((i) => hasPermission(i.permission));
      if (visible.length === 0) return null;
      return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 px-3 t-label", children: section.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-[2px]", children: visible.map((item) => {
          const isActive = item.to === "/vendor" ? pathname === "/vendor" : pathname.startsWith(item.to);
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Link,
            {
              to: item.to,
              onClick: onNavigate,
              className: cn(
                "group flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors",
                isActive ? "bg-foreground text-background" : "text-ink-soft hover:bg-muted hover:text-foreground"
              ),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(item.icon, { className: "h-4 w-4" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 truncate", children: item.label }),
                item.badge != null && /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    className: cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 font-mono text-[10px] font-bold",
                      isActive ? "bg-background/15 text-background" : "bg-accent text-accent-foreground"
                    ),
                    children: item.badge
                  }
                )
              ]
            }
          ) }, item.to);
        }) })
      ] }, section.title);
    }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-t border-border bg-paper-mid px-4 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-2", children: "Your risk score" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-2xl font-extrabold", children: tenant.riskClass }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "rounded-sm border border-emerald-300 bg-emerald-50 px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800", children: [
          "ML · ",
          (tenant.riskScore * 100).toFixed(0),
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[11px] leading-snug text-muted-foreground", children: "Keep on-time delivery above 92% to maintain Low risk." })
    ] })
  ] });
}
function VendorTopbar() {
  const { user, role, setUser, themeId, setThemeId, accent, setAccent } = useVendor();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-paper/85 px-4 backdrop-blur md:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Sheet, { open: mobileOpen, onOpenChange: setMobileOpen, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "ghost", size: "icon", className: "md:hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-5 w-5" }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(SheetContent, { side: "left", className: "w-[280px] p-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VendorSidebar, { onNavigate: () => setMobileOpen(false) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden w-full max-w-md md:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "search",
            placeholder: "Search orders, products, buyers...",
            className: "h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors focus:border-foreground"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "outline", size: "sm", className: "h-10 gap-2 px-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "span",
            {
              className: "h-3 w-3 rounded-full border border-border",
              style: { background: accent }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: "Theme" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-[280px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "font-mono text-[10px] uppercase tracking-widest", children: "Preset themes" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-1 p-1", children: THEME_PRESETS.map((p) => {
            const active = themeId === p.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setThemeId(p.id),
                className: cn(
                  "flex items-center gap-3 rounded-sm border p-2 text-left transition-colors",
                  active ? "border-foreground bg-muted" : "border-transparent hover:bg-muted"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: "h-8 w-8 flex-shrink-0 rounded-sm border border-border",
                      style: { background: p.accent }
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: p.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-[11px] text-muted-foreground", children: p.description })
                  ] }),
                  active && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-2 rounded-full bg-foreground" })
                ]
              },
              p.id
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 block font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: "Custom accent" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "color",
                  value: accent,
                  onChange: (e) => setAccent(e.target.value),
                  className: "h-9 w-12 cursor-pointer rounded-sm border border-border bg-transparent p-0"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: accent,
                  onChange: (e) => setAccent(e.target.value),
                  className: "h-9 flex-1 rounded-sm border border-border bg-card px-2 font-mono text-xs uppercase outline-none focus:border-foreground"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-[11px] text-muted-foreground", children: [
              "Save your preferred accent in ",
              /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor/settings", className: "underline", children: "Settings → Theme" }),
              "."
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "icon", className: "relative h-10 w-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "h-5 w-5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "flex h-10 items-center gap-2 rounded-sm px-2.5 transition-colors hover:bg-muted", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: user.initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden text-left md:block", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold leading-tight", children: user.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: ROLE_LABELS[role] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "h-4 w-4 text-muted-foreground" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuContent, { align: "end", className: "w-[300px]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuLabel, { className: "font-mono text-[10px] uppercase tracking-widest", children: "Switch demo user (RBAC)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-[280px] overflow-y-auto p-1", children: TEAM_MEMBERS.filter((m) => m.active).map((m) => {
            const active = m.id === user.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                onClick: () => setUser(m.id),
                className: cn(
                  "flex w-full items-start gap-3 rounded-sm border p-2 text-left transition-colors",
                  active ? "border-foreground bg-muted" : "border-transparent hover:bg-muted"
                ),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: m.initials }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold", children: m.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-accent px-1.5 py-[1px] font-mono text-[9px] font-bold uppercase tracking-widest text-accent-foreground", children: ROLE_LABELS[m.role] })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] leading-snug text-muted-foreground", children: ROLE_DESCRIPTIONS[m.role] })
                  ] })
                ]
              },
              m.id
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DropdownMenuSeparator, {}),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate({ to: "/vendor/settings" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(UserCog, { className: "mr-2 h-4 w-4" }),
            " Account settings"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(DropdownMenuItem, { onClick: () => navigate({ to: "/" }), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "mr-2 h-4 w-4" }),
            " Sign out"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function VendorLayout() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(VendorProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full bg-paper text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden w-[260px] flex-shrink-0 md:block", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-y-0 w-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VendorSidebar, {}) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-w-0 flex-1 flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(VendorTopbar, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 px-4 py-6 md:px-8 md:py-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) })
    ] })
  ] }) });
}
export {
  VendorLayout as component
};
