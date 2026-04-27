import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { I as INVENTORY, o as getStockState, m as formatBuyerCurrency, L as Link } from "./router.js";
import { P as PageHeader } from "./PageHeader.js";
import { S as StatCard } from "./StatCard.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { u as useBuyer } from "./buyer-context.js";
import { c as cn } from "./utils.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import { B as Boxes } from "./boxes.js";
import { S as ShoppingCart } from "./shopping-cart.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./lock.js";
import "./color-utils.js";
const __iconNode$2 = [
  [
    "path",
    {
      d: "M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",
      key: "e7tb2h"
    }
  ],
  ["path", { d: "m7.5 4.27 9 5.15", key: "1c824w" }],
  ["polyline", { points: "3.29 7 12 12 20.71 7", key: "ousv84" }],
  ["line", { x1: "12", x2: "12", y1: "22", y2: "12", key: "a4e8g8" }],
  ["path", { d: "m17 13 5 5m-5 0 5-5", key: "im3w4b" }]
];
const PackageX = createLucideIcon("package-x", __iconNode$2);
const __iconNode$1 = [
  ["path", { d: "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8", key: "v9h5vc" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }],
  ["path", { d: "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16", key: "3uifl3" }],
  ["path", { d: "M8 16H3v5", key: "1cv678" }]
];
const RefreshCw = createLucideIcon("refresh-cw", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
const TABS = ["All", "Low stock", "Out of stock", "In stock"];
function InventoryPage() {
  const {
    hasPermission
  } = useBuyer();
  const canManage = hasPermission("inventory:manage");
  const [tab, setTab] = reactExports.useState("All");
  const [query, setQuery] = reactExports.useState("");
  const [reorder, setReorder] = reactExports.useState(null);
  const enriched = INVENTORY.map((i) => ({
    ...i,
    state: getStockState(i),
    available: i.onHand
  }));
  const filtered = enriched.filter((i) => (tab === "All" || i.state === tab) && (query === "" || i.name.toLowerCase().includes(query.toLowerCase()) || i.sku.toLowerCase().includes(query.toLowerCase())));
  const lowCount = enriched.filter((i) => i.state === "Low stock").length;
  const outCount = enriched.filter((i) => i.state === "Out of stock").length;
  const inCount = enriched.filter((i) => i.state === "In stock").length;
  const stockValue = enriched.reduce((s, i) => s + i.onHand * i.unitCost, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Warehouse", title: "Inventory", description: "Live stock across all SKUs. Items at or below reorder point trigger an auto-PR suggestion.", actions: canManage && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-semibold hover:bg-muted", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshCw, { className: "h-3 w-3" }),
      " Sync from GRNs"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "In stock", value: inCount, icon: Boxes, delta: `${enriched.length} total SKUs` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Low stock", value: lowCount, icon: TriangleAlert, delta: "Reorder suggested", tone: "accent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Out of stock", value: outCount, icon: PackageX, delta: "Urgent reorder", tone: "ink" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { label: "Stock value", value: formatBuyerCurrency(stockValue), icon: Boxes, delta: "At unit cost" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 border-b border-border", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(t), className: cn("border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors", tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"), children: [
        t,
        t === "Low stock" && lowCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 rounded-full bg-amber-100 px-1.5 text-[9px] text-amber-800", children: lowCount }),
        t === "Out of stock" && outCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1.5 rounded-full bg-rose-100 px-1.5 text-[9px] text-rose-800", children: outCount })
      ] }, t)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: query, onChange: (e) => setQuery(e.target.value), placeholder: "Search SKU or name…", className: "h-10 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground md:w-72" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "SKU" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Item" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Location" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "On hand" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "On order" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Available" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3 text-right", children: "Reorder pt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "divide-y divide-border", children: [
        filtered.map((i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: cn("hover:bg-muted/40", i.state === "Out of stock" && "bg-rose-50/40", i.state === "Low stock" && "bg-amber-50/30"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 font-mono text-xs", children: i.sku }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-medium", children: i.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: i.category })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-xs text-muted-foreground", children: i.location }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-4 py-3 text-right font-mono", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("font-bold", i.state === "Out of stock" && "text-rose-700", i.state === "Low stock" && "text-amber-700"), children: i.onHand }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-muted-foreground", children: [
              " ",
              i.uom
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono", children: i.onOrder > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sky-700", children: [
            "+",
            i.onOrder
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "—" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono font-semibold", children: i.available + i.onOrder }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-right font-mono text-xs text-muted-foreground", children: i.reorderPoint }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: i.state }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: (i.state === "Low stock" || i.state === "Out of stock") && hasPermission("requisitions:create") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setReorder(i), className: "inline-flex h-8 items-center gap-1 rounded-sm bg-foreground px-3 text-[10px] font-semibold uppercase tracking-widest text-background hover:opacity-85", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-3 w-3" }),
            " Reorder"
          ] }) })
        ] }, i.id)),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 9, className: "px-4 py-12 text-center text-sm text-muted-foreground", children: "No matching items." }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] text-muted-foreground", children: [
      "Stock is updated when a Goods Receipt is accepted. ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer/receipts", className: "underline", children: "Open receipts →" })
    ] }),
    reorder && /* @__PURE__ */ jsxRuntimeExports.jsx(ReorderModal, { item: reorder, onClose: () => setReorder(null) })
  ] });
}
function ReorderModal({
  item,
  onClose
}) {
  const [qty, setQty] = reactExports.useState(item.reorderQty);
  const [route, setRoute] = reactExports.useState("po");
  const total = qty * item.unitCost;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: (e) => e.stopPropagation(), className: "w-full max-w-lg overflow-hidden rounded-md border border-border bg-card shadow-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-5 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Auto-prefill Purchase Requisition" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-xl font-extrabold", children: item.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[11px] text-muted-foreground", children: [
        item.sku,
        " · current on hand ",
        item.onHand,
        " ",
        item.uom
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-1", children: "Reorder quantity" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: qty, onChange: (e) => setQty(Number(e.target.value)), className: "h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-1 text-[10px] text-muted-foreground", children: [
            "Suggested: ",
            item.reorderQty,
            " ",
            item.uom
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-1", children: "Estimated total" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 items-center font-display text-xl font-extrabold", children: formatBuyerCurrency(total) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-2", children: "Sourcing route" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRoute("po"), className: cn("rounded-sm border px-3 py-3 text-left text-xs transition-colors", route === "po" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Direct PO" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-[10px] opacity-80", children: [
              "to ",
              item.preferredVendorName
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setRoute("rfq"), className: cn("rounded-sm border px-3 py-3 text-left text-xs transition-colors", route === "rfq" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"), children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: "Open RFQ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-[10px] opacity-80", children: "Invite multiple vendors" })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-end gap-2 border-t border-border bg-muted px-5 py-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "h-9 rounded-sm border border-border bg-card px-3 text-xs font-semibold hover:bg-paper-mid", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: route === "po" ? "/buyer/requisitions" : "/buyer/rfqs", onClick: onClose, className: "inline-flex h-9 items-center gap-1 rounded-sm bg-foreground px-4 text-xs font-semibold text-background hover:opacity-85", children: [
        "Create ",
        route === "po" ? "PR → PO" : "PR → RFQ"
      ] })
    ] })
  ] }) });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "inventory:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryPage, {}) });
export {
  SplitComponent as component
};
