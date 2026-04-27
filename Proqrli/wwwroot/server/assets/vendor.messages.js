import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { C as CONVERSATIONS } from "./router.js";
import { c as cn } from "./utils.js";
import { P as Pin } from "./pin.js";
import { S as Send } from "./send.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./vendor-context.js";
import "./color-utils.js";
import "./lock.js";
import "./createLucideIcon.js";
function MessagesPage() {
  const [activeId, setActiveId] = reactExports.useState(CONVERSATIONS[0].id);
  const active = CONVERSATIONS.find((c) => c.id === activeId);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-7xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Engage", title: "Messages", description: "Direct conversations with buyers about orders, deliveries, and quotes." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-0 overflow-hidden rounded-md border border-border bg-card md:grid-cols-[320px_1fr]", style: {
      height: "calc(100vh - 280px)",
      minHeight: 480
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-y-auto border-b border-border md:border-b-0 md:border-r", children: CONVERSATIONS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveId(c.id), className: cn("flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted", activeId === c.id && "bg-muted"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: c.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate text-sm font-semibold", children: c.buyerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: c.lastAt })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-xs text-muted-foreground", children: c.preview }),
            c.unread > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9px] font-bold text-background", children: c.unread })
          ] })
        ] }),
        c.pinned && /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "h-3 w-3 text-muted-foreground" })
      ] }, c.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 border-b border-border px-5 py-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background", children: active.initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold", children: active.buyerName }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: "Buyer · accredited" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 space-y-3 overflow-y-auto p-5", children: active.messages.map((m, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("flex", m.from === "vendor" ? "justify-end" : "justify-start"), children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("max-w-[75%] rounded-md px-3 py-2 text-sm", m.from === "vendor" ? "bg-foreground text-background" : "bg-muted"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: m.text }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-1 text-[10px]", m.from === "vendor" ? "opacity-60" : "text-muted-foreground"), children: m.at })
        ] }) }, i)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 border-t border-border p-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { className: "h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground", placeholder: "Type a message..." }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Send, { className: "h-4 w-4" }),
            " Send"
          ] })
        ] })
      ] })
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "messages:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MessagesPage, {}) });
export {
  SplitComponent as component
};
