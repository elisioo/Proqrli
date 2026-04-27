import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { A as AutoStatus } from "./StatusPill.js";
import { G as GOODS_RECEIPTS } from "./router.js";
import { u as useBuyer } from "./buyer-context.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function ReceiptsPage() {
  const {
    hasPermission
  } = useBuyer();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Inbound", title: "Goods receipts (GRN)", description: "Record what was received against each PO. Inspect, accept, or flag discrepancies.", actions: hasPermission("receipts:create") && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: "+ Record receipt" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3", children: GOODS_RECEIPTS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: g.grnNumber }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-lg font-extrabold", children: g.vendorName }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-1 text-xs text-muted-foreground", children: [
            "PO ",
            g.poRef,
            " · received by ",
            g.receivedBy,
            " on ",
            g.receivedAt
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: g.status }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 font-mono text-xs text-muted-foreground", children: [
            g.itemCount,
            " items"
          ] })
        ] })
      ] }),
      g.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: "Note:" }),
        " ",
        g.notes
      ] })
    ] }, g.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "receipts:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ReceiptsPage, {}) });
export {
  SplitComponent as component
};
