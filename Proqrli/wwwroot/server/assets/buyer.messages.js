import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { B as BuyerPermissionGate } from "./BuyerPermissionGate.js";
import { K as BUYER_CONVERSATIONS } from "./router.js";
import { c as cn } from "./utils.js";
import { P as Pin } from "./pin.js";
import { S as Send } from "./send.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./buyer-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function MessagesPage() {
  const [openId, setOpenId] = reactExports.useState(BUYER_CONVERSATIONS[0].id);
  const open = BUYER_CONVERSATIONS.find((c) => c.id === openId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex h-[calc(100vh-160px)] max-w-7xl gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "hidden w-[320px] flex-shrink-0 overflow-y-auto rounded-md border border-border bg-card md:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border-b border-border px-4 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Conversations" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Search vendor…", className: "mt-2 h-9 w-full rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { children: BUYER_CONVERSATIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setOpenId(c.id), className: cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors", openId === c.id ? "bg-muted" : "hover:bg-muted/40"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: c.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold", children: c.vendorName }),
            c.pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3 text-muted-foreground" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "line-clamp-1 text-xs text-muted-foreground", children: c.preview })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-mono text-[10px] text-muted-foreground", children: c.lastAt }),
          c.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-1 inline-block rounded-full bg-foreground px-2 py-[1px] font-mono text-[10px] font-bold text-background", children: c.unread })
        ] })
      ] }) }, c.id)) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "flex flex-1 flex-col rounded-md border border-border bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "border-b border-border px-5 py-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-extrabold", children: open.vendorName }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label", children: "Vendor · accredited supplier" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-4 overflow-y-auto p-5", children: open.messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", m.from === "buyer" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("max-w-[70%] rounded-md px-4 py-2 text-sm", m.from === "buyer" ? "bg-foreground text-background" : "bg-muted"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { children: m.text }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-1 font-mono text-[10px]", m.from === "buyer" ? "text-background/60" : "text-muted-foreground"), children: m.at })
      ] }) }, i)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { placeholder: "Type a message…", className: "h-10 flex-1 rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85", children: [
          "Send ",
          /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" })
        ] })
      ] }) })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(BuyerPermissionGate, { permission: "messages:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesPage, {}) });
export {
  SplitComponent as component
};
