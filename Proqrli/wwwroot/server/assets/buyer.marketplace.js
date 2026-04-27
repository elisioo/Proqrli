import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { N as MARKETPLACE_PRODUCTS, m as formatBuyerCurrency, O as MARKETPLACE_CATEGORIES } from "./router.js";
import { c as cn } from "./utils.js";
import { S as ShoppingCart } from "./shopping-cart.js";
import { S as Search } from "./search.js";
import { S as Star } from "./star.js";
import { T as Truck } from "./truck.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./buyer-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function MarketplacePage() {
  const [cat, setCat] = reactExports.useState("All");
  const [q, setQ] = reactExports.useState("");
  const [cart, setCart] = reactExports.useState({});
  const filtered = MARKETPLACE_PRODUCTS.filter((p) => (cat === "All" || p.category === cat) && (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase())));
  const addToCart = (id) => setCart((c) => ({
    ...c,
    [id]: (c[id] ?? 0) + 1
  }));
  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);
  const cartTotal = MARKETPLACE_PRODUCTS.reduce((s, p) => s + (cart[p.id] ?? 0) * p.price, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Source from accredited vendors", title: "Marketplace", description: "Browse the catalogue, add items to your draft requisition, and request quotations.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ShoppingCart, { className: "h-4 w-4" }),
      " Cart (",
      cartCount,
      ") · ",
      formatBuyerCurrency(cartTotal)
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative md:w-[360px]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search SKU, product name…", className: "h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: MARKETPLACE_CATEGORIES.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCat(c), className: cn("rounded-sm border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors", cat === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"), children: c }, c)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: filtered.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-32 items-center justify-center rounded-sm bg-paper-mid text-6xl", children: p.image }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: p.sku }),
        !p.inStock && /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: "Out of stock" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-1 line-clamp-2 text-sm font-semibold", children: p.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 text-xs text-muted-foreground", children: p.vendorName }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-3 w-3 fill-amber-400 text-amber-400" }),
          p.rating
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Truck, { className: "h-3 w-3" }),
          p.leadTimeDays,
          "d"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-end justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-extrabold", children: formatBuyerCurrency(p.price) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: [
            "/ ",
            p.uom
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !p.inStock, onClick: () => addToCart(p.id), className: "rounded-sm bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-30", children: cart[p.id] ? `In cart · ${cart[p.id]}` : "Add" })
      ] })
    ] }, p.id)) }),
    filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground", children: "No products match your filters. Try clearing the search." })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "marketplace:browse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MarketplacePage, {}) });
export {
  SplitComponent as component
};
