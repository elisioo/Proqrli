/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import logo from "../assets/logos/logo.png";
import {
    ArrowRight,
    ArrowUpRight,
    Zap,
    Upload,
    ShieldCheck,
    CheckCircle2,
    ClipboardList,
    Truck,
    Receipt,
    BarChart3,
    FileBadge,
    Package,
    Store,
    Layers,
    Boxes,
    Activity,
    AlertTriangle,
    CircleDot,
} from "lucide-react";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "ProcurLi — End-to-end procurement for industrial teams" },
            {
                name: "description",
                content:
                    "Release, secure, and scale your procurement. ProcurLi handles vendor accreditation, RFQs, POs, 3-way invoice matching and ML risk — end-to-end.",
            },
            { property: "og:title", content: "ProcurLi — End-to-end procurement for industrial teams" },
            {
                property: "og:description",
                content:
                    "Cloud procure-to-pay with vendor accreditation, RFQs, POs, 3-way invoice matching and ML-driven vendor risk.",
            },
        ],
    }),
    component: LandingPage,
});

const HERO_TILES = [
    { icon: Upload, title: "Onboard a vendor", desc: "Accredit suppliers in minutes — docs, certs, capacity." },
    { icon: ShieldCheck, title: "Bulletproof your spend", desc: "ML risk scoring on every vendor, every transaction." },
    { icon: Truck, title: "Ship the first PO this week", desc: "Issue, track and reconcile orders end-to-end." },
];

const CUSTOMERS = [
    "Petron Industrial",
    "MERALCO Supply",
    "SteelAsia",
    "San Miguel Foods",
    "Aboitiz Power",
    "URC Manufacturing",
    "Pilmico Mills",
    "Phinma Cement",
];

const FEATURES = [
    {
        eyebrow: "Build",
        title: "Focus on procurement, not paperwork",
        desc: "Replace email threads and spreadsheets with a single procure-to-pay workflow — Requisitions, RFQs, POs, GRNs and Bills, all linked.",
        icon: Layers,
    },
    {
        eyebrow: "Secure",
        title: "Identify vendor risk before it ships",
        desc: "Our Random Forest engine continuously scores vendors on financials, compliance, delivery and quality — surfacing risk before you award.",
        icon: ShieldCheck,
    },
    {
        eyebrow: "Validate",
        title: "Catch invoice issues before finance does",
        desc: "Every bill runs through automatic 3-way matching against the PO and Goods Receipt. Mismatches are flagged for review, not paid.",
        icon: CheckCircle2,
    },
    {
        eyebrow: "Distribute",
        title: "Streamline awards and releases",
        desc: "Compare quotes side-by-side, award with one click, and release POs to vendors instantly through the supplier portal.",
        icon: Truck,
    },
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
            {/* NAV — pill style inspired by ToDesktop */}
            <nav
                className={`fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 transition-all md:px-10 ${scrolled
                        ? "bg-paper/85 backdrop-blur-md shadow-[0_2px_24px_rgba(24,23,20,0.06)]"
                        : "bg-transparent"
                    }`}
            >
                <Link to="/" className="flex items-center gap-2.5">
                    <img
                        src={logo}
                        style={{width:100, height:'auto'} }
                    />

                </Link>

                <ul className="hidden items-center gap-8 rounded-full border border-paper-dark bg-paper/70 px-7 py-2.5 backdrop-blur md:flex">
                    <li><a href="#features" className="text-[13px] text-ink-soft hover:text-foreground">Features</a></li>
                    <li><a href="#how" className="text-[13px] text-ink-soft hover:text-foreground">How it works</a></li>
                    <li><a href="#roles" className="text-[13px] text-ink-soft hover:text-foreground">Roles</a></li>
                    <li><a href="#faq" className="text-[13px] text-ink-soft hover:text-foreground">FAQ</a></li>
                    <li><a href="#vendors" className="text-[13px] text-ink-soft hover:text-foreground">Vendors</a></li>
                </ul>

                <div className="flex items-center gap-2">
                    <Link to="/login">
                        <button className="hidden h-10 rounded-full border border-paper-dark bg-paper px-5 text-[13px] font-medium hover:border-foreground sm:inline-block">
                            Log in
                        </button>
                    </Link>
                    <Link to="/register">
                        <button className="h-10 rounded-full bg-foreground px-5 text-[13px] font-medium text-background hover:opacity-85">
                            Get started
                        </button>
                    </Link>
                </div>
            </nav>

            {/* HERO — centered, à la ToDesktop */}
            <section className="relative overflow-hidden px-6 pb-20 pt-36 md:pb-24 md:pt-40">
                {/* radial light + grid */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0"
                    style={{
                        backgroundImage:
                            "radial-gradient(ellipse 70% 50% at 50% 0%, color-mix(in oklab, var(--ink) 8%, transparent) 0%, transparent 70%)",
                    }}
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 z-0 opacity-[0.35]"
                    style={{
                        backgroundImage:
                            "linear-gradient(var(--paper-dark) 1px, transparent 1px), linear-gradient(90deg, var(--paper-dark) 1px, transparent 1px)",
                        backgroundSize: "72px 72px",
                        maskImage:
                            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.6) 70%, transparent 100%)",
                        WebkitMaskImage:
                            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 25%, rgba(0,0,0,0.6) 70%, transparent 100%)",
                    }}
                />

                <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center text-center">
                    {/* Eyebrow pill */}
           

                    <h1 className="font-display text-[clamp(40px,7.5vw,96px)] font-extrabold leading-[1.1] sm:leading-[0.98] tracking-[-0.04em] text-foreground">
                        Release, Secure and
                        <br className="hidden sm:block" />
                        {" "}Scale your <span className="outline-text">Procurement</span>
                        <span className="inline-flex h-[0.85em] w-[0.85em] flex-shrink-0 items-center justify-center rounded-[0.22em] bg-foreground align-middle shadow-[0_8px_24px_rgba(24,23,20,0.25)] mx-2 sm:mx-3 text-paper">
                            <Boxes className="h-[0.5em] w-[0.5em]" strokeWidth={2} />
                        </span>
                        Stack.
                    </h1>

                    <p className="mt-7 max-w-xl text-[15.5px] font-light leading-[1.7] text-ink-soft md:text-[16.5px]">
                        Effortless requisitions, robust vendor risk, and seamless 3-way invoice matching —
                        from request to payment.
                    </p>

                    <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                        <Link to="/register">
                            <button className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-7 text-[14px] font-medium text-background hover:opacity-85">
                                Start free trial <ArrowRight className="h-4 w-4" />
                            </button>
                        </Link>
                    </div>

                    {/* Hero feature tiles */}
                    <div className="mt-20 grid w-full max-w-3xl gap-10 sm:grid-cols-3">
                        {HERO_TILES.map((t) => (
                            <div key={t.title} className="flex flex-col items-center text-center">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-paper-dark bg-paper/80 shadow-[0_4px_14px_rgba(24,23,20,0.06)]">
                                    <t.icon className="h-5 w-5 text-foreground" strokeWidth={1.7} />
                                </div>
                                <div className="font-display text-[14px] font-bold tracking-[-0.01em] text-foreground">
                                    {t.title}
                                </div>
                                <p className="mt-2 max-w-[200px] text-[12.5px] font-light leading-[1.55] text-ink-muted">
                                    {t.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Big "dashboard" mockup — replaces the laptop screenshot */}
                <div className="relative z-10 mx-auto mt-20 w-full max-w-5xl">
                    <DashboardMockup />
                </div>
            </section>

            {/* CUSTOMERS — "Wall of love" inspired */}
            <section className="border-t border-paper-dark bg-paper-mid px-6 py-20 md:px-10 md:py-24">
                <div className="mx-auto max-w-6xl">
                    <SectionLabel>Trusted on the floor</SectionLabel>
                    <h2 className="font-display text-[clamp(28px,3.6vw,46px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground">
                        Powering procurement for the country's
                        <br className="hidden md:block" />
                        most demanding industrial teams.
                    </h2>

                    <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                        {CUSTOMERS.map((c, i) => (
                            <div
                                key={c}
                                className="group relative flex h-28 items-center justify-center overflow-hidden rounded-2xl border border-paper-dark bg-paper p-6 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(24,23,20,0.07)]"
                            >
                                <span
                                    aria-hidden
                                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
                                    style={{
                                        background:
                                            i % 3 === 0
                                                ? "radial-gradient(circle at 30% 30%, color-mix(in oklab, var(--ink) 7%, transparent), transparent 60%)"
                                                : i % 3 === 1
                                                    ? "radial-gradient(circle at 70% 50%, color-mix(in oklab, var(--ink) 6%, transparent), transparent 60%)"
                                                    : "radial-gradient(circle at 50% 80%, color-mix(in oklab, var(--ink) 5%, transparent), transparent 60%)",
                                    }}
                                />
                                <div className="relative font-display text-[14px] font-extrabold uppercase tracking-[0.12em] text-foreground/85">
                                    {c}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURES — "The Procurement ops stack" */}
            <section id="features" className="px-6 py-24 md:px-10 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <SectionLabel>Features</SectionLabel>
                    <h2 className="max-w-3xl font-display text-[clamp(32px,4.4vw,56px)] font-extrabold leading-[1.05] tracking-[-0.035em] text-foreground">
                        The Procurement ops stack.
                    </h2>
                    <p className="mt-5 max-w-xl text-[15px] font-light leading-[1.7] text-ink-soft">
                        ProcurLi is your end-to-end procurement partner — everything you need to run requisitions,
                        RFQs, POs and bills at scale.
                    </p>

                    <div className="mt-16 grid gap-5 md:grid-cols-2">
                        {FEATURES.map((f) => (
                            <article
                                key={f.title}
                                className="group relative overflow-hidden rounded-3xl border border-paper-dark bg-paper p-9 transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(24,23,20,0.07)]"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-foreground">
                                    <f.icon className="h-5 w-5 text-paper" strokeWidth={1.7} />
                                </div>
                                <div className="mt-7 font-display text-[10.5px] font-bold uppercase tracking-[0.18em] text-ink-muted">
                                    {f.eyebrow}
                                </div>
                                <h3 className="mt-3 font-display text-[22px] font-extrabold leading-[1.15] tracking-[-0.02em] text-foreground md:text-[24px]">
                                    {f.title}
                                </h3>
                                <p className="mt-3.5 max-w-md text-[14px] font-light leading-[1.7] text-ink-soft">
                                    {f.desc}
                                </p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            {/* DARK SHOWCASE — dashboard preview, mirrors ToDesktop dark feature block */}
            <section className="bg-foreground px-6 py-24 md:px-10 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-5 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-paper/40">
                        <span className="h-px w-6 bg-paper/30" />
                        Inside the platform
                    </div>
                    <h2 className="max-w-3xl font-display text-[clamp(30px,4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-paper">
                        Review every release of every PO,
                        <br className="hidden md:block" />
                        against every previous one.
                    </h2>
                    <p className="mt-5 max-w-xl text-[15px] font-light leading-[1.7] text-paper/55">
                        The buyer dashboard surfaces validation checks, vendor risk, delivery status and 3-way
                        match results — all in one timeline so nothing slips.
                    </p>

                    <div className="mt-14 grid gap-6 md:grid-cols-12">
                        <div className="md:col-span-7">
                            <DarkValidationPanel />
                        </div>
                        <div className="flex flex-col gap-6 md:col-span-5">
                            <DarkSmokePanel />
                            <DarkArtifactsPanel />
                        </div>
                    </div>
                </div>
            </section>

            {/* HOW IT WORKS */}
            <section id="how" className="px-6 py-24 md:px-10 md:py-32">
                <div className="mx-auto max-w-6xl">
                    <SectionLabel>How it works</SectionLabel>
                    <h2 className="max-w-2xl font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground">
                        From requisition to payment — fully automated.
                    </h2>

                    <div className="mt-16 grid gap-12 md:grid-cols-2 md:gap-20">
                        <div className="flex flex-col">
                            {STEPS.map((step, i) => (
                                <button
                                    key={step.title}
                                    onClick={() => setActiveStep(i)}
                                    className={`flex gap-7 border-b border-paper-dark py-8 text-left transition-colors ${i === 0 ? "border-t" : ""
                                        }`}
                                >
                                    <span
                                        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-[1.5px] font-display text-[13px] font-bold transition-all ${activeStep === i
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

                        <div className="sticky top-24 flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-paper-dark bg-paper-mid p-12">
                            <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-foreground">
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
    
            {/* VENDOR CTA SECTION */}
            <section id="vendors" className="bg-foreground px-6 py-24 md:px-10 md:py-32">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-16">
                    <div className="min-w-[300px] flex-1">
                        <div className="mb-4 inline-block rounded-full bg-paper/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/50">
                            Vendor Marketplace
                        </div>
                        <h2 className="max-w-lg font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper">
                            Are you a supplier or manufacturer?
                        </h2>
                        <p className="mt-4 max-w-md text-[16px] font-light leading-[1.7] text-paper/55">
                            Join the ProcurLi vendor marketplace. List your products, receive purchase orders from
                            verified industrial buyers, and manage your entire supply-side business — all in one
                            dashboard.
                        </p>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/vendor">
                                <button className="rounded-full bg-paper px-7 py-3.5 text-[14px] font-medium text-foreground hover:opacity-85">
                                    Open vendor portal
                                </button>
                            </Link>
                            <Link to="/register">
                                <button className="rounded-full border border-paper/25 bg-transparent px-7 py-3.5 text-[14px] font-normal text-paper/80 hover:border-paper/60 hover:text-paper">
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
                                    className="rounded-2xl border border-paper/10 bg-paper/5 p-5"
                                >
                                    <f.icon className="mb-3 h-5 w-5 text-paper/70" strokeWidth={1.6} />
                                    <div className="font-display text-[14px] font-bold text-paper">{f.title}</div>
                                    <div className="mt-1.5 text-[12.5px] leading-[1.5] text-paper/45">{f.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <FaqSection />

            {/* FINAL CTA */}
            <section className="px-6 pb-20 pt-12 md:px-10">
                <div className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-12 overflow-hidden rounded-3xl bg-foreground p-12 md:p-20">
                    <span aria-hidden className="absolute -right-20 -top-20 h-80 w-80 rounded-full border border-paper/[0.08]" />
                    <span aria-hidden className="absolute -right-5 -top-5 h-52 w-52 rounded-full border border-paper/[0.06]" />
                    <div className="relative">
                        <div className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/45">
                            Ready when you are
                        </div>
                        <h2 className="font-display text-[40px] font-extrabold leading-[1.1] tracking-[-0.03em] text-paper">
                            Start procuring smarter today.
                        </h2>
                        <p className="mt-3.5 max-w-sm text-[15px] font-light leading-[1.65] text-paper/60">
                            Spin up your tenant in minutes. Configure roles, invite vendors, and run your first
                            requisition this week.
                        </p>
                    </div>
                    <div className="relative flex flex-shrink-0 flex-col gap-3">
                        <Link to="/buyer">
                            <button className="w-full rounded-full bg-paper px-9 py-3.5 text-center text-[14px] font-medium text-foreground hover:opacity-88">
                                Open buyer portal
                            </button>
                        </Link>
                        <Link to="/login">
                            <button className="w-full rounded-full border border-paper/25 bg-transparent px-9 py-3.5 text-center text-[14px] font-normal text-paper/80 hover:border-paper/60 hover:text-paper">
                                Sign in
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-paper-dark px-6 py-12 md:px-10">
                <div className="flex items-center gap-2.5">
                    <img
                        src={logo}
                        style={{ width: 100, height: 'auto' }}
                    />
                </div>
                <ul className="flex flex-wrap gap-8">
                    <li><a href="#features" className="text-[13px] text-ink-muted hover:text-foreground">Features</a></li>
                    <li><a href="#how" className="text-[13px] text-ink-muted hover:text-foreground">How it works</a></li>
                    <li><a href="#roles" className="text-[13px] text-ink-muted hover:text-foreground">Roles</a></li>
                    <li><a href="#faq" className="text-[13px] text-ink-muted hover:text-foreground">FAQ</a></li>
                    <li><Link to="/vendor" className="text-[13px] text-ink-muted hover:text-foreground">Vendor portal</Link></li>
                    <li><Link to="/buyer" className="text-[13px] text-ink-muted hover:text-foreground">Buyer portal</Link></li>
                </ul>
                <div className="text-[12.5px] text-ink-muted">© {new Date().getFullYear()} ProcurLi</div>
            </footer>
        </div>
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <div className="mb-5 flex items-center gap-2.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
            <span className="h-px w-6 bg-ink-muted" />
            {children}
        </div>
    );
}

/* ---------- Mockups (inspired by ToDesktop dashboard previews) ---------- */

function DashboardMockup() {
    return (
        <div className="relative overflow-hidden rounded-3xl border border-paper-dark bg-paper-mid p-3 shadow-[0_30px_80px_-20px_rgba(24,23,20,0.18)]">
            {/* window chrome */}
            <div className="flex items-center gap-3 px-3 pb-3 pt-1.5">
                <span className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-paper-dark" />
                    <span className="h-2.5 w-2.5 rounded-full bg-paper-dark" />
                    <span className="h-2.5 w-2.5 rounded-full bg-paper-dark" />
                </span>
                <span className="flex-1 truncate text-center font-mono text-[10.5px] text-ink-muted">
                    app.procurli.com — Dashboard
                </span>
                <span className="font-mono text-[10.5px] text-ink-muted">⌘K</span>
            </div>

            <div className="grid gap-3 rounded-2xl bg-paper p-5 md:grid-cols-12">
                {/* sidebar */}
                <aside className="md:col-span-3">
                    <div className="rounded-xl border border-paper-dark bg-paper-mid/50 p-3">
                        <div className="mb-3 flex items-center gap-2 px-1">
                            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-foreground text-[10px] font-extrabold text-paper">P</span>
                            <span className="font-display text-[12px] font-bold">Petron Industrial</span>
                        </div>
                        <ul className="space-y-0.5 text-[11.5px]">
                            {[
                                { label: "Dashboard", active: true, icon: Activity },
                                { label: "Requisitions", icon: ClipboardList },
                                { label: "RFQs", icon: FileBadge },
                                { label: "Purchase Orders", icon: Receipt },
                                { label: "Vendors", icon: Store },
                                { label: "Risk", icon: ShieldCheck },
                            ].map((it) => (
                                <li
                                    key={it.label}
                                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${it.active ? "bg-foreground text-paper" : "text-ink-soft"
                                        }`}
                                >
                                    <it.icon className="h-3 w-3" strokeWidth={2} />
                                    <span className="truncate">{it.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* main */}
                <div className="space-y-3 md:col-span-9">
                    {/* KPI row */}
                    <div className="grid grid-cols-4 gap-2.5">
                        {[
                            { k: "Open PRs", v: "12", d: "+3" },
                            { k: "Active RFQs", v: "07", d: "−1" },
                            { k: "POs in flight", v: "24", d: "+5" },
                            { k: "3-way match", v: "98.4%", d: "+0.6" },
                        ].map((s) => (
                            <div key={s.k} className="rounded-xl border border-paper-dark bg-paper-mid/50 p-3">
                                <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-ink-muted">{s.k}</div>
                                <div className="mt-1 flex items-baseline gap-1.5">
                                    <div className="font-display text-[20px] font-extrabold leading-none tracking-[-0.03em]">{s.v}</div>
                                    <div className="text-[9.5px] text-ink-muted">{s.d}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="rounded-xl border border-paper-dark">
                        <div className="flex items-center justify-between border-b border-paper-dark px-3 py-2">
                            <div className="font-display text-[11.5px] font-bold tracking-[-0.01em]">Latest Purchase Orders</div>
                            <div className="font-mono text-[10.5px] text-ink-muted">live</div>
                        </div>
                        <div className="divide-y divide-paper-dark text-[11.5px]">
                            {[
                                { id: "PO-2418", v: "SteelAsia Corp.", amt: "₱ 482,300", st: "Shipped", tone: "ok" },
                                { id: "PO-2417", v: "MERALCO Supply", amt: "₱ 91,500", st: "Acknowledged", tone: "info" },
                                { id: "PO-2416", v: "Pilmico Mills", amt: "₱ 1.2M", st: "3-way match", tone: "warn" },
                                { id: "PO-2415", v: "URC Manufacturing", amt: "₱ 38,000", st: "Delivered", tone: "ok" },
                            ].map((r) => (
                                <div key={r.id} className="grid grid-cols-12 items-center gap-2 px-3 py-2">
                                    <span className="col-span-2 font-mono text-[10.5px] text-ink-muted">{r.id}</span>
                                    <span className="col-span-5 truncate text-ink">{r.v}</span>
                                    <span className="col-span-3 text-right font-mono text-[10.5px]">{r.amt}</span>
                                    <span className="col-span-2 text-right">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9.5px] ${r.tone === "ok"
                                                    ? "bg-foreground text-paper"
                                                    : r.tone === "warn"
                                                        ? "border border-foreground/30 text-foreground"
                                                        : "bg-paper-mid text-ink-soft"
                                                }`}
                                        >
                                            <CircleDot className="h-2 w-2" />
                                            {r.st}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DarkValidationPanel() {
    return (
        <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-6">
            <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-paper/80" strokeWidth={2} />
                    <span className="font-display text-[12px] font-bold uppercase tracking-[0.14em] text-paper/80">
                        PO Validation — PO-2418
                    </span>
                </div>
                <span className="font-mono text-[10.5px] text-paper/40">SteelAsia Corp.</span>
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-paper/10 py-4 text-paper/70">
                <Field label="Vendor risk" value="Low" mono />
                <Field label="Amount" value="₱ 482,300" mono />
                <Field label="Items" value="6 SKU" mono />
            </div>

            <ul className="mt-5 space-y-3 text-[12.5px]">
                {[
                    "PO-2418 successfully released",
                    "Vendor accreditation valid until 02-2027",
                    "ML risk score 17 — LOW (financials, on-time, quality)",
                    "Three-way match prepared on receipt",
                ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-paper/70">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-paper" />
                        <span>{t}</span>
                    </li>
                ))}
            </ul>

            <div className="mt-5 flex items-center justify-between border-t border-paper/10 pt-4">
                <span className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-paper">
                    4 of 4 checks passed
                </span>
                <span className="rounded-full bg-paper px-2.5 py-0.5 text-[10px] font-bold text-foreground">
                    RELEASED
                </span>
            </div>
        </div>
    );
}

function DarkSmokePanel() {
    return (
        <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-6">
            <div className="mb-4 flex items-center gap-2">
                <Activity className="h-4 w-4 text-paper/80" strokeWidth={2} />
                <span className="font-display text-[12px] font-bold uppercase tracking-[0.14em] text-paper/80">
                    Vendor risk pulse
                </span>
            </div>
            <ul className="space-y-2.5 text-[12px]">
                {[
                    { v: "SteelAsia Corp.", s: "Low", tone: "ok" },
                    { v: "Pilmico Mills", s: "Medium", tone: "warn" },
                    { v: "MERALCO Supply", s: "Low", tone: "ok" },
                    { v: "Phinma Cement", s: "High", tone: "bad" },
                ].map((r) => (
                    <li key={r.v} className="flex items-center justify-between">
                        <span className="text-paper/75">{r.v}</span>
                        <span
                            className={`flex items-center gap-1 font-mono text-[10.5px] ${r.tone === "ok" ? "text-paper" : r.tone === "warn" ? "text-paper/70" : "text-paper"
                                }`}
                        >
                            {r.tone === "bad" && <AlertTriangle className="h-3 w-3" />}
                            {r.s}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function DarkArtifactsPanel() {
    return (
        <div className="rounded-2xl border border-paper/10 bg-paper/[0.04] p-6">
            <div className="mb-4 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-paper/80" strokeWidth={2} />
                <span className="font-display text-[12px] font-bold uppercase tracking-[0.14em] text-paper/80">
                    3-way match
                </span>
            </div>
            <div className="space-y-2 text-[11.5px] text-paper/70">
                <Row k="PO-2418" v="₱ 482,300" />
                <Row k="GRN-1109" v="₱ 482,300" ok />
                <Row k="INV-77231" v="₱ 482,300" ok />
            </div>
            <div className="mt-4 rounded-md border border-paper/10 bg-paper/5 px-3 py-2 font-mono text-[10.5px] text-paper/55">
                ✓ matched · variance 0.00%
            </div>
        </div>
    );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div>
            <div className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-paper/40">{label}</div>
            <div className={`mt-1 text-paper ${mono ? "font-mono text-[12px]" : "text-[13px]"}`}>{value}</div>
        </div>
    );
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
    return (
        <div className="flex items-center justify-between rounded-md border border-paper/10 bg-paper/[0.03] px-3 py-1.5">
            <span className="font-mono text-[10.5px] text-paper/55">{k}</span>
            <span className="flex items-center gap-2">
                {ok && <CheckCircle2 className="h-3 w-3 text-paper" />}
                <span className="font-mono">{v}</span>
            </span>
        </div>
    );
}

const FAQ_ITEMS = [
    {
        q: "How does vendor onboarding & accreditation work?",
        a: "Vendors self-register through the public portal, complete their company profile, and upload compliance documents (business permits, ISO certs, tax filings, insurance). Buyer admins review submissions in the Vendors module — each vendor receives an ML-driven risk score based on financial health, document validity, and historical performance. Once approved, the vendor is moved to Accredited status and becomes eligible to receive RFQs and POs.",
    },
    {
        q: "What's the full lifecycle of an RFQ?",
        a: "A buyer creates an RFQ (manually or by converting an approved Purchase Requisition), selects accredited vendors, and sets a closing date. Invited vendors receive the RFQ in their portal where they can view specs, submit a quotation (unit price, total, lead time, validity), or decline. Buyers compare quotes side-by-side, award the winner — which auto-generates a draft Purchase Order — and the remaining quotes are marked Lost.",
    },
    {
        q: "How are Purchase Orders processed end-to-end?",
        a: "Issued POs land in the vendor's Purchase Orders inbox where they Acknowledge, then move through Preparing → Packed → Shipped → Delivered. Buyers create a Goods Receipt on delivery (full or partial), which unlocks the vendor invoice. ProcurLi runs a 3-way match against the PO, GRN, and invoice — exceptions are flagged for review before the bill is approved for payment.",
    },
    {
        q: "Can a single PR be split across multiple vendors?",
        a: "Yes. When converting a requisition into RFQs you can split line items by category or by preferred vendor. Each split generates its own RFQ thread, and awards from different vendors produce separate POs that all roll up to the original PR for spend tracking and approvals.",
    },
    {
        q: "How does the ML risk detection work?",
        a: "The risk engine continuously scores every vendor on four dimensions: financial stability, document compliance, delivery performance, and quality (rejection rate from goods receipts). Scores update on each transaction. High-risk vendors are surfaced on the Risk & Compliance dashboard with recommended actions — request updated docs, restrict bidding, or block.",
    },
    {
        q: "Who can approve requisitions and POs?",
        a: "Approval thresholds are configured per role in Settings. Requesters submit PRs, department managers approve up to their limit, and finance/CPO approves above threshold. The same matrix applies to PO release. All approvals are logged in the audit trail and tied to the user's authenticated session.",
    },
    {
        q: "Is data isolated between buyer organizations?",
        a: "Yes — ProcurLi is multi-tenant by design. Each buyer organization has its own isolated workspace with row-level data scoping. Vendors live in a shared marketplace but only see RFQs and POs explicitly addressed to them.",
    },
];

function FaqSection() {
    const [open, setOpen] = useState<number | null>(0);
    return (
        <section id="faq" className="border-t border-paper-dark bg-paper px-6 py-24 md:px-10 md:py-32">
            <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-12">
                <div className="md:col-span-5">
                    <SectionLabel>Frequently asked</SectionLabel>
                    <h2 className="font-display text-[clamp(32px,4vw,52px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-foreground">
                        Answers for procurement teams & suppliers.
                    </h2>
                    <p className="mt-5 max-w-sm text-[15px] font-light leading-[1.7] text-ink-muted">
                        How vendors get accredited, how RFQs reach award, and how POs flow through receipt
                        and 3-way invoice matching.
                    </p>
                    <div className="mt-8 inline-flex items-center gap-2 border-t border-foreground/15 pt-5 text-[12.5px] text-ink-muted">
                        <span>Still have questions?</span>
                        <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
                            Talk to us <ArrowUpRight className="inline h-3 w-3" />
                        </Link>
                    </div>
                </div>

                <div className="md:col-span-7">
                    <ul className="border-t border-foreground/15">
                        {FAQ_ITEMS.map((item, i) => {
                            const isOpen = open === i;
                            return (
                                <li key={item.q} className="border-b border-foreground/15">
                                    <button
                                        type="button"
                                        onClick={() => setOpen(isOpen ? null : i)}
                                        aria-expanded={isOpen}
                                        className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                                    >
                                        <div className="flex items-start gap-5">
                                            <span className="mt-1 font-mono text-[11px] font-semibold tracking-[0.1em] text-ink-muted">
                                                {String(i + 1).padStart(2, "0")}
                                            </span>
                                            <span className="font-display text-[18px] font-bold leading-snug tracking-[-0.01em] text-foreground md:text-[20px]">
                                                {item.q}
                                            </span>
                                        </div>
                                        <span
                                            aria-hidden
                                            className={`mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-foreground/20 transition-transform ${isOpen ? "rotate-45 bg-foreground text-background" : "text-foreground"
                                                }`}
                                        >
                                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                                            </svg>
                                        </span>
                                    </button>
                                    <div
                                        className={`grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                            }`}
                                    >
                                        <div className="min-h-0">
                                            <p className="pb-7 pl-[44px] pr-10 text-[14.5px] font-light leading-[1.75] text-ink-soft">
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </section>
    );
}
