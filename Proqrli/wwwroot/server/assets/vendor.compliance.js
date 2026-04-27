import { U as jsxRuntimeExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { A as AutoStatus } from "./StatusPill.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { u as useVendor } from "./vendor-context.js";
import { x as COMPLIANCE_DOCS } from "./router.js";
import { U as Upload } from "./upload.js";
import { F as FileText } from "./file-text.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./utils.js";
import "./lock.js";
import "./createLucideIcon.js";
import "./color-utils.js";
function CompliancePage() {
  const {
    hasPermission
  } = useVendor();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Compliance", title: "Documents & certifications", description: "Permits, ISO certs, and BIR / DTI registration. Verified vendors get the Certified Badge.", actions: hasPermission("compliance:upload") && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-4 w-4" }),
      " Upload document"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: COMPLIANCE_DOCS.map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4 rounded-md border border-border bg-card p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-sm bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "h-5 w-5 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-extrabold", children: d.type }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AutoStatus, { status: d.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "truncate font-mono text-[11px] text-muted-foreground", children: d.fileName }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex items-center gap-3 text-[11px] text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Uploaded ",
            d.uploadedAt
          ] }),
          d.expiresAt && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "· Expires ",
            d.expiresAt
          ] })
        ] })
      ] })
    ] }, d.id)) })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "compliance:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CompliancePage, {}) });
export {
  SplitComponent as component
};
