/* eslint-disable prettier/prettier */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import {
  ArrowLeft, ArrowRight, Check, Building2, Users, User, Phone,
  Briefcase, UserPlus, ChevronDown, CreditCard, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi, type OnboardingPayload } from "@/lib/api";

type PortalSearch = { portal?: "vendor" | "buyer" };

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): PortalSearch => ({
    portal: (search.portal as "vendor" | "buyer") ?? "buyer",
  }),
  component: OnboardingPage,
});

const BUYER_INDUSTRIES  = ["Manufacturer", "Construction / EPC", "Logistics / Operator", "Energy / Mining", "Other"];
const VENDOR_INDUSTRIES = ["Supplier / Manufacturer", "Distributor", "Service Provider", "Other"];

const COMPANY_SIZES = [
  { id: "Micro",      label: "1–10 employees" },
  { id: "Small",      label: "11–50 employees" },
  { id: "Medium",     label: "51–200 employees" },
  { id: "Large",      label: "201–500 employees" },
  { id: "Enterprise", label: "500+ employees" },
];

const POSITIONS_BUYER  = ["Procurement Manager", "Finance Manager", "Operations Manager", "CEO / Owner", "Inventory Manager", "Other"];
const POSITIONS_VENDOR = ["Sales Manager", "Business Development", "CEO / Owner", "Account Manager", "Other"];

const VENDOR_PLANS = [
  { id: 1, icon: "🌱", name: "Free", price: 0, displayPrice: "$0", note: "No credit card", features: ["Storefront", "Up to 25 listings", "Basic metrics"] },
  { id: 2, icon: "🔥", name: "Seller Pro", price: 49, displayPrice: "$49", note: "Most popular · 14-day trial", features: ["Unlimited listings", "Analytics", "Featured placement", "Priority support"], featured: true },
  { id: 3, icon: "🏭", name: "Enterprise", price: 999, displayPrice: "Custom", note: "Tailored for volume", features: ["Bulk import / API", "ERP integration", "Account manager"] },
];

const BUYER_PLANS = [
  { id: 4, icon: "🌱", name: "Starter", price: 0, displayPrice: "$0", note: "14-day free trial", features: ["Up to 5 users", "PR/PO workflow", "Basic analytics"] },
  { id: 5, icon: "🔥", name: "Procurement Pro", price: 79, displayPrice: "$79", note: "Most popular · billed yearly", features: ["Unlimited users", "ML risk scoring", "Real-time dashboards", "PayMongo & Stripe"], featured: true },
  { id: 6, icon: "🏭", name: "Enterprise", price: 999, displayPrice: "Custom", note: "Tailored for ops", features: ["SAP / ERP integration", "Account manager", "On-prem option"] },
];

// ─── Step definitions ─────────────────────────────────────────────────────────
type StepId = "company" | "profile" | "buyer-profile" | "plan" | "done";

function OnboardingPage() {
  const navigate               = useNavigate();
  const { portal = "buyer" }   = Route.useSearch();
  const isVendor               = portal === "vendor";

  const industries = isVendor ? VENDOR_INDUSTRIES : BUYER_INDUSTRIES;
  const positions  = isVendor ? POSITIONS_VENDOR  : POSITIONS_BUYER;

  // ── Company step ──────────────────────────────────────────────────────────
  const [companyName, setCompanyName] = React.useState("");
  const [companySize, setCompanySize] = React.useState(COMPANY_SIZES[1].id);
  const [industry,    setIndustry]    = React.useState(industries[0]);

  // ── Profile step ──────────────────────────────────────────────────────────
  const [fullName,   setFullName]   = React.useState("");
  const [contactNum, setContactNum] = React.useState("");
  const [position,   setPosition]   = React.useState(positions[0]);

  // ── Buyer profile step (optional) ─────────────────────────────────────────
  const [hasBuyer,         setHasBuyer]         = React.useState(false);
  const [buyerCompanyName, setBuyerCompanyName] = React.useState("");
  const [buyerContact,     setBuyerContact]     = React.useState("");
  const [buyerEmail,       setBuyerEmail]       = React.useState("");
  const [buyerPhone,       setBuyerPhone]       = React.useState("");

  // ── Plan step (Subscription & Billing) ────────────────────────────────────
  const plans = isVendor ? VENDOR_PLANS : BUYER_PLANS;
  const [selectedPlan, setSelectedPlan] = React.useState(plans[1].id);
  const selectedPlanDetails = plans.find((p) => p.id === selectedPlan);

  // ── Navigation ────────────────────────────────────────────────────────────
  const steps: StepId[] = ["company", "profile", "buyer-profile", "plan", "done"];
  const [stepId, setStepId] = React.useState<StepId>("company");
  const stepIdx = steps.indexOf(stepId);

  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState<string | null>(null);

  const next = () => setStepId(steps[stepIdx + 1]);
  const back = () => setStepId(steps[stepIdx - 1]);

  // ── Validation per step ───────────────────────────────────────────────────
  const canNext = () => {
    if (stepId === "company") return companyName.trim().length > 0;
    if (stepId === "profile") return fullName.trim().length > 0 && contactNum.trim().length > 0;
    return true;
  };

  // ── Submit final onboarding ───────────────────────────────────────────────
  const handleFinish = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload: OnboardingPayload = {
        companyName:     companyName.trim(),
        companySize,
        fullName:        fullName.trim(),
        contactNumber:   contactNum.trim(),
        position,
        industry,
        hasBuyerProfile: hasBuyer,
        buyerCompanyName: hasBuyer ? buyerCompanyName.trim() : undefined,
        buyerContactName: hasBuyer ? buyerContact.trim()     : undefined,
        buyerEmail:       hasBuyer ? buyerEmail.trim()       : undefined,
        buyerPhone:       hasBuyer ? buyerPhone.trim()       : undefined,
        planId:           selectedPlan,
      };

      const user = await authApi.onboarding(payload);
      // Update local session
      if (isVendor) {
        try { window.localStorage.setItem("procurli:vendor:realUser", JSON.stringify(user)); } catch {}
        const setVendorSession = (window as unknown as Record<string, unknown>).__vendorSetRealSession as ((au: typeof user) => void) | undefined;
        if (setVendorSession) setVendorSession(user);
      } else {
        try { window.localStorage.setItem("procurli:buyer:realUser", JSON.stringify(user)); } catch {}
        const setBuyerSession = (window as unknown as Record<string, unknown>).__buyerSetRealSession as ((au: typeof user) => void) | undefined;
        if (setBuyerSession) setBuyerSession(user);
      }

      navigate({ to: isVendor ? "/vendor" : "/buyer" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const totalVisible = 4; // company, profile, buyer-profile, plan

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-4">
      <div className={cn("w-full overflow-hidden rounded-xl border border-border bg-card shadow-2xl transition-all duration-300", stepId === "plan" ? "max-w-4xl" : "max-w-2xl")}>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-8 py-5">
          <div>
            <span className="font-display text-base font-extrabold">ProcurLi</span>
            <span className="ml-2 text-xs text-muted-foreground">· {isVendor ? "Vendor" : "Buyer"} Setup</span>
          </div>
          {/* Step dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: totalVisible }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === stepIdx       ? "w-6 bg-foreground" :
                  i < stepIdx         ? "w-2 bg-foreground/40" :
                                        "w-2 bg-border",
                )}
              />
            ))}
          </div>
          {/* Back */}
          {stepIdx > 0 && stepId !== "done" && (
            <button
              onClick={back}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3 w-3" /> Back
            </button>
          )}
          {stepIdx === 0 && <div className="w-12" />}
        </div>

        {/* Body */}
        <div className="min-h-[400px] px-8 py-10">

          {/* ── Step 1: Company ──────────────────────────────────────────── */}
          {stepId === "company" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/8">
                <Building2 className="h-5 w-5" />
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold">
                {isVendor ? "Tell us about your business" : "Tell us about your company"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                This information brands your {isVendor ? "vendor storefront" : "procurement workspace"}.
              </p>

              <div className="mt-8 space-y-5">
                <Field
                  id="ob-company"
                  label={isVendor ? "Business / brand name" : "Company name"}
                  placeholder={isVendor ? "Enter your business name" : "Enter your company name"}
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />

                {/* Company size */}
                <div>
                  <label className="t-label mb-2 block text-xs font-semibold text-foreground">
                    <Users className="mb-0.5 mr-1 inline h-3.5 w-3.5" />Company size
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COMPANY_SIZES.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setCompanySize(s.id)}
                        className={cn(
                          "flex-1 min-w-[110px] rounded-sm border-2 px-3 py-2 text-xs font-semibold transition-colors",
                          companySize === s.id
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Industry */}
                <div>
                  <label className="t-label mb-2 block text-xs font-semibold text-foreground">
                    Industry / sector
                  </label>
                  <div className="relative">
                    <select
                      id="ob-industry"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="h-11 w-full appearance-none rounded-sm border border-border bg-card px-3 pr-10 text-sm outline-none focus:border-foreground"
                    >
                      {industries.map((i) => <option key={i}>{i}</option>)}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 2: Personal profile ──────────────────────────────────── */}
          {stepId === "profile" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/8">
                <User className="h-5 w-5" />
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold">Your profile</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Help us personalise your experience.
              </p>

              <div className="mt-8 space-y-5">
                <Field
                  id="ob-fullname"
                  label="Full name"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />

                <div>
                  <label className="t-label mb-2 block text-xs font-semibold text-foreground">
                    <Phone className="mb-0.5 mr-1 inline h-3.5 w-3.5" />Contact number
                  </label>
                  <input
                    id="ob-phone"
                    type="tel"
                    placeholder="Enter your contact number"
                    value={contactNum}
                    onChange={(e) => setContactNum(e.target.value)}
                    className="h-11 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="t-label mb-2 block text-xs font-semibold text-foreground">
                    <Briefcase className="mb-0.5 mr-1 inline h-3.5 w-3.5" />Your position / role
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {positions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPosition(p)}
                        className={cn(
                          "rounded-sm border-2 px-3 py-2 text-xs font-semibold transition-colors",
                          position === p
                            ? "border-foreground bg-foreground text-background"
                            : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Buyer profile (optional) ─────────────────────────── */}
          {stepId === "buyer-profile" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/8">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="mt-3 font-display text-2xl font-extrabold">
                {isVendor ? "Add a buyer profile" : "Add a buyer profile"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                If you also purchase from suppliers, add your buyer details. You can skip this.
              </p>

              {/* Toggle */}
              <label className="mt-6 flex cursor-pointer items-center gap-3">
                <div
                  onClick={() => setHasBuyer((v) => !v)}
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    hasBuyer ? "bg-foreground" : "bg-border",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      hasBuyer ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </div>
                <span className="text-sm font-semibold">I have a buyer profile</span>
              </label>

              {hasBuyer && (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    id="ob-buyer-company"
                    label="Buyer company name"
                    placeholder="Enter buyer company name"
                    value={buyerCompanyName}
                    onChange={(e) => setBuyerCompanyName(e.target.value)}
                  />
                  <Field
                    id="ob-buyer-contact"
                    label="Contact person"
                    placeholder="Enter contact person's name"
                    value={buyerContact}
                    onChange={(e) => setBuyerContact(e.target.value)}
                  />
                  <Field
                    id="ob-buyer-email"
                    label="Buyer email"
                    type="email"
                    placeholder="Enter buyer email address"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                  />
                  <Field
                    id="ob-buyer-phone"
                    label="Buyer phone"
                    type="tel"
                    placeholder="Enter buyer phone number"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── Step 4: Plan & Billing ──────────────────────────────────────── */}
          {stepId === "plan" && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="text-center">
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-foreground/8">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="mt-3 font-display text-3xl font-extrabold">Choose your plan</h2>
                <p className="mt-2 text-sm text-muted-foreground">Start free. Upgrade anytime.</p>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlan(p.id)}
                    className={cn(
                      "relative flex flex-col items-start gap-3 rounded-md border p-5 text-left transition-all hover:shadow-md",
                      selectedPlan === p.id ? "border-foreground bg-foreground/5 ring-2 ring-foreground" : "border-border"
                    )}
                  >
                    {p.featured && (
                      <span className="absolute -top-2.5 right-4 rounded-sm bg-foreground px-2 py-[2px] font-mono text-[9px] font-bold uppercase tracking-widest text-background">
                        Most popular
                      </span>
                    )}
                    <span className="text-3xl">{p.icon}</span>
                    <span className="font-display text-xl font-extrabold">{p.name}</span>
                    <span className="font-display text-3xl font-extrabold">{p.displayPrice}<span className="ml-1 text-base font-normal text-muted-foreground">/mo</span></span>
                    <span className="text-[11px] text-muted-foreground">{p.note}</span>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-[2px] h-3 w-3 text-emerald-600" /> {f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>

              {/* Dummy PayMongo Billing Form */}
              {selectedPlanDetails && selectedPlanDetails.price > 0 && (
                <div className="mt-10 rounded-md border border-border bg-paper p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-lg font-bold">Payment Details</h3>
                    <div className="flex items-center gap-1.5 rounded-sm bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                      <ShieldCheck className="h-4 w-4" /> Secured by PayMongo
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <Field id="ob-card-name" label="Name on card" placeholder="Enter name on card" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="t-label mb-2 block text-xs font-semibold text-foreground">Card number</label>
                      <div className="relative">
                        <input type="text" placeholder="Enter card number" className="h-11 w-full rounded-sm border border-border bg-card px-3 pr-12 text-sm outline-none focus:border-foreground" />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                          <div className="h-5 w-8 rounded-sm bg-gray-200"></div>
                          <div className="h-5 w-8 rounded-sm bg-gray-200"></div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Field id="ob-card-exp" label="Expiry (MM/YY)" placeholder="MM/YY" />
                    </div>
                    <div>
                      <Field id="ob-card-cvc" label="CVC" placeholder="CVC" />
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-muted-foreground italic">
                    Note: This is a placeholder for the PayMongo integration. Your card will not be charged.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border px-8 py-5">
          <span className="text-xs text-muted-foreground">
            Step {stepIdx + 1} of {totalVisible}
          </span>

          {stepId === "buyer-profile" ? (
            <div className="flex gap-3">
              <button
                onClick={() => { setHasBuyer(false); next(); }}
                className="inline-flex h-11 items-center gap-2 rounded-sm border border-border px-5 text-sm font-semibold hover:bg-paper"
              >
                Skip
              </button>
              <button
                onClick={() => { setError(null); if (canNext()) next(); else setError("Please fill in the required fields."); }}
                className="inline-flex h-11 items-center gap-2 rounded-sm bg-foreground px-6 text-sm font-semibold text-background hover:opacity-85"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : stepId === "plan" ? (
            <button
              onClick={handleFinish}
              disabled={loading}
              className="inline-flex h-11 items-center gap-2 rounded-sm bg-foreground px-6 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-60"
            >
              {loading ? "Saving…" : <>Complete setup <Check className="h-4 w-4" /></>}
            </button>
          ) : (
            <button
              onClick={() => { setError(null); if (canNext()) next(); else setError("Please fill in the required fields."); }}
              className="inline-flex h-11 items-center gap-2 rounded-sm bg-foreground px-6 text-sm font-semibold text-background hover:opacity-85"
            >
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable field ───────────────────────────────────────────────────────────
type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & { label: string };

function Field({ label, id, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="t-label mb-2 block text-xs font-semibold text-foreground">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className="h-11 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
      />
    </div>
  );
}
