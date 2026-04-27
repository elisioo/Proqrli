import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { u as useVendor } from "./vendor-context.js";
import { p as PRODUCTS, q as formatCurrencyDecimal } from "./router.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import { S as Star } from "./star.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./color-utils.js";
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode$1);
const __iconNode = [
  ["path", { d: "M13 21h8", key: "1jsn5i" }],
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const PenLine = createLucideIcon("pen-line", __iconNode);
function StorefrontPage() {
  const {
    tenant,
    hasPermission
  } = useVendor();
  const featured = PRODUCTS.filter((p) => p.status === "Active").slice(0, 4);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Public storefront", title: "Your storefront", description: "What buyers see when they visit your store on the marketplace.", actions: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm hover:border-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "h-4 w-4" }),
        " Preview public"
      ] }),
      hasPermission("storefront:edit") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "h-4 w-4" }),
        " Edit storefront"
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid-bg relative h-48 bg-paper-mid", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-4 left-6 flex items-end gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-sm border-4 border-card bg-foreground font-display text-3xl font-extrabold text-background shadow-lg", children: tenant.companyName[0] }) }),
        tenant.certifiedBadge && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-4 top-4 rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-800", children: "✓ Certified vendor" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-baseline justify-between gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-extrabold tracking-tight", children: tenant.companyName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-base text-muted-foreground", children: tenant.tagline })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "h-4 w-4 fill-amber-400 text-amber-400" }),
            " 4.8 · 124 reviews"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft", children: tenant.storeBio }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest", children: tenant.industry }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest", children: "ISO 9001" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest", children: "SE Asia" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-3", children: "Featured listings" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3 md:grid-cols-4", children: featured.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-2 flex aspect-square items-center justify-center rounded-sm bg-paper-mid text-5xl", children: p.image }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate text-xs font-semibold", children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-base font-extrabold", children: formatCurrencyDecimal(p.price) })
      ] }, p.id)) })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "storefront:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StorefrontPage, {}) });
export {
  SplitComponent as component
};
