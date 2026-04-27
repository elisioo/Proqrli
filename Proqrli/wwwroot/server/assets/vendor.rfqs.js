import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { s as INCOMING_RFQS, L as Link, g as formatCurrency } from "./router.js";
import { P as PageHeader } from "./PageHeader.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { c as cn } from "./utils.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import { T as Trophy } from "./trophy.js";
import { X } from "./x.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./vendor-context.js";
import "./color-utils.js";
import "./lock.js";
const __iconNode$1 = [
  ["polyline", { points: "22 12 16 12 14 15 10 15 8 12 2 12", key: "o97t9d" }],
  [
    "path",
    {
      d: "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
      key: "oot6mr"
    }
  ]
];
const Inbox = createLucideIcon("inbox", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719",
      key: "1sd12s"
    }
  ]
];
const MessageCircle = createLucideIcon("message-circle", __iconNode);
const TABS = ["All", "New", "Viewed", "Quoted", "Awarded", "Lost"];
function RFQInboxPage() {
  const [tab, setTab] = reactExports.useState("All");
  const filtered = INCOMING_RFQS.filter((r) => tab === "All" || r.status === tab);
  const counts = {
    New: INCOMING_RFQS.filter((r) => r.status === "New").length,
    Quoted: INCOMING_RFQS.filter((r) => r.status === "Quoted").length,
    Awarded: INCOMING_RFQS.filter((r) => r.status === "Awarded").length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Incoming opportunities", title: "RFQ inbox", description: "Buyers send RFQs to invited vendors. Open one to review specs, chat privately with the buyer, and submit your quote." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-3 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "New invitations", value: counts.New, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Inbox, { className: "h-4 w-4" }), tone: "blue" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Quotes submitted", value: counts.Quoted, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(MessageCircle, { className: "h-4 w-4" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SummaryCard, { label: "Awarded YTD", value: counts.Awarded, icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "h-4 w-4" }), tone: "green" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 border-b border-border", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: cn("border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors", tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"), children: t }, t)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "RFQ #" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Buyer" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Title" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Lines" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Closes" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Competition" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Your quote" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        filtered.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-muted/40", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/vendor/rfqs/$rfqId", params: {
            rfqId: r.id
          }, className: "flex items-center gap-2 font-mono text-xs font-semibold underline-offset-4 hover:underline", children: [
            r.rfqNumber,
            r.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9px] font-bold text-background", children: r.unread })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background", children: r.buyerInitials }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium", children: r.buyerName })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: r.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: r.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: r.lines.length }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: r.closesAt }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-mono text-xs", children: [
            r.competingVendors,
            " vendors"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: r.myQuote ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-sm font-bold", children: formatCurrency(r.myQuote.total) }),
            r.myQuote.rank && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("font-mono text-[10px]", r.myQuote.rank === 1 ? "text-emerald-700" : "text-muted-foreground"), children: [
              "Rank #",
              r.myQuote.rank
            ] })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: "— pending —" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: r.status }) })
        ] }, r.id)),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { colSpan: 8, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "mx-auto mb-2 h-5 w-5 opacity-40" }),
          "No RFQs in this state."
        ] }) })
      ] })
    ] }) })
  ] });
}
function SummaryCard({
  label,
  value,
  icon,
  tone = "default"
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-md border border-border bg-card p-4", tone === "blue" && "border-sky-200 bg-sky-50/50", tone === "green" && "border-emerald-200 bg-emerald-50/50"), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "t-label flex items-center gap-2", children: [
      icon,
      " ",
      label
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-display text-3xl font-extrabold", children: value })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "rfq:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RFQInboxPage, {}) });
export {
  SplitComponent as component
};
