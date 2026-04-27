import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { W as Route, X as RFQ_LINES, Y as RFQ_INVITATIONS, Q as QUOTATIONS, Z as RFQ_THREADS, L as Link, m as formatBuyerCurrency } from "./router.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { u as useBuyer } from "./buyer-context.js";
import { c as cn } from "./utils.js";
import { A as ArrowLeft } from "./arrow-left.js";
import { C as Calendar } from "./calendar.js";
import { C as Clock } from "./clock.js";
import { U as Users } from "./users.js";
import { F as FileText } from "./file-text.js";
import { A as Award } from "./award.js";
import { S as Send } from "./send.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function BuyerRFQDetail() {
  const rfq = Route.useLoaderData();
  const {
    hasPermission
  } = useBuyer();
  const canChat = hasPermission("messages:send");
  const lines = RFQ_LINES.filter((l) => l.rfqRef === rfq.rfqNumber);
  const invitations = RFQ_INVITATIONS.filter((i) => i.rfqRef === rfq.rfqNumber);
  const quotes = QUOTATIONS.filter((q) => q.rfqRef === rfq.rfqNumber);
  const [activeVendorId, setActiveVendorId] = reactExports.useState(invitations[0]?.vendorId);
  const activeThread = RFQ_THREADS.find((t) => t.rfqRef === rfq.rfqNumber && t.vendorId === activeVendorId);
  const activeInvite = invitations.find((i) => i.vendorId === activeVendorId);
  const activeQuote = quotes.find((q) => q.vendorId === activeVendorId);
  const [draft, setDraft] = reactExports.useState("");
  const [messages, setMessages] = reactExports.useState(activeThread?.messages ?? []);
  reactExports.useEffect(() => {
    setMessages(activeThread?.messages ?? []);
  }, [activeVendorId, activeThread]);
  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, {
      from: "buyer",
      text: draft,
      at: "Now"
    }]);
    setDraft("");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/buyer/rfqs", className: "inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
      " All RFQs"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: `Sourcing · ${rfq.category}`, title: rfq.title, description: `${rfq.rfqNumber} · derived from ${rfq.prRef}`, actions: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: rfq.status }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "h-3 w-3" }), label: "Created", value: rfq.createdAt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "h-3 w-3" }), label: "Closes", value: rfq.closesAt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Users, { className: "h-3 w-3" }), label: "Invited", value: `${rfq.invitedVendors}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Meta, { icon: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-3 w-3" }), label: "Responses", value: `${rfq.responsesReceived} / ${rfq.invitedVendors}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "overflow-hidden rounded-md border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-muted px-5 py-3 t-label", children: "Requested items" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2", children: "SKU" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2", children: "Description" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Qty" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2", children: "UoM" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Target unit" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-2 text-right", children: "Target total" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: lines.map((l) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: l.sku ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: l.description }),
            l.notes && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-0.5 text-[11px] text-muted-foreground", children: l.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono", children: l.qty }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: l.uom }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-xs", children: l.targetPrice ? formatBuyerCurrency(l.targetPrice) : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-sm font-bold", children: l.targetPrice ? formatBuyerCurrency(l.targetPrice * l.qty) : "—" })
        ] }, l.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "overflow-hidden rounded-md border border-border bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "border-b border-border bg-muted px-4 py-3 t-label", children: "Invited vendors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "divide-y divide-border", children: invitations.map((inv) => {
          const q = quotes.find((qq) => qq.vendorId === inv.vendorId);
          const isActive = inv.vendorId === activeVendorId;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveVendorId(inv.vendorId), className: cn("w-full px-4 py-3 text-left transition-colors hover:bg-muted/60", isActive && "bg-muted"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: inv.vendorName }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
                  "Invited ",
                  inv.invitedAt
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: inv.vendorStatus })
            ] }),
            q && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-bold", children: formatBuyerCurrency(q.total) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: cn("inline-flex h-5 items-center rounded-full px-2 font-mono text-[10px] font-bold", q.rank === 1 ? "bg-foreground text-background" : "border border-border"), children: [
                "Rank #",
                q.rank
              ] })
            ] })
          ] }) }, inv.id);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "flex flex-col overflow-hidden rounded-md border border-border bg-card", style: {
        height: "calc(100vh - 240px)",
        minHeight: 500
      }, children: activeInvite ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: activeInvite.vendorName.split(" ").slice(0, 2).map((w) => w[0]).join("") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: activeInvite.vendorName }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Private thread · only you and this vendor" })
            ] })
          ] }),
          activeQuote && hasPermission("quotations:award") && activeQuote.status !== "Awarded" && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-9 items-center gap-1 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Award, { className: "h-3 w-3" }),
            " Award · ",
            formatBuyerCurrency(activeQuote.total)
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 space-y-3 overflow-y-auto p-5", children: [
          messages.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-center text-xs text-muted-foreground", children: "No messages yet. Start the conversation below." }),
          messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", m.from === "buyer" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("max-w-[75%] rounded-md px-3 py-2 text-sm", m.from === "buyer" ? "bg-foreground text-background" : "bg-muted"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: m.text }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-1 text-[10px]", m.from === "buyer" ? "opacity-60" : "text-muted-foreground"), children: m.at })
          ] }) }, i))
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: draft, onChange: (e) => setDraft(e.target.value), onKeyDown: (e) => e.key === "Enter" && send(), disabled: !canChat, className: "h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground disabled:opacity-60", placeholder: `Ask ${activeInvite.vendorName.split(" ")[0]} a clarification…` }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: send, disabled: !canChat, className: "inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-3 w-3" }),
            " Send"
          ] })
        ] })
      ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-1 items-center justify-center text-sm text-muted-foreground", children: "Select a vendor to start a discussion." }) })
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
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "rfq:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerRFQDetail, {}) });
export {
  SplitComponent as component
};
