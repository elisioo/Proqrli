import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { z as RFQS, Q as QUOTATIONS, m as formatBuyerCurrency } from "./router.js";
import { u as useBuyer } from "./buyer-context.js";
import { c as cn } from "./utils.js";
import { A as Award } from "./award.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function QuotationsPage() {
  const {
    hasPermission
  } = useBuyer();
  const rfqsWithQuotes = RFQS.filter((r) => QUOTATIONS.some((q) => q.rfqRef === r.rfqNumber));
  const [openRfq, setOpenRfq] = reactExports.useState(rfqsWithQuotes[0]?.rfqNumber);
  const quotes = QUOTATIONS.filter((q) => q.rfqRef === openRfq);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Bid evaluation", title: "Quotations", description: "Side-by-side comparison of vendor responses. Award one to auto-create a PO." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: rfqsWithQuotes.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenRfq(r.rfqNumber), className: cn("rounded-sm border px-3 py-2 text-left transition-colors", openRfq === r.rfqNumber ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest opacity-70", children: r.rfqNumber }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: r.title })
    ] }, r.id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Rank" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Vendor" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Total" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Lead time" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Valid until" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: quotes.map((q) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: cn("hover:bg-muted/40", q.rank === 1 && "bg-accent/30"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold", q.rank === 1 ? "bg-foreground text-background" : "border border-border"), children: q.rank }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-medium", children: q.vendorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-base font-extrabold", children: formatBuyerCurrency(q.total) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
          q.leadTimeDays,
          " days"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: q.validUntil }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: q.status }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: q.status !== "Awarded" && hasPermission("quotations:award") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex items-center gap-1 rounded-sm bg-foreground px-3 py-1.5 text-[10px] font-semibold text-background hover:opacity-85", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3" }),
          " Award"
        ] }) })
      ] }, q.id)) })
    ] }) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "quotations:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(QuotationsPage, {}) });
export {
  SplitComponent as component
};
