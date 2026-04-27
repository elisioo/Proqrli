import { U as jsxRuntimeExports } from "./worker-entry.js";
import { c as cn } from "./utils.js";
function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
  className
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: cn(
        "flex flex-col gap-3 rounded-md border p-5 transition-shadow hover:shadow-sm",
        tone === "default" && "border-border bg-card",
        tone === "accent" && "border-transparent bg-accent text-accent-foreground",
        tone === "ink" && "border-transparent bg-foreground text-background",
        className
      ),
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "t-label", style: tone !== "default" ? { color: "currentColor", opacity: 0.6 } : void 0, children: label }),
          Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-4 w-4 opacity-60" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-3xl font-extrabold tracking-tight", children: value }),
        delta && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs", style: tone === "default" ? { color: "var(--color-ink-muted)" } : { opacity: 0.7 }, children: delta })
      ]
    }
  );
}
export {
  StatCard as S
};
