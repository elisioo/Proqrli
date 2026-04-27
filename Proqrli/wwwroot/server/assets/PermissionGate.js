import { U as jsxRuntimeExports } from "./worker-entry.js";
import { u as useVendor } from "./vendor-context.js";
import { L as Lock } from "./lock.js";
function PermissionGate({ permission, children, silent }) {
  const { hasPermission, role } = useVendor();
  const perms = Array.isArray(permission) ? permission : [permission];
  const ok = perms.some((p) => hasPermission(p));
  if (ok) return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
  if (silent) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-card p-12 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "h-5 w-5 text-muted-foreground" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-xl font-bold", children: "Access restricted" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 max-w-sm text-sm text-muted-foreground", children: [
      "Your role ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: role.replace("vendor_", "") }),
      " doesn't have access to this section. Ask an Owner or Admin to grant you the right permission."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground", children: [
      "Required: ",
      perms.join(" or ")
    ] })
  ] });
}
export {
  PermissionGate as P
};
