import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { A as AutoStatus } from "./StatusPill.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { y as BUYERS, g as formatCurrency } from "./router.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./vendor-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function BuyersPage() {
  const pending = BUYERS.filter((b) => b.status === "Pending");
  const approved = BUYERS.filter((b) => b.status === "Approved");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Accreditation", title: "Buyer connections", description: "Buyers who have requested or been approved to procure from you." }),
    pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-xl font-extrabold mb-3", children: [
        "Pending requests ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 rounded-sm bg-amber-100 px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest text-amber-800", children: pending.length })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: pending.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: b.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: b.companyName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
            b.industry,
            " · applied ",
            b.appliedAt
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-8 rounded-sm bg-foreground px-3 text-xs font-medium text-background hover:opacity-85", children: "Approve" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-8 rounded-sm border border-border bg-card px-3 text-xs hover:border-foreground", children: "Reject" })
          ] })
        ] })
      ] }, b.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-extrabold mb-3", children: "Approved buyers" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Buyer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Industry" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Orders" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Total spend" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Since" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: approved.map((b) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background", children: b.initials }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: b.companyName })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: b.industry }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: b.orderCount }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono font-semibold", children: formatCurrency(b.totalSpend) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: b.appliedAt }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: b.status }) })
        ] }, b.id)) })
      ] }) })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "buyers:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BuyersPage, {}) });
export {
  SplitComponent as component
};
