import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { L as Link } from "./router.js";
import { l as logo } from "./logo.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import { C as ClipboardList } from "./clipboard-list.js";
import { T as Truck } from "./truck.js";
import { A as ArrowRight } from "./arrow-right.js";
import { S as ShieldCheck } from "./shield-check.js";
import { C as CircleCheck } from "./circle-check.js";
import { S as Store } from "./store.js";
import { P as Package } from "./package.js";
import { R as Receipt } from "./receipt.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$2 = [
  ["path", { d: "M3 3v16a2 2 0 0 0 2 2h16", key: "c24i48" }],
  ["path", { d: "M18 17V9", key: "2bz60n" }],
  ["path", { d: "M13 17V5", key: "1frdt8" }],
  ["path", { d: "M8 17v-3", key: "17ska0" }]
];
const ChartColumn = createLucideIcon("chart-column", __iconNode$2);
const __iconNode$1 = [
  [
    "path",
    {
      d: "M13 22h5a2 2 0 0 0 2-2V8a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 14 2H6a2 2 0 0 0-2 2v3.3",
      key: "cvl1xm"
    }
  ],
  ["path", { d: "M14 2v5a1 1 0 0 0 1 1h5", key: "wfsgrz" }],
  [
    "path",
    {
      d: "m7.69 16.479 1.29 4.88a.5.5 0 0 1-.698.591l-1.843-.849a1 1 0 0 0-.879.001l-1.846.85a.5.5 0 0 1-.692-.593l1.29-4.88",
      key: "1ff7gj"
    }
  ],
  ["circle", { cx: "6", cy: "14", r: "3", key: "a1xfv6" }]
];
const FileBadge = createLucideIcon("file-badge", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z",
      key: "zw3jo"
    }
  ],
  [
    "path",
    {
      d: "M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12",
      key: "1wduqc"
    }
  ],
  [
    "path",
    {
      d: "M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17",
      key: "kqbvx6"
    }
  ]
];
const Layers = createLucideIcon("layers", __iconNode);
const MARQUEE_ITEMS = ["Vendor Accreditation", "Purchase Requisition", "Risk Detection AI", "Contract Management", "Invoice Processing", "Logistics Tracking", "Compliance Docs", "Procurement Analytics", "Multi-Tenant SaaS"];
const FEATURES = [{
  num: "01",
  icon: Layers,
  title: "Multi-Tenant Architecture",
  desc: "Each industrial organization operates in its own isolated environment. One platform, infinite tenants — subscriptions managed centrally by Super Admin."
}, {
  num: "02",
  icon: ShieldCheck,
  title: "ML Vendor Risk Engine",
  desc: "Random Forest model classifies vendors as Low, Medium, or High risk in real time — trained on delivery rates, defect rates, contract compliance and pricing variance."
}, {
  num: "03",
  icon: CircleCheck,
  title: "Approval Workflows",
  desc: "Multi-level purchase requisition approvals with configurable thresholds per cost center. Full audit trail on every decision — who approved, when, and why."
}];
const MODULES = [{
  idx: "01",
  name: "Vendor Accreditation & Qualification",
  desc: "Onboard and vet industrial suppliers with compliance documentation, certifications, and capacity ratings.",
  tag: "Core"
}, {
  idx: "02",
  name: "Purchase Requisition & Approval",
  desc: "Digital requisitions with multi-level approval chains and configurable spending authority limits.",
  tag: "Core"
}, {
  idx: "03",
  name: "Vendor Risk Detection",
  desc: "Random Forest ML model scores vendor risk with 85%+ accuracy — integrated into the PO workflow.",
  tag: "AI-Powered"
}, {
  idx: "04",
  name: "Contract & Pricing Management",
  desc: "Manage blanket POs, fixed-price contracts, and price escalation clauses for long-term supply agreements.",
  tag: "Core"
}, {
  idx: "05",
  name: "Procurement Analytics",
  desc: "Real-time visual reports on spending trends, vendor concentration risk, cost savings, and cycle times.",
  tag: "Analytics"
}, {
  idx: "06",
  name: "Invoice & Payment Processing",
  desc: "Three-way invoice matching against POs and receipts. Integrated payment disbursements.",
  tag: "Finance"
}, {
  idx: "07",
  name: "Delivery & Logistics Tracking",
  desc: "Real-time PO status updates. Track delivery confirmations from the vendor portal.",
  tag: "Operations"
}, {
  idx: "08",
  name: "Inventory & Stock Monitoring",
  desc: "Monitor stock levels per site and trigger reorder points automatically based on procurement history.",
  tag: "Operations"
}, {
  idx: "09",
  name: "Compliance & Document Management",
  desc: "Store and manage permits, certifications, and policy documents with expiry alerts and audit access.",
  tag: "Compliance"
}, {
  idx: "10",
  name: "Subscription & Tenant Management",
  desc: "Full SaaS billing — subscription tiers, tenant onboarding, revenue reporting, and account lifecycle.",
  tag: "SaaS"
}];
const STEPS = [{
  title: "Subscribe & Onboard",
  text: "Your organization subscribes to a plan. Super Admin activates the tenant and your System Admin configures users, roles, and approval thresholds.",
  icon: Layers,
  sub: "Multi-tenant SaaS activation"
}, {
  title: "Accredit Vendors",
  text: "Procurement Officers invite vendors through the external portal. Vendors submit documents, certifications, and capacity ratings for qualification.",
  icon: FileBadge,
  sub: "Verified supplier base"
}, {
  title: "Create & Approve Requisitions",
  text: "Officers raise purchase requisitions. The ML engine flags vendor risk automatically. Managers approve through the multi-level workflow.",
  icon: ClipboardList,
  sub: "ML-assisted approvals"
}, {
  title: "Track, Receive & Pay",
  text: "POs are sent, deliveries tracked in real time, invoices matched, and payments disbursed — with full audit trails at every step.",
  icon: Truck,
  sub: "End-to-end procure-to-pay"
}];
const ROLES = [{
  initials: "Ad",
  title: "System Admin",
  perms: ["Manage users & roles", "Configure thresholds", "Access all modules", "Audit trails"]
}, {
  initials: "PO",
  title: "Procurement Officer",
  perms: ["Create requisitions", "Vendor accreditation", "Issue purchase orders", "View risk scores"]
}, {
  initials: "Mg",
  title: "Manager",
  perms: ["Approve requisitions", "Monitor deliveries", "Cost center reports", "Inventory oversight"]
}, {
  initials: "Fi",
  title: "Finance",
  perms: ["Invoice processing", "Payment disbursement", "Expenditure reports", "Tax management"]
}, {
  initials: "Au",
  title: "Auditor",
  perms: ["Read-only access", "Audit trail review", "Compliance reports", "Policy adherence"]
}, {
  initials: "Vs",
  title: "Vendor / Supplier",
  perms: ["Submit accreditation", "Acknowledge POs", "Delivery confirmations", "View risk scores"]
}];
function LandingPage() {
  const [scrolled, setScrolled] = reactExports.useState(false);
  const [activeStep, setActiveStep] = reactExports.useState(0);
  reactExports.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, {
      passive: true
    });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const StepIcon = STEPS[activeStep].icon;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-paper text-foreground", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("nav", { className: `fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-paper-dark bg-paper px-6 py-4 transition-shadow md:px-12 ${scrolled ? "shadow-[0_2px_24px_rgba(24,23,20,0.07)]" : ""}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "flex items-center gap-2.5", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { className: "w-[100px] h-auto", src: logo, alt: "ProcurLi Logo" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "hidden items-center gap-9 md:flex", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "text-[13.5px] text-ink-soft hover:text-foreground", children: "Features" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#modules", className: "text-[13.5px] text-ink-soft hover:text-foreground", children: "Modules" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#how", className: "text-[13.5px] text-ink-soft hover:text-foreground", children: "How it works" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#roles", className: "text-[13.5px] text-ink-soft hover:text-foreground", children: "Roles" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { "aria-hidden": true, className: "h-4 w-px bg-paper-dark" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor", className: "text-[13.5px] font-medium text-foreground hover:opacity-70", children: "For Vendors" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "hidden h-10 rounded-sm border border-paper-dark bg-transparent px-4 text-[13.5px] font-medium hover:border-foreground hover:bg-paper-mid sm:inline-block", children: "Sign in" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "hidden h-10 rounded-sm border border-foreground bg-transparent px-4 text-[13px] font-medium hover:bg-paper-mid lg:inline-block", children: "Sell on ProcurLi" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-10 rounded-sm bg-foreground px-4 text-[13.5px] font-medium text-background hover:opacity-85", children: "Get started" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-20 pt-32 md:px-12 md:pt-36", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none absolute inset-0 z-0 opacity-45", style: {
        backgroundImage: "linear-gradient(var(--paper-dark) 2px, transparent 2px), linear-gradient(90deg, var(--paper-dark) 2px, transparent 2px)",
        backgroundSize: "64px 64px",
        maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 70%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 70%, transparent 100%)"
      } }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mx-auto w-full max-w-6xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "max-w-4xl font-display text-[clamp(48px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-foreground", children: [
          "Procure smarter.",
          /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "outline-text", children: "Risk less." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-8 max-w-xl text-[17px] font-light leading-[1.7] text-ink-soft", children: "ProcurLi is a cloud-based procurement and vendor management system built for industrial enterprises — from requisition to contract, powered by ML risk intelligence." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-12 flex flex-wrap items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { className: "inline-flex h-12 items-center gap-2.5 rounded-sm border-2 border-foreground bg-foreground px-9 text-[14.5px] font-medium text-background hover:opacity-85", children: [
            "Start free trial ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "h-12 rounded-sm border-2 border-paper-dark bg-transparent px-9 text-[14.5px] font-normal text-foreground hover:border-ink-soft", children: "View demo" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative z-[1] mt-20 flex flex-wrap justify-center gap-14 border-t border-paper-dark pt-12 opacity-0 animate-[fadeUp_0.7s_0.65s_forwards]", children: [{
          num: "10+",
          label: "Procurement modules"
        }, {
          num: "~40%",
          label: "Cycle time reduction"
        }, {
          num: "85%+",
          label: "ML risk accuracy"
        }, {
          num: "8",
          label: "User roles supported"
        }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[140px] text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-foreground", children: s.num }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[12.5px] text-ink-muted", children: s.label })
        ] }, s.label)) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden whitespace-nowrap border-y border-ink-mid bg-foreground py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex animate-[marquee_28s_linear_infinite]", children: [...Array(2)].map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "inline-flex", children: MARQUEE_ITEMS.map((item, j) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-4 px-10 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-paper-mid opacity-70", children: [
      item,
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] text-paper-dark", children: "✦" })
    ] }, `${i}-${j}`)) }, i)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "features", className: "px-6 py-24 md:px-12 md:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Core capabilities" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTitle, { children: [
        "Built for industrial scale.",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "Designed for clarity."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid overflow-hidden rounded border border-paper-dark md:grid-cols-3", children: FEATURES.map((f, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `group relative bg-paper p-10 transition-colors hover:bg-paper-mid ${i < FEATURES.length - 1 ? "border-b border-paper-dark md:border-b-0 md:border-r" : ""}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-foreground transition-transform group-hover:scale-x-100" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted", children: f.num }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-7 flex h-10 w-10 items-center justify-center rounded-sm bg-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "h-5 w-5 text-paper", strokeWidth: 1.8 }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mt-6 font-display text-lg font-bold leading-tight tracking-[-0.02em] text-foreground", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3.5 text-[14px] font-light leading-[1.75] text-ink-soft", children: f.desc })
      ] }, f.num)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "modules", className: "bg-foreground px-6 py-24 md:px-12 md:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { inverse: true, children: "System modules" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h2", { className: "font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper", children: [
        "Everything procurement needs,",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "in one platform."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid gap-0.5 md:grid-cols-2", children: MODULES.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-7 rounded-sm border border-ink-mid bg-ink-mid p-9 transition-colors hover:bg-[#252320]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "min-w-7 pt-1 font-display text-[11px] font-bold tracking-[0.1em] text-paper/25", children: m.idx }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-base font-bold tracking-[-0.01em] text-paper", children: m.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[13.5px] font-light leading-[1.65] text-paper/45", children: m.desc }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-3.5 inline-block rounded-sm border border-paper/15 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-paper/35", children: m.tag })
        ] })
      ] }, m.idx)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "how", className: "px-6 py-24 md:px-12 md:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "How it works" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, { children: "From requisition to payment — fully automated." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-16 grid gap-12 md:grid-cols-2 md:gap-20", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col", children: STEPS.map((step, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setActiveStep(i), className: `flex gap-7 border-b border-paper-dark py-8 text-left transition-colors ${i === 0 ? "border-t" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-bold transition-all ${activeStep === i ? "border-foreground bg-foreground text-background" : "border-paper-dark text-ink-muted"}`, children: i + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[17px] font-bold tracking-[-0.02em] text-foreground", children: step.title }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-[14px] font-light leading-[1.7] text-ink-soft", children: step.text })
          ] })
        ] }, step.title)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-24 flex min-h-[380px] flex-col items-center justify-center rounded border border-paper-dark bg-paper-mid p-12", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-[72px] w-[72px] items-center justify-center rounded bg-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StepIcon, { className: "h-9 w-9 text-paper", strokeWidth: 1.5 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 text-center font-display text-xl font-extrabold tracking-[-0.03em] text-foreground", children: STEPS[activeStep].title }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2.5 text-center text-[13px] font-light text-ink-muted", children: STEPS[activeStep].sub })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { id: "roles", className: "bg-paper-mid px-6 py-24 md:px-12 md:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-6xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(SectionLabel, { children: "Role-based access" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(SectionTitle, { children: [
        "The right access,",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", {}),
        "for the right person."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3", children: ROLES.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-sm border border-paper-dark bg-paper p-8 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(24,23,20,0.08)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground font-display text-sm font-extrabold text-foreground", children: r.initials }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 font-display text-[15px] font-bold tracking-[-0.01em] text-foreground", children: r.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-0", children: r.perms.map((p, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { className: `flex items-start gap-2 py-1.5 text-[12.5px] font-light leading-[1.5] text-ink-soft ${i < r.perms.length - 1 ? "border-b border-paper-dark" : ""}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mt-0.5 flex-shrink-0 text-[11px] text-ink-muted", children: "—" }),
          p
        ] }, p)) })
      ] }, r.title)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "bg-foreground px-6 py-24 md:px-12 md:py-32", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-wrap items-center gap-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-[300px] flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 inline-block rounded-sm bg-paper/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40", children: "Vendor Marketplace" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "max-w-lg font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper", children: "Are you a supplier or manufacturer?" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 max-w-md text-[16px] font-light leading-[1.7] text-paper/45", children: "Join the ProcurLi vendor marketplace. List your products, receive purchase orders from verified industrial buyers, and manage your entire supply-side business — all in one dashboard." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-8 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-sm border-2 border-paper bg-paper px-8 py-3.5 text-[14px] font-medium text-foreground hover:opacity-85", children: "Open vendor portal" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-sm border-[1.5px] border-paper/20 bg-transparent px-8 py-3.5 text-[14px] font-normal text-paper/70 hover:border-paper/50 hover:text-paper", children: "Register as vendor" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-w-[280px] max-w-md flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 gap-3", children: [{
        icon: Store,
        title: "Your storefront",
        desc: "Showcase products, certs, and capacity to industrial buyers"
      }, {
        icon: Package,
        title: "Receive POs",
        desc: "Get purchase orders from verified, accredited buyers"
      }, {
        icon: Receipt,
        title: "Get paid faster",
        desc: "Submit invoices, track payments, manage payouts"
      }, {
        icon: ChartColumn,
        title: "Performance scores",
        desc: "See your risk score and improve your standing"
      }].map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded border border-paper/10 bg-paper/5 p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(f.icon, { className: "mb-3 h-5 w-5 text-paper/70", strokeWidth: 1.6 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-[14px] font-bold text-paper", children: f.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1.5 text-[12.5px] leading-[1.5] text-paper/40", children: f.desc })
      ] }, f.title)) }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "px-6 pb-20 pt-12 md:px-12", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-12 overflow-hidden rounded bg-foreground p-12 md:p-20", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute -right-20 -top-20 h-80 w-80 rounded-full border border-paper/[0.08]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { "aria-hidden": true, className: "absolute -right-5 -top-5 h-52 w-52 rounded-full border border-paper/[0.06]" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/40", children: "Ready when you are" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper", children: "Start procuring smarter today." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3.5 max-w-sm text-[15px] font-light leading-[1.65] text-paper/55", children: "Spin up your tenant in minutes. Configure roles, invite vendors, and run your first requisition this week." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex flex-shrink-0 flex-col gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full rounded-sm border-2 border-paper bg-paper px-9 py-3.5 text-center text-[14px] font-medium text-foreground hover:opacity-88", children: "Open buyer portal" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/login", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "w-full rounded-sm border-[1.5px] border-paper/20 bg-transparent px-9 py-3.5 text-center text-[14px] font-normal text-paper/70 hover:border-paper/50 hover:text-paper", children: "Sign in" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "flex flex-wrap items-center justify-between gap-4 border-t border-paper-dark px-6 py-12 md:px-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-[11px] font-extrabold", children: "P" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-base font-extrabold tracking-[-0.03em] text-foreground", children: "ProcurLi" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "flex flex-wrap gap-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#features", className: "text-[13px] text-ink-muted hover:text-foreground", children: "Features" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#modules", className: "text-[13px] text-ink-muted hover:text-foreground", children: "Modules" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: "#roles", className: "text-[13px] text-ink-muted hover:text-foreground", children: "Roles" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/vendor", className: "text-[13px] text-ink-muted hover:text-foreground", children: "Vendor portal" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/buyer", className: "text-[13px] text-ink-muted hover:text-foreground", children: "Buyer portal" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[12.5px] text-ink-muted", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " ProcurLi"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("style", { children: `
        @keyframes marquee { to { transform: translateX(-50%); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` })
  ] });
}
function SectionLabel({
  children,
  inverse = false
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `mb-5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${inverse ? "text-paper/35" : "text-ink-muted"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-px w-6 ${inverse ? "bg-paper/25" : "bg-ink-muted"}` }),
    children
  ] });
}
function SectionTitle({
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "max-w-2xl font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground", children });
}
export {
  LandingPage as component
};
