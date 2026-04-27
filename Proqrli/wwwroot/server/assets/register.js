import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { u as useNavigate, L as Link } from "./router.js";
import { c as cn } from "./utils.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const VENDOR_TYPES = [{
  id: "supplier",
  label: "Supplier / Manufacturer"
}, {
  id: "distributor",
  label: "Distributor"
}, {
  id: "service",
  label: "Service Provider"
}];
const BUYER_TYPES = [{
  id: "manufacturer",
  label: "Manufacturer"
}, {
  id: "construction",
  label: "Construction / EPC"
}, {
  id: "logistics",
  label: "Logistics / Operator"
}, {
  id: "energy",
  label: "Energy / Mining"
}];
function RegisterPage() {
  const navigate = useNavigate();
  const [portal, setPortal] = reactExports.useState("vendor");
  const types = portal === "vendor" ? VENDOR_TYPES : BUYER_TYPES;
  const [type, setType] = reactExports.useState(types[0].id);
  reactExports.useEffect(() => {
    setType((portal === "vendor" ? VENDOR_TYPES : BUYER_TYPES)[0].id);
  }, [portal]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-screen w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col justify-start overflow-y-auto px-6 py-10 md:w-[46%] md:px-14", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "mb-8 inline-flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-8 w-8 items-center justify-center rounded-sm bg-foreground text-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-extrabold", children: "P" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl font-extrabold tracking-tight", children: "ProcurLi" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 inline-flex gap-1 rounded-sm border border-border bg-paper-mid p-1 self-start", children: ["vendor", "buyer"].map((p) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setPortal(p), className: cn("rounded-sm px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors", portal === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"), children: p === "vendor" ? "I want to sell" : "I want to buy" }, p)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-3xl font-extrabold", children: portal === "vendor" ? "Create your vendor account" : "Create your procurement workspace" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: portal === "vendor" ? "List your products, receive purchase orders, and connect with industrial buyers." : "Source from accredited vendors, run RFQs and POs, and pay bills with full audit trail." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex flex-wrap gap-2", children: types.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setType(t.id), className: `flex-1 min-w-[140px] rounded-sm border-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${type === t.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`, children: t.label }, t.id)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        navigate({
          to: "/onboarding",
          search: {
            portal
          }
        });
      }, className: "mt-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Business name", placeholder: portal === "vendor" ? "Acme Industrial Supply" : "Pacific Manufacturing Corp" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Industry", placeholder: portal === "vendor" ? "Industrial Equipment" : "Heavy Equipment" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Your full name", placeholder: portal === "vendor" ? "Shane Sorono" : "Elena Marquez" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Job title", placeholder: portal === "vendor" ? "Sales Manager" : "Procurement Director" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Business email", placeholder: "you@company.com", type: "email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Password", type: "password", placeholder: "••••••••" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Confirm password", type: "password", placeholder: "••••••••" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-start gap-2 text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "checkbox", required: true, className: "mt-[3px]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "I agree to the ",
            /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { className: "underline", children: [
              portal === "vendor" ? "Vendor" : "Buyer",
              " Terms"
            ] }),
            ", ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "underline", children: "Privacy Policy" }),
            ", and ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "underline", children: "Marketplace Rules" }),
            "."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: "h-12 w-full rounded-sm bg-foreground text-sm font-semibold text-background hover:opacity-85", children: [
          "Create ",
          portal === "vendor" ? "vendor" : "buyer",
          " account →"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Already have an account? ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", className: "font-semibold text-foreground underline-offset-4 hover:underline", children: "Sign in →" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative hidden flex-1 overflow-hidden bg-foreground md:block", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid-bg absolute inset-0 opacity-20" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 flex h-full flex-col justify-end p-12 text-background", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-5xl font-extrabold uppercase leading-none tracking-tight", children: portal === "vendor" ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Sell smarter.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "outline-text", children: "Reach more." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          "Source smarter.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "outline-text", children: "Spend less." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-xs text-sm opacity-60", children: portal === "vendor" ? "Join 500+ vendors growing their industrial business on ProcurLi." : "Join 200+ procurement teams running data-driven sourcing on ProcurLi." })
      ] })
    ] })
  ] });
}
function Field({
  label,
  ...props
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "t-label mb-2 block", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ...props, required: true, className: "h-11 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground" })
  ] });
}
export {
  RegisterPage as component
};
