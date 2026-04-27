import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { U as Route, L as Link, g as formatCurrency } from "./router.js";
import { P as PageHeader } from "./PageHeader.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { u as useVendor } from "./vendor-context.js";
import { c as cn } from "./utils.js";
import { A as ArrowLeft } from "./arrow-left.js";
import { C as Calendar } from "./calendar.js";
import { C as Clock } from "./clock.js";
import { F as FileText } from "./file-text.js";
import { S as ShieldCheck } from "./shield-check.js";
import { T as Trophy } from "./trophy.js";
import { S as Send } from "./send.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function RFQDetail() {
  const rfq = Route.useLoaderData();
  const {
    hasPermission
  } = useVendor();
  const canRespond = hasPermission("rfq:respond");
  const [lineQuotes, setLineQuotes] = reactExports.useState(() => rfq.lines.map((l) => ({
    unitPrice: l.targetPrice ?? 0,
    qty: l.qty
  })));
  const [leadTime, setLeadTime] = reactExports.useState(rfq.myQuote?.leadTimeDays ?? 7);
  const [validity, setValidity] = reactExports.useState(30);
  const total = lineQuotes.reduce((s, l) => s + l.unitPrice * l.qty, 0);
  const [draft, setDraft] = reactExports.useState("");
  const [thread, setThread] = reactExports.useState(rfq.thread);
  const sendMessage = () => {
    if (!draft.trim()) return;
    setThread((t) => [...t, {
      from: "vendor",
      text: draft,
      at: "Now"
    }]);
    setDraft("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendor/rfqs", className: "inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
      " RFQ inbox"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: `From ${rfq.buyerName}`, title: rfq.title, description: `RFQ ${rfq.rfqNumber} · ${rfq.category}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: rfq.status }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }), label: "Received", value: rfq.receivedAt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }), label: "Closes", value: rfq.closesAt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }), label: "Lines", value: `${rfq.lines.length}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShieldCheck, { className: "h-3 w-3" }), label: "Competitors", value: `${rfq.competingVendors} vendors` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-md border border-border bg-card", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-muted px-5 py-3 t-label", children: "Requested items" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2", children: "SKU" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2", children: "Description" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Qty" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2", children: "UoM" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Target" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Your unit price" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Line total" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: rfq.lines.map((line, i) => {
              const lq = lineQuotes[i];
              return /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: line.sku ?? "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: line.description }),
                  line.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: line.notes })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono", children: line.qty }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: line.uom }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-xs text-muted-foreground", children: line.targetPrice ? formatCurrency(line.targetPrice) : "—" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: lq.unitPrice, disabled: !canRespond || rfq.status === "Awarded" || rfq.status === "Lost", onChange: (e) => setLineQuotes((arr) => arr.map((it, idx) => idx === i ? {
                  ...it,
                  unitPrice: Number(e.target.value)
                } : it)), className: "h-8 w-24 rounded-sm border border-border bg-background px-2 text-right font-mono text-xs outline-none focus:border-foreground disabled:opacity-60" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-sm font-bold", children: formatCurrency(lq.unitPrice * lq.qty) })
              ] }, i);
            }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("tfoot", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-muted", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest", children: "Quote total" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-display text-lg font-extrabold", children: formatCurrency(total) })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-md border border-border bg-card p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-3", children: "Quote terms" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Lead time (days)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: leadTime, disabled: !canRespond, onChange: (e) => setLeadTime(Number(e.target.value)), className: "h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Quote valid (days)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: validity, disabled: !canRespond, onChange: (e) => setValidity(Number(e.target.value)), className: "h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Payment terms", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { disabled: !canRespond, className: "h-10 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground disabled:opacity-60", defaultValue: "Net30", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "COD" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net15" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { children: "Net45" })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-col items-end gap-2", children: [
            rfq.myQuote && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "t-label flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-3 w-3" }),
              " Last submitted ",
              rfq.myQuote.submittedAt,
              rfq.myQuote.rank && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                "· Currently rank #",
                rfq.myQuote.rank
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { disabled: !canRespond || rfq.status === "Awarded" || rfq.status === "Lost", className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-5 text-sm font-semibold text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50", children: [
              rfq.myQuote ? "Update quotation" : "Submit quotation",
              " · ",
              formatCurrency(total)
            ] }),
            !canRespond && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] text-muted-foreground", children: "Your role can view RFQs but cannot submit quotes." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "flex flex-col overflow-hidden rounded-md border border-border bg-card", style: {
        height: "calc(100vh - 240px)",
        minHeight: 500
      }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border bg-muted px-4 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Private discussion" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background", children: rfq.buyerInitials }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold", children: rfq.buyerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Only you and this buyer can see this thread" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-3 overflow-y-auto p-4", children: thread.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", m.from === "vendor" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("max-w-[85%] rounded-md px-3 py-2 text-sm", m.from === "vendor" ? "bg-foreground text-background" : "bg-muted"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: m.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-1 text-[10px]", m.from === "vendor" ? "opacity-60" : "text-muted-foreground"), children: m.at })
        ] }) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && sendMessage(), disabled: !canRespond, className: "h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground disabled:opacity-60", placeholder: "Ask the buyer for clarification…" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: sendMessage, disabled: !canRespond, className: "inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
            " Send"
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Meta({
  icon,
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "t-label flex items-center gap-2", children: [
      icon,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-mono text-sm font-semibold", children: value })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label mb-1.5 block", children: label }),
    children
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "rfq:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RFQDetail, {}) });
export {
  SplitComponent as component
};
