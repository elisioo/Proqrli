import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { l as BUYER_VENDORS, m as formatBuyerCurrency } from "./router.js";
import { S as Star } from "./star.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./buyer-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function VendorsPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Accredited supply base", title: "Vendors", description: "Manage approved vendors, view their ML risk score, and onboard new ones.", actions: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: "+ Invite vendor" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: BUYER_VENDORS.map((v) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-12 w-12 items-center justify-center rounded-sm bg-foreground font-mono text-sm font-bold text-background", children: v.initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-extrabold", children: v.companyName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: v.category })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: v.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-2 gap-3 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Risk" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: v.riskClass }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-[10px] text-muted-foreground", children: [
              (v.riskScore * 100).toFixed(0),
              "%"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Rating" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 inline-flex items-center gap-1 font-semibold", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-amber-400 text-amber-400" }),
            v.rating > 0 ? v.rating.toFixed(1) : "—"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Lifetime spend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-mono text-sm font-semibold", children: formatBuyerCurrency(v.totalSpend) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "On-time" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 font-mono text-sm font-semibold", children: [
            v.onTimeRate,
            "%"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 rounded-sm border border-border bg-card py-2 text-xs font-semibold hover:border-foreground", children: "View profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 rounded-sm bg-foreground py-2 text-xs font-semibold text-background hover:opacity-85", disabled: v.status !== "Accredited", children: "Invite to RFQ" })
      ] })
    ] }, v.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "vendors:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(VendorsPage, {}) });
export {
  SplitComponent as component
};
