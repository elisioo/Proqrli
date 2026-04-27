import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { S as StatCard } from "./StatCard.js";
import { A as AutoStatus } from "./StatusPill.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { v as PAYOUTS, g as formatCurrency } from "./router.js";
import { C as Calendar } from "./calendar.js";
import { C as CircleCheck } from "./circle-check.js";
import { W as Wallet } from "./wallet.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./vendor-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function PayoutsPage() {
  const scheduled = PAYOUTS.filter((p) => p.status === "Scheduled").reduce((s, p) => s + p.amount, 0);
  const ytd = PAYOUTS.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Finance", title: "Payouts", description: "PayMongo-disbursed payouts to your bank account." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Next payout", value: formatCurrency(scheduled), delta: "Scheduled Apr 28", icon: Calendar, tone: "ink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Paid this month", value: formatCurrency(ytd), delta: "3 transfers", icon: CircleCheck }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Settlement account", value: "BPI ****4421", delta: "PayMongo gateway", icon: Wallet })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Reference" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Date" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Method" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Invoices" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: PAYOUTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: p.reference }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: p.scheduledFor }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.method }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: p.invoiceCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-semibold", children: formatCurrency(p.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: p.status }) })
      ] }, p.id)) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "payouts:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PayoutsPage, {}) });
export {
  SplitComponent as component
};
