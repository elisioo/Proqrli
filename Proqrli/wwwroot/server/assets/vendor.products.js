import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { A as AutoStatus } from "./StatusPill.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { u as useVendor } from "./vendor-context.js";
import { t as PRODUCT_CATEGORIES, p as PRODUCTS, q as formatCurrencyDecimal } from "./router.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import { S as Search } from "./search.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./color-utils.js";
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode);
function ProductsPage() {
  const {
    hasPermission
  } = useVendor();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Catalogue", title: "Product listings", description: "Manage SKUs, prices, stock and storefront visibility.", actions: hasPermission("products:manage") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "h-4 w-4" }),
      " New listing"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1 min-w-[240px] max-w-md", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-foreground", placeholder: "Search SKU, name..." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1", children: PRODUCT_CATEGORIES.slice(0, 6).map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-8 rounded-sm border border-border bg-card px-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground", children: c }, c)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", children: PRODUCTS.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "group flex flex-col rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-md", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex aspect-square items-center justify-center rounded-sm bg-paper-mid text-6xl", children: p.image }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: p.sku }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-sm font-semibold", children: p.name })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: p.status })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-end justify-between border-t border-border pt-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-xl font-extrabold", children: formatCurrencyDecimal(p.price) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            "/ ",
            p.uom,
            " · stock ",
            p.stock.toLocaleString()
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            p.orders,
            " orders"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            "★ ",
            p.rating || "—"
          ] })
        ] })
      ] })
    ] }, p.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "products:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductsPage, {}) });
export {
  SplitComponent as component
};
