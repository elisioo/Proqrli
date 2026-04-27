import { U as jsxRuntimeExports } from "./worker-entry.js";
import { f as REVENUE_SERIES, L as Link, g as formatCurrency, h as REVIEWS, M as MARKETPLACE_ORDERS, P as PURCHASE_ORDERS } from "./router.js";
import { P as PageHeader } from "./PageHeader.js";
import { S as StatCard } from "./StatCard.js";
import { A as AutoStatus } from "./StatusPill.js";
import { u as useVendor } from "./vendor-context.js";
import { P as Package } from "./package.js";
import { T as TrendingUp, R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, a as Tooltip, b as Area, B as BarChart, c as Bar, d as ArrowUpRight } from "./AreaChart.js";
import { S as ShoppingCart } from "./shopping-cart.js";
import { W as Wallet } from "./wallet.js";
import { C as CircleAlert } from "./circle-alert.js";
import { S as Star } from "./star.js";
import { T as Truck } from "./truck.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./color-utils.js";
import "./createLucideIcon.js";
function DashboardPage() {
  const {
    user,
    tenant
  } = useVendor();
  const recentOrders = MARKETPLACE_ORDERS.slice(0, 5);
  const recentPOs = PURCHASE_ORDERS.slice(0, 4);
  const totalRevenue = REVENUE_SERIES.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = REVENUE_SERIES.reduce((s, d) => s + d.orders, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: `Welcome back, ${user.name.split(" ")[0]}`, title: tenant.companyName, description: "Here's what's happening across your storefront and procurement orders today.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor/products", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "h-4 w-4" }),
      " Add product"
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Revenue (14d)", value: formatCurrency(totalRevenue), delta: "+12.4% vs prior", icon: TrendingUp }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Orders (14d)", value: totalOrders, delta: "+8 vs prior", icon: ShoppingCart }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending payouts", value: formatCurrency(16830), delta: "Next: Apr 28", icon: Wallet }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "ML Risk score", value: tenant.riskClass, delta: `${(tenant.riskScore * 100).toFixed(0)}% probability`, icon: CircleAlert, tone: "ink" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Revenue" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-extrabold", children: "Last 14 days" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800", children: "+12.4%" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[260px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: REVENUE_SERIES, margin: {
          left: -20,
          right: 8,
          top: 8
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "rev", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--accent-solid)", stopOpacity: 0.35 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--accent-solid)", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false, strokeDasharray: "2 4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: {
            fontSize: 11,
            fill: "var(--color-ink-muted)"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
            fontSize: 11,
            fill: "var(--color-ink-muted)"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            fontSize: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { type: "monotone", dataKey: "revenue", stroke: "var(--accent-solid)", strokeWidth: 2, fill: "url(#rev)" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-extrabold", children: "Daily volume" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[260px] w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: REVENUE_SERIES, margin: {
          left: -20,
          right: 8,
          top: 8
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { stroke: "var(--color-border)", vertical: false, strokeDasharray: "2 4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "day", tick: {
            fontSize: 10,
            fill: "var(--color-ink-muted)"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
            fontSize: 11,
            fill: "var(--color-ink-muted)"
          }, axisLine: false, tickLine: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
            borderRadius: 6,
            fontSize: 12
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "orders", fill: "var(--accent-solid)", radius: [3, 3, 0, 0] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Marketplace" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold", children: "Recent orders" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendor/orders", className: "inline-flex items-center gap-1 text-sm font-medium hover:underline", children: [
            "View all ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: recentOrders.map((o) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-muted-foreground", children: o.orderNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: o.buyerName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: o.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold", children: formatCurrency(o.total) })
          ] })
        ] }, o.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Procurement" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold", children: "Incoming purchase orders" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendor/purchase-orders", className: "inline-flex items-center gap-1 text-sm font-medium hover:underline", children: [
            "View all ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-3.5 w-3.5" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "divide-y divide-border", children: recentPOs.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-3 px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-xs text-muted-foreground", children: p.poNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-medium", children: p.buyerName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: p.status }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-sm font-semibold", children: formatCurrency(p.total) })
          ] })
        ] }, p.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-5 w-5 text-amber-500" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Latest feedback" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold", children: "Buyer reviews" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: REVIEWS.slice(0, 2).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-3 border-l-2 border-foreground pl-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: r.buyerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs text-amber-600", children: "★".repeat(r.rating) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-sm", children: r.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[11px] text-muted-foreground", children: [
            "on ",
            r.productName,
            " · ",
            r.at
          ] })
        ] }) }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-foreground p-5 text-background", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] font-bold uppercase tracking-widest opacity-70", children: "Today" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-2xl font-extrabold leading-tight", children: "3 deliveries in transit" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm opacity-70", children: "2 expected to arrive at buyer sites today. 1 out for delivery." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor/deliveries", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-background px-4 text-sm font-medium text-foreground hover:opacity-85", children: [
          "Track deliveries ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4" })
        ] }) })
      ] })
    ] })
  ] });
}
export {
  DashboardPage as component
};
