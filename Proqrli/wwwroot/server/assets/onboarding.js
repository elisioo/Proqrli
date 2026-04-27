import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { u as useNavigate, b as Route } from "./router.js";
import { c as cn } from "./utils.js";
import { A as ArrowLeft } from "./arrow-left.js";
import { U as Upload } from "./upload.js";
import { C as Check } from "./check.js";
import { A as ArrowRight } from "./arrow-right.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./createLucideIcon.js";
const VENDOR_CATEGORIES = ["⚙️ Industrial Equipment", "🔩 Hardware & Fasteners", "⚡ Electrical", "🛢️ Chemicals", "🚚 Logistics", "🖥️ IT Equipment", "🏗️ Construction", "🧪 Lab & Safety"];
const BUYER_NEEDS = ["⚙️ Bearings & Mech", "🔩 Fasteners", "🛢️ Chemicals", "🛠️ Hydraulics", "⚡ Electrical", "⛑️ Safety/PPE", "🪨 Raw Materials", "🧴 MRO"];
const SKU_RANGES = ["1–10", "11–25", "26–100", "101–500", "500+"];
const TEAM_RANGES = ["Just me", "2–5", "6–10", "11–25", "25+"];
const VENDOR_PLANS = [{
  id: "free",
  icon: "🌱",
  name: "Free",
  price: "$0",
  note: "No credit card",
  features: ["Storefront", "Up to 25 listings", "Basic metrics"]
}, {
  id: "pro",
  icon: "🔥",
  name: "Seller Pro",
  price: "$49",
  note: "Most popular · 14-day trial",
  features: ["Unlimited listings", "Analytics", "Featured placement", "Priority support"],
  featured: true
}, {
  id: "ent",
  icon: "🏭",
  name: "Enterprise",
  price: "Custom",
  note: "Tailored for volume",
  features: ["Bulk import / API", "ERP integration", "Account manager"]
}];
const BUYER_PLANS = [{
  id: "free",
  icon: "🌱",
  name: "Starter",
  price: "$0",
  note: "14-day free trial",
  features: ["Up to 5 users", "PR/PO workflow", "Basic analytics"]
}, {
  id: "pro",
  icon: "🔥",
  name: "Procurement Pro",
  price: "$79",
  note: "Most popular · billed yearly",
  features: ["Unlimited users", "ML risk scoring", "Real-time dashboards", "PayMongo & Stripe"],
  featured: true
}, {
  id: "ent",
  icon: "🏭",
  name: "Enterprise",
  price: "Custom",
  note: "Tailored for ops",
  features: ["SAP / ERP integration", "Account manager", "On-prem option"]
}];
function OnboardingPage() {
  const navigate = useNavigate();
  const {
    portal = "vendor"
  } = Route.useSearch();
  const [step, setStep] = reactExports.useState(1);
  const isVendor = portal === "vendor";
  const cats = isVendor ? VENDOR_CATEGORIES : BUYER_NEEDS;
  const plans = isVendor ? VENDOR_PLANS : BUYER_PLANS;
  const [category, setCategory] = reactExports.useState(cats[0]);
  const [sku, setSku] = reactExports.useState(SKU_RANGES[2]);
  const [team, setTeam] = reactExports.useState(TEAM_RANGES[1]);
  const [plan, setPlan] = reactExports.useState(null);
  const finish = () => navigate({
    to: isVendor ? "/vendor" : "/buyer"
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-paper p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-3xl overflow-hidden rounded-md border border-border bg-card", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border px-8 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-base font-extrabold", children: [
        "ProcurLi · ",
        isVendor ? "Vendor" : "Buyer",
        " Onboarding"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex gap-2", children: [1, 2, 3, 4].map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("h-2 w-2 rounded-full", n === step ? "scale-150 bg-foreground" : n < step ? "bg-foreground" : "bg-border") }, n)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStep((s) => Math.max(1, s - 1)), disabled: step === 1, className: "inline-flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-30", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-3 w-3" }),
        " Back"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex min-h-[440px] flex-col items-center px-8 py-12 text-center", children: [
      step === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-extrabold", children: isVendor ? "What's your business name?" : "What's your company name?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: isVendor ? "This is the name buyers will see on your vendor storefront." : "We'll use this to brand your procurement workspace." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: isVendor ? "Acme Industrial Supply" : "Pacific Manufacturing Corp", className: "mt-8 h-14 w-full max-w-md rounded-sm border-2 border-border bg-card px-4 text-center text-lg outline-none focus:border-foreground" })
      ] }),
      step === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-extrabold", children: isVendor ? "What do you primarily sell?" : "What do you primarily buy?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: isVendor ? "Pick your main category." : "Pick your top sourcing categories." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3", children: cats.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setCategory(c), className: cn("rounded-sm border-2 px-3 py-3 text-xs font-semibold transition-colors", category === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"), children: c }, c)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-8 font-display text-xl font-extrabold", children: isVendor ? "How many SKUs do you carry?" : "How big is your procurement team?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex flex-wrap justify-center gap-2", children: (isVendor ? SKU_RANGES : TEAM_RANGES).map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => isVendor ? setSku(r) : setTeam(r), className: cn("h-10 rounded-sm border-2 px-4 text-sm font-semibold", (isVendor ? sku : team) === r ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"), children: r }, r)) })
      ] }),
      step === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full max-w-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-extrabold", children: isVendor ? "Upload compliance documents" : "Upload company documents" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: isVendor ? "Verified vendors get a Certified Badge. You can skip and upload later." : "Verified buyers get faster vendor responses. Skip and upload later if needed." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-2 gap-3", children: (isVendor ? ["BIR Certificate", "Business Permit", "ISO / Quality Cert", "Product Catalogue"] : ["BIR Certificate", "Business Permit", "Audited Financials", "Procurement Policy"]).map((d) => /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed border-border bg-paper p-5 text-center hover:border-foreground hover:bg-paper-mid", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "h-5 w-5 text-muted-foreground" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-semibold", children: d }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-muted-foreground", children: "PDF, JPG · max 5MB" })
        ] }, d)) })
      ] }),
      step === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-extrabold", children: "Choose your plan" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Start free. Upgrade anytime." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 grid grid-cols-1 gap-3 md:grid-cols-3", children: plans.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
          setPlan(p.id);
          setTimeout(finish, 250);
        }, className: cn("flex flex-col items-start gap-3 rounded-md border p-5 text-left transition-all hover:shadow-md", p.featured ? "border-foreground" : "border-border", plan === p.id && "ring-2 ring-foreground"), children: [
          p.featured && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-foreground px-2 py-[2px] font-mono text-[9px] font-bold uppercase tracking-widest text-background", children: "Most popular" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-3xl", children: p.icon }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-xl font-extrabold", children: p.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-3xl font-extrabold", children: [
            p.price,
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-base font-normal text-muted-foreground", children: "/mo" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] text-muted-foreground", children: p.note }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "mt-2 space-y-1.5 text-xs", children: p.features.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: "flex items-start gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "mt-[2px] h-3 w-3 text-emerald-600" }),
            " ",
            f
          ] }, f)) })
        ] }, p.id)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border px-8 py-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
        "Step ",
        step,
        " of 4 · ",
        isVendor ? "Vendor" : "Buyer"
      ] }),
      step < 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setStep((s) => Math.min(4, s + 1)), className: "inline-flex h-11 items-center gap-2 rounded-sm bg-foreground px-6 text-sm font-semibold text-background hover:opacity-85", children: [
        "Continue ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
      ] })
    ] })
  ] }) });
}
export {
  OnboardingPage as component
};
