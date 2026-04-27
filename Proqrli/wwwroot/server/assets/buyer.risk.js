import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { l as BUYER_VENDORS, k as RISK_ALERTS } from "./router.js";
import { S as ShieldAlert } from "./shield-alert.js";
import { S as ShieldCheck } from "./shield-check.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./buyer-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function RiskPage() {
  const sortedVendors = [...BUYER_VENDORS].sort((a, b) => b.riskScore - a.riskScore);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "ML risk monitoring", title: "Risk & Compliance", description: "Random Forest scoring across delivery performance, quality, financials, and compliance." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", children: "Active alerts" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
          RISK_ALERTS.length,
          " signals"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: RISK_ALERTS.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { className: "px-5 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: a.level === "High" ? "text-rose-600" : "text-amber-600", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldAlert, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-base font-extrabold", children: a.vendorName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: a.level }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] text-muted-foreground", children: a.raisedAt })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-sm font-medium", children: a.signal }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: a.detail })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground", children: "Investigate" })
      ] }) }, a.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", children: "Vendor risk leaderboard" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }),
          " ML model · v2.4"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: sortedVendors.map((v) => {
        const pct = Math.round(v.riskScore * 100);
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-4 flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-sm bg-foreground font-mono text-[11px] font-bold text-background", children: v.initials }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-semibold", children: v.companyName })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-2 font-mono text-xs text-muted-foreground", children: v.category }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 w-full rounded-full bg-paper-mid", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: v.riskClass === "High" ? "h-2 rounded-full bg-rose-500" : v.riskClass === "Medium" ? "h-2 rounded-full bg-amber-500" : "h-2 rounded-full bg-emerald-500", style: {
            width: `${pct}%`
          } }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "col-span-1 font-mono text-xs", children: [
            pct,
            "%"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: v.riskClass }) })
        ] }, v.id);
      }) })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "risk:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RiskPage, {}) });
export {
  SplitComponent as component
};
