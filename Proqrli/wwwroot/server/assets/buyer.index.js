import { U as jsxRuntimeExports } from "./worker-entry.js";
import { i as REQUISITIONS, j as BUYER_PURCHASE_ORDERS, V as VENDOR_BILLS, k as RISK_ALERTS, l as BUYER_VENDORS, L as Link, m as formatBuyerCurrency, S as SPEND_SERIES, n as SPEND_BY_CATEGORY, I as INVENTORY, o as getStockState } from "./router.js";
import { P as PageHeader } from "./PageHeader.js";
import { S as StatCard } from "./StatCard.js";
import { A as AutoStatus } from "./StatusPill.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { u as useBuyer } from "./buyer-context.js";
import { d as ArrowUpRight, T as TrendingUp, R as ResponsiveContainer, A as AreaChart, C as CartesianGrid, X as XAxis, Y as YAxis, a as Tooltip, b as Area, B as BarChart, c as Bar } from "./AreaChart.js";
import { C as ClipboardList } from "./clipboard-list.js";
import { F as FileText } from "./file-text.js";
import { W as Wallet } from "./wallet.js";
import { S as ShieldAlert } from "./shield-alert.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./color-utils.js";
const __iconNode = [
  ["path", { d: "M16 17h6v-6", key: "t6n2it" }],
  ["path", { d: "m22 17-8.5-8.5-5 5L2 7", key: "x473p" }]
];
const TrendingDown = createLucideIcon("trending-down", __iconNode);
function BuyerDashboard() {
  const {
    user,
    tenant
  } = useBuyer();
  const openPRs = REQUISITIONS.filter((r) => r.status === "Pending Approval").length;
  const openPOs = BUYER_PURCHASE_ORDERS.filter((p) => !["Closed", "Cancelled", "Received"].includes(p.status)).length;
  const billsDue = VENDOR_BILLS.filter((b) => ["Pending", "Approved", "Scheduled", "Overdue"].includes(b.status)).reduce((s, b) => s + b.amount, 0);
  const openRisks = RISK_ALERTS.filter((r) => r.level !== "Low").length;
  const highRiskVendors = BUYER_VENDORS.filter((v) => v.riskClass === "High" && v.status !== "Blocked");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: `Welcome back, ${user.name.split(" ")[0]}`, title: tenant.companyName, description: "A daily snapshot of requisitions, vendors, and cash. Drill in for detail.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/buyer/marketplace", className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: [
      "Browse marketplace ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpRight, { className: "h-4 w-4" })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Open requisitions", value: openPRs, icon: ClipboardList, delta: "+1 vs last week", tone: "default" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Active POs", value: openPOs, icon: FileText, delta: "3 awaiting GRN" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Bills due", value: formatBuyerCurrency(billsDue), icon: Wallet, delta: "2 within 7 days", tone: "ink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Risk alerts", value: openRisks, icon: ShieldAlert, delta: "1 high · 2 medium", tone: "accent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-end justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Spend trend · last 6 months" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-2xl font-extrabold", children: formatBuyerCurrency(SPEND_SERIES.reduce((s, m) => s + m.spend, 0)) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-800", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "h-3 w-3" }),
            " +17.6%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-[260px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AreaChart, { data: SPEND_SERIES, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("defs", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("linearGradient", { id: "sp", x1: "0", y1: "0", x2: "0", y2: "1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "0%", stopColor: "var(--accent-solid)", stopOpacity: 0.45 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("stop", { offset: "100%", stopColor: "var(--accent-solid)", stopOpacity: 0 })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border-tone)", vertical: false }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { dataKey: "month", tick: {
            fontSize: 11,
            fontFamily: "var(--font-mono)"
          }, stroke: "var(--ink-muted)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { tick: {
            fontSize: 11,
            fontFamily: "var(--font-mono)"
          }, stroke: "var(--ink-muted)", tickFormatter: (v) => `${(v / 1e3).toFixed(0)}k` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            borderRadius: 4,
            fontSize: 12,
            border: "1px solid var(--border-tone)",
            background: "var(--card)"
          }, formatter: (v) => formatBuyerCurrency(v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Area, { dataKey: "spend", stroke: "var(--accent-solid)", strokeWidth: 2, fill: "url(#sp)" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-2", children: "Top categories" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-2xl font-extrabold", children: "By spend" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4 h-[230px]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(BarChart, { data: SPEND_BY_CATEGORY, layout: "vertical", margin: {
          left: 8
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(XAxis, { type: "number", hide: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(YAxis, { dataKey: "category", type: "category", tick: {
            fontSize: 10,
            fontFamily: "var(--font-mono)"
          }, stroke: "var(--ink-muted)", width: 88 }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { contentStyle: {
            borderRadius: 4,
            fontSize: 12,
            border: "1px solid var(--border-tone)",
            background: "var(--card)"
          }, formatter: (v) => formatBuyerCurrency(v) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Bar, { dataKey: "spend", fill: "var(--accent-solid)", radius: [0, 2, 2, 0] })
        ] }) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", children: "Pending requisitions" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer/requisitions", className: "text-xs font-semibold underline-offset-4 hover:underline", children: "View all →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: REQUISITIONS.filter((r) => r.status === "Pending Approval" || r.status === "Approved").slice(0, 4).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: r.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
              r.prNumber,
              " · ",
              r.requestedBy
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-xs font-semibold", children: formatBuyerCurrency(r.amount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: r.status })
          ] })
        ] }, r.id)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", children: "Risk alerts" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer/risk", className: "text-xs font-semibold underline-offset-4 hover:underline", children: "Open monitor →" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: RISK_ALERTS.slice(0, 4).map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-5 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: a.vendorName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: a.level })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: a.signal })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "h-4 w-4 flex-shrink-0 text-rose-500" })
        ] }) }, a.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(LowStockSuggestions, {}),
    highRiskVendors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-rose-200 bg-rose-50 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 t-label text-rose-800", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3 w-3" }),
        " High-risk vendors active in your supply chain"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-rose-900", children: [
        highRiskVendors.length,
        " vendor(s) flagged High risk by ML scoring. Review their POs and consider secondary sources."
      ] })
    ] })
  ] });
}
function LowStockSuggestions() {
  const items = INVENTORY.map((i) => ({
    ...i,
    state: getStockState(i)
  })).filter((i) => i.state !== "In stock").sort((a, b) => a.onHand - b.onHand).slice(0, 4);
  if (items.length === 0) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-amber-200 bg-amber-50/60 p-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 t-label text-amber-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-3 w-3" }),
        " Low / out of stock — auto-reorder suggestions"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer/inventory", className: "text-xs font-semibold underline-offset-4 hover:underline", children: "Open inventory →" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-3 grid grid-cols-1 gap-2 md:grid-cols-2", children: items.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-center justify-between rounded-sm border border-border bg-card px-3 py-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: i.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
          i.sku,
          " · on hand ",
          i.onHand,
          " ",
          i.uom
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer/inventory", className: "ml-3 inline-flex h-8 items-center gap-1 rounded-sm bg-foreground px-3 text-[10px] font-semibold uppercase tracking-widest text-background hover:opacity-85", children: "Reorder" })
    ] }, i.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "dashboard:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerDashboard, {}) });
export {
  SplitComponent as component
};
