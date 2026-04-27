import { U as jsxRuntimeExports } from "./worker-entry.js";
import { c as cn } from "./utils.js";
function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      eyebrow && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "t-label mb-3 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-px w-6 bg-ink-muted" }),
        eyebrow
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold tracking-tight md:text-4xl", children: title }),
      description && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-foreground md:text-base", children: description })
    ] }),
    actions && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap items-center gap-2", children: actions })
  ] });
}
export {
  PageHeader as P
};
