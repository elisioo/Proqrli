import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { S as StatCard } from "./StatCard.js";
import { V as VENDOR_BILLS, m as formatBuyerCurrency } from "./router.js";
import { u as useBuyer } from "./buyer-context.js";
import { C as Clock } from "./clock.js";
import { C as CircleCheck } from "./circle-check.js";
import { C as CircleAlert } from "./circle-alert.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function BillsPage() {
  const {
    hasPermission
  } = useBuyer();
  const pending = VENDOR_BILLS.filter((b) => b.status === "Pending");
  const overdue = VENDOR_BILLS.filter((b) => b.status === "Overdue");
  const dueSoon = VENDOR_BILLS.filter((b) => ["Approved", "Scheduled"].includes(b.status));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Accounts payable", title: "Bills (vendor invoices)", description: "Inbox of invoices from your vendors. Approve to schedule payment." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Pending approval", value: pending.length, icon: Clock, delta: formatBuyerCurrency(pending.reduce((s, b) => s + b.amount, 0)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Due soon", value: dueSoon.length, icon: CircleCheck, delta: formatBuyerCurrency(dueSoon.reduce((s, b) => s + b.amount, 0)), tone: "ink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Overdue", value: overdue.length, icon: CircleAlert, delta: formatBuyerCurrency(overdue.reduce((s, b) => s + b.amount, 0)), tone: "accent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Bill #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Vendor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "PO Ref" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Received" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Due" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: VENDOR_BILLS.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: b.billNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: b.vendorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-[10px] text-muted-foreground", children: b.poRef }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-semibold", children: formatBuyerCurrency(b.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: b.receivedAt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: b.dueAt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: b.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: b.status === "Pending" && hasPermission("bills:approve") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background", children: "Approve" }) })
      ] }, b.id)) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "bills:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BillsPage, {}) });
export {
  SplitComponent as component
};
