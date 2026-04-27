/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ClipboardList,
  Truck,
  Receipt,
  BarChart3,
  FileBadge,
  Package,
  Store,
} from "lucide-react";
import logo from "../assets/logos/logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ProcurLi — Procure smarter. Risk less." },
      {
        name: "description",
        content:
          "ProcurLi is a cloud procurement and vendor management platform for industrial enterprises — from requisition to contract, powered by ML risk intelligence.",
      },
      { property: "og:title", content: "ProcurLi — Procure smarter. Risk less." },
      {
        property: "og:description",
        content:
          "Cloud-based procurement & vendor management for industrial enterprises. ML-driven risk scoring, full procure-to-pay flow.",
      },
    ],
  }),
  component: LandingPage,
});

const MARQUEE_ITEMS = [
  "Vendor Accreditation",
  "Purchase Requisition",
  "Risk Detection AI",
  "Contract Management",
  "Invoice Processing",
  "Logistics Tracking",
  "Compliance Docs",
  "Procurement Analytics",
  "Multi-Tenant SaaS",
];

const FEATURES = [
  {
    num: "01",
    icon: Layers,
    title: "Multi-Tenant Architecture",
    desc: "Each industrial organization operates in its own isolated environment. One platform, infinite tenants — subscriptions managed centrally by Super Admin.",
  },
  {
    num: "02",
    icon: ShieldCheck,
    title: "ML Vendor Risk Engine",
    desc: "Random Forest model classifies vendors as Low, Medium, or High risk in real time — trained on delivery rates, defect rates, contract compliance and pricing variance.",
  },
  {
    num: "03",
    icon: CheckCircle2,
    title: "Approval Workflows",
    desc: "Multi-level purchase requisition approvals with configurable thresholds per cost center. Full audit trail on every decision — who approved, when, and why.",
  },
];

const MODULES = [
  { idx: "01", name: "Vendor Accreditation & Qualification", desc: "Onboard and vet industrial suppliers with compliance documentation, certifications, and capacity ratings.", tag: "Core" },
  { idx: "02", name: "Purchase Requisition & Approval", desc: "Digital requisitions with multi-level approval chains and configurable spending authority limits.", tag: "Core" },
  { idx: "03", name: "Vendor Risk Detection", desc: "Random Forest ML model scores vendor risk with 85%+ accuracy — integrated into the PO workflow.", tag: "AI-Powered" },
  { idx: "04", name: "Contract & Pricing Management", desc: "Manage blanket POs, fixed-price contracts, and price escalation clauses for long-term supply agreements.", tag: "Core" },
  { idx: "05", name: "Procurement Analytics", desc: "Real-time visual reports on spending trends, vendor concentration risk, cost savings, and cycle times.", tag: "Analytics" },
  { idx: "06", name: "Invoice & Payment Processing", desc: "Three-way invoice matching against POs and receipts. Integrated payment disbursements.", tag: "Finance" },
  { idx: "07", name: "Delivery & Logistics Tracking", desc: "Real-time PO status updates. Track delivery confirmations from the vendor portal.", tag: "Operations" },
  { idx: "08", name: "Inventory & Stock Monitoring", desc: "Monitor stock levels per site and trigger reorder points automatically based on procurement history.", tag: "Operations" },
  { idx: "09", name: "Compliance & Document Management", desc: "Store and manage permits, certifications, and policy documents with expiry alerts and audit access.", tag: "Compliance" },
  { idx: "10", name: "Subscription & Tenant Management", desc: "Full SaaS billing — subscription tiers, tenant onboarding, revenue reporting, and account lifecycle.", tag: "SaaS" },
];

const STEPS = [
  { title: "Subscribe & Onboard", text: "Your organization subscribes to a plan. Super Admin activates the tenant and your System Admin configures users, roles, and approval thresholds.", icon: Layers, sub: "Multi-tenant SaaS activation" },
  { title: "Accredit Vendors", text: "Procurement Officers invite vendors through the external portal. Vendors submit documents, certifications, and capacity ratings for qualification.", icon: FileBadge, sub: "Verified supplier base" },
  { title: "Create & Approve Requisitions", text: "Officers raise purchase requisitions. The ML engine flags vendor risk automatically. Managers approve through the multi-level workflow.", icon: ClipboardList, sub: "ML-assisted approvals" },
  { title: "Track, Receive & Pay", text: "POs are sent, deliveries tracked in real time, invoices matched, and payments disbursed — with full audit trails at every step.", icon: Truck, sub: "End-to-end procure-to-pay" },
];

const ROLES = [
  { initials: "Ad", title: "System Admin", perms: ["Manage users & roles", "Configure thresholds", "Access all modules", "Audit trails"] },
  { initials: "PO", title: "Procurement Officer", perms: ["Create requisitions", "Vendor accreditation", "Issue purchase orders", "View risk scores"] },
  { initials: "Mg", title: "Manager", perms: ["Approve requisitions", "Monitor deliveries", "Cost center reports", "Inventory oversight"] },
  { initials: "Fi", title: "Finance", perms: ["Invoice processing", "Payment disbursement", "Expenditure reports", "Tax management"] },
  { initials: "Au", title: "Auditor", perms: ["Read-only access", "Audit trail review", "Compliance reports", "Policy adherence"] },
  { initials: "Vs", title: "Vendor / Supplier", perms: ["Submit accreditation", "Acknowledge POs", "Delivery confirmations", "View risk scores"] },
];

function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const StepIcon = STEPS[activeStep].icon;

  return (
    <div className="min-h-screen bg-paper text-foreground">
      {/* NAV */}
      <nav
        className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-paper-dark bg-paper px-6 py-4 transition-shadow md:px-12 ${
          scrolled ? "shadow-[0_2px_24px_rgba(24,23,20,0.07)]" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-2.5">
          <img className="w-[100px] h-auto" src={logo} alt="ProcurLi Logo"/>
        </Link>

        <ul className="hidden items-center gap-9 md:flex">
          <li><a href="#features" className="text-[13.5px] text-ink-soft hover:text-foreground">Features</a></li>
          <li><a href="#modules" className="text-[13.5px] text-ink-soft hover:text-foreground">Modules</a></li>
          <li><a href="#how" className="text-[13.5px] text-ink-soft hover:text-foreground">How it works</a></li>
          <li><a href="#roles" className="text-[13.5px] text-ink-soft hover:text-foreground">Roles</a></li>
          <li aria-hidden className="h-4 w-px bg-paper-dark" />
          <li>
            <Link to="/vendor" className="text-[13.5px] font-medium text-foreground hover:opacity-70">
              For Vendors
            </Link>
          </li>
        </ul>

        <div className="flex items-center gap-2">
          <Link to="/login">
            <button className="hidden h-10 rounded-sm border border-paper-dark bg-transparent px-4 text-[13.5px] font-medium hover:border-foreground hover:bg-paper-mid sm:inline-block">
              Sign in
            </button>
          </Link>
          <Link to="/vendor">
            <button className="hidden h-10 rounded-sm border border-foreground bg-transparent px-4 text-[13px] font-medium hover:bg-paper-mid lg:inline-block">
              Sell on ProcurLi
            </button>
          </Link>
          <Link to="/register">
            <button className="h-10 rounded-sm bg-foreground px-4 text-[13.5px] font-medium text-background hover:opacity-85">
              Get started
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-20 pt-32 md:px-12 md:pt-36">
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-45"
          style={{
            backgroundImage:
              "linear-gradient(var(--paper-dark) 2px, transparent 2px), linear-gradient(90deg, var(--paper-dark) 2px, transparent 2px)",
            backgroundSize: "64px 64px",
            maskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 70%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.6) 70%, transparent 100%)",
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-6xl">

          <h1 className="max-w-4xl font-display text-[clamp(48px,7vw,96px)] font-extrabold leading-[0.95] tracking-[-0.04em] text-foreground">
            Procure smarter.<br />
            <span className="outline-text">Risk less.</span>
          </h1>

          <p className="mt-8 max-w-xl text-[17px] font-light leading-[1.7] text-ink-soft">
            ProcurLi is a cloud-based procurement and vendor management system built for industrial
            enterprises — from requisition to contract, powered by ML risk intelligence.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link to="/register">
              <button className="inline-flex h-12 items-center gap-2.5 rounded-sm border-2 border-foreground bg-foreground px-9 text-[14.5px] font-medium text-background hover:opacity-85">
                Start free trial <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
            <Link to="/buyer">
              <button className="h-12 rounded-sm border-2 border-paper-dark bg-transparent px-9 text-[14.5px] font-normal text-foreground hover:border-ink-soft">
                View demo
              </button>
            </Link>
          </div>

          <div className="relative z-[1] mt-20 flex flex-wrap justify-center gap-14 border-t border-paper-dark pt-12 opacity-0 animate-[fadeUp_0.7s_0.65s_forwards]">
            {[
              { num: "10+", label: "Procurement modules" },
              { num: "~40%", label: "Cycle time reduction" },
              { num: "85%+", label: "ML risk accuracy" },
              { num: "8", label: "User roles supported" },
            ].map((s) => (
              <div key={s.label} className="min-w-[140px] text-center">
                <div className="font-display text-[34px] font-extrabold leading-none tracking-[-0.03em] text-foreground">
                  {s.num}
                </div>
                <div className="mt-1.5 text-[12.5px] text-ink-muted">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden whitespace-nowrap border-y border-ink-mid bg-foreground py-4">
        <div className="inline-flex animate-[marquee_28s_linear_infinite]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="inline-flex">
              {MARQUEE_ITEMS.map((item, j) => (
                <span
                  key={`${i}-${j}`}
                  className="inline-flex items-center gap-4 px-10 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-paper-mid opacity-70"
                >
                  {item}
                  <span className="text-[10px] text-paper-dark">✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Core capabilities</SectionLabel>
          <SectionTitle>Built for industrial scale.<br />Designed for clarity.</SectionTitle>

          <div className="mt-16 grid overflow-hidden rounded border border-paper-dark md:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.num}
                className={`group relative bg-paper p-10 transition-colors hover:bg-paper-mid ${
                  i < FEATURES.length - 1 ? "border-b border-paper-dark md:border-b-0 md:border-r" : ""
                }`}
              >
                <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-foreground transition-transform group-hover:scale-x-100" />
                <div className="font-display text-[11px] font-bold uppercase tracking-[0.1em] text-ink-muted">
                  {f.num}
                </div>
                <div className="mt-7 flex h-10 w-10 items-center justify-center rounded-sm bg-foreground">
                  <f.icon className="h-5 w-5 text-paper" strokeWidth={1.8} />
                </div>
                <h3 className="mt-6 font-display text-lg font-bold leading-tight tracking-[-0.02em] text-foreground">
                  {f.title}
                </h3>
                <p className="mt-3.5 text-[14px] font-light leading-[1.75] text-ink-soft">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section id="modules" className="bg-foreground px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel inverse>System modules</SectionLabel>
          <h2 className="font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper">
            Everything procurement needs,<br />in one platform.
          </h2>

          <div className="mt-16 grid gap-0.5 md:grid-cols-2">
            {MODULES.map((m) => (
              <div
                key={m.idx}
                className="flex items-start gap-7 rounded-sm border border-ink-mid bg-ink-mid p-9 transition-colors hover:bg-[#252320]"
              >
                <span className="min-w-7 pt-1 font-display text-[11px] font-bold tracking-[0.1em] text-paper/25">
                  {m.idx}
                </span>
                <div>
                  <div className="font-display text-base font-bold tracking-[-0.01em] text-paper">
                    {m.name}
                  </div>
                  <p className="mt-2 text-[13.5px] font-light leading-[1.65] text-paper/45">{m.desc}</p>
                  <span className="mt-3.5 inline-block rounded-sm border border-paper/15 px-2.5 py-1 text-[10.5px] font-medium uppercase tracking-[0.1em] text-paper/35">
                    {m.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>How it works</SectionLabel>
          <SectionTitle>From requisition to payment — fully automated.</SectionTitle>

          <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-20">
            <div className="flex flex-col">
              {STEPS.map((step, i) => (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(i)}
                  className={`flex gap-7 border-b border-paper-dark py-8 text-left transition-colors ${
                    i === 0 ? "border-t" : ""
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-bold transition-all ${
                      activeStep === i
                        ? "border-foreground bg-foreground text-background"
                        : "border-paper-dark text-ink-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-display text-[17px] font-bold tracking-[-0.02em] text-foreground">
                      {step.title}
                    </div>
                    <p className="mt-2 text-[14px] font-light leading-[1.7] text-ink-soft">{step.text}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="sticky top-24 flex min-h-[380px] flex-col items-center justify-center rounded border border-paper-dark bg-paper-mid p-12">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded bg-foreground">
                <StepIcon className="h-9 w-9 text-paper" strokeWidth={1.5} />
              </div>
              <div className="mt-6 text-center font-display text-xl font-extrabold tracking-[-0.03em] text-foreground">
                {STEPS[activeStep].title}
              </div>
              <div className="mt-2.5 text-center text-[13px] font-light text-ink-muted">
                {STEPS[activeStep].sub}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="bg-paper-mid px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto max-w-6xl">
          <SectionLabel>Role-based access</SectionLabel>
          <SectionTitle>The right access,<br />for the right person.</SectionTitle>

          <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => (
              <div
                key={r.title}
                className="rounded-sm border border-paper-dark bg-paper p-8 transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(24,23,20,0.08)]"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full border-2 border-foreground font-display text-sm font-extrabold text-foreground">
                  {r.initials}
                </div>
                <div className="mb-3 font-display text-[15px] font-bold tracking-[-0.01em] text-foreground">
                  {r.title}
                </div>
                <ul className="space-y-0">
                  {r.perms.map((p, i) => (
                    <li
                      key={p}
                      className={`flex items-start gap-2 py-1.5 text-[12.5px] font-light leading-[1.5] text-ink-soft ${
                        i < r.perms.length - 1 ? "border-b border-paper-dark" : ""
                      }`}
                    >
                      <span className="mt-0.5 flex-shrink-0 text-[11px] text-ink-muted">—</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VENDOR CTA SECTION */}
      <section className="bg-foreground px-6 py-24 md:px-12 md:py-32">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-16">
          <div className="min-w-[300px] flex-1">
            <div className="mb-4 inline-block rounded-sm bg-paper/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40">
              Vendor Marketplace
            </div>
            <h2 className="max-w-lg font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper">
              Are you a supplier or manufacturer?
            </h2>
            <p className="mt-4 max-w-md text-[16px] font-light leading-[1.7] text-paper/45">
              Join the ProcurLi vendor marketplace. List your products, receive purchase orders from
              verified industrial buyers, and manage your entire supply-side business — all in one
              dashboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/vendor">
                <button className="rounded-sm border-2 border-paper bg-paper px-8 py-3.5 text-[14px] font-medium text-foreground hover:opacity-85">
                  Open vendor portal
                </button>
              </Link>
              <Link to="/register">
                <button className="rounded-sm border-[1.5px] border-paper/20 bg-transparent px-8 py-3.5 text-[14px] font-normal text-paper/70 hover:border-paper/50 hover:text-paper">
                  Register as vendor
                </button>
              </Link>
            </div>
          </div>

          <div className="min-w-[280px] max-w-md flex-1">
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Store, title: "Your storefront", desc: "Showcase products, certs, and capacity to industrial buyers" },
                { icon: Package, title: "Receive POs", desc: "Get purchase orders from verified, accredited buyers" },
                { icon: Receipt, title: "Get paid faster", desc: "Submit invoices, track payments, manage payouts" },
                { icon: BarChart3, title: "Performance scores", desc: "See your risk score and improve your standing" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="rounded border border-paper/10 bg-paper/5 p-5"
                >
                  <f.icon className="mb-3 h-5 w-5 text-paper/70" strokeWidth={1.6} />
                  <div className="font-display text-[14px] font-bold text-paper">{f.title}</div>
                  <div className="mt-1.5 text-[12.5px] leading-[1.5] text-paper/40">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-6 pb-20 pt-12 md:px-12">
        <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-12 overflow-hidden rounded bg-foreground p-12 md:p-20">
          <span aria-hidden className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-paper/[0.08]" />
          <span aria-hidden className="absolute -right-5 -top-5 h-52 w-52 rounded-full border border-paper/[0.06]" />
          <div className="relative">
            <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-paper/40">
              Ready when you are
            </div>
            <h2 className="font-display text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper">
              Start procuring smarter today.
            </h2>
            <p className="mt-3.5 max-w-sm text-[15px] font-light leading-[1.65] text-paper/55">
              Spin up your tenant in minutes. Configure roles, invite vendors, and run your first
              requisition this week.
            </p>
          </div>
          <div className="relative flex flex-shrink-0 flex-col gap-3">
            <Link to="/buyer">
              <button className="w-full rounded-sm border-2 border-paper bg-paper px-9 py-3.5 text-center text-[14px] font-medium text-foreground hover:opacity-88">
                Open buyer portal
              </button>
            </Link>
            <Link to="/login">
              <button className="w-full rounded-sm border-[1.5px] border-paper/20 bg-transparent px-9 py-3.5 text-center text-[14px] font-normal text-paper/70 hover:border-paper/50 hover:text-paper">
                Sign in
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-paper-dark px-6 py-12 md:px-12">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-background">
            <span className="font-display text-[11px] font-extrabold">P</span>
          </span>
          <span className="font-display text-base font-extrabold tracking-[-0.03em] text-foreground">
            ProcurLi
          </span>
        </div>
        <ul className="flex flex-wrap gap-8">
          <li><a href="#features" className="text-[13px] text-ink-muted hover:text-foreground">Features</a></li>
          <li><a href="#modules" className="text-[13px] text-ink-muted hover:text-foreground">Modules</a></li>
          <li><a href="#roles" className="text-[13px] text-ink-muted hover:text-foreground">Roles</a></li>
          <li><Link to="/vendor" className="text-[13px] text-ink-muted hover:text-foreground">Vendor portal</Link></li>
          <li><Link to="/buyer" className="text-[13px] text-ink-muted hover:text-foreground">Buyer portal</Link></li>
        </ul>
        <div className="text-[12.5px] text-ink-muted">© {new Date().getFullYear()} ProcurLi</div>
      </footer>

      <style>{`
        @keyframes marquee { to { transform: translateX(-50%); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function SectionLabel({ children, inverse = false }: { children: React.ReactNode; inverse?: boolean }) {
  return (
    <div
      className={`mb-5 flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
        inverse ? "text-paper/35" : "text-ink-muted"
      }`}
    >
      <span className={`h-px w-6 ${inverse ? "bg-paper/25" : "bg-ink-muted"}`} />
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="max-w-2xl font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-foreground">
      {children}
    </h2>
  );
}
