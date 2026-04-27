import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { h as REVIEWS } from "./router.js";
import { S as Star } from "./star.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./vendor-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function ReviewsPage() {
  const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Engage", title: "Reviews", description: "What buyers say about your products and service." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-5xl font-extrabold", children: avg.toFixed(1) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 flex text-amber-400", children: Array.from({
          length: 5
        }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: i < Math.round(avg) ? "h-4 w-4 fill-amber-400" : "h-4 w-4 text-muted" }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
          REVIEWS.length,
          " reviews"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-1", children: [5, 4, 3, 2, 1].map((stars) => {
        const count = REVIEWS.filter((r) => r.rating === stars).length;
        const pct = count / REVIEWS.length * 100;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "w-4 font-mono", children: [
            stars,
            "★"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-2 flex-1 rounded-sm bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full rounded-sm bg-foreground", style: {
            width: `${pct}%`
          } }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-6 font-mono text-muted-foreground", children: count })
        ] }, stars);
      }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: REVIEWS.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-md border border-border bg-card p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: r.initials }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: r.buyerName }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-amber-500", children: "★".repeat(r.rating) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
          "on ",
          r.productName,
          " · ",
          r.at
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm", children: r.text })
      ] })
    ] }) }, r.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "reviews:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReviewsPage, {}) });
export {
  SplitComponent as component
};
