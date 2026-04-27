import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { i as REQUISITIONS, m as formatBuyerCurrency } from "./router.js";
import { u as useBuyer } from "./buyer-context.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function RequisitionsPage() {
  const {
    hasPermission
  } = useBuyer();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Demand intake", title: "Purchase requisitions", description: "Internal requests from departments. Approve, then convert into an RFQ or PO.", actions: hasPermission("requisitions:create") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: "+ New requisition" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "PR #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Requested by" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Dept" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Items" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Amount" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Needed by" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: REQUISITIONS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: r.prNumber }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: r.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.requestedBy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.department }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.itemCount }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-semibold", children: formatBuyerCurrency(r.amount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.neededBy }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: r.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.status === "Pending Approval" && hasPermission("requisitions:approve") && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background", children: "Approve" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-sm border border-border px-2 py-1 text-[10px] font-semibold", children: "Reject" })
        ] }) })
      ] }, r.id)) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "requisitions:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RequisitionsPage, {}) });
export {
  SplitComponent as component
};
