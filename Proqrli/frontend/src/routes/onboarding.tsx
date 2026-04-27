import { createFileRoute, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { ArrowLeft, ArrowRight, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

type PortalSearch = { portal?: "vendor" | "buyer" };

export const Route = createFileRoute("/onboarding")({
  validateSearch: (search: Record<string, unknown>): PortalSearch => ({
    portal: (search.portal as "vendor" | "buyer") ?? "vendor",
  }),
  component: OnboardingPage,
});

const VENDOR_CATEGORIES = ["⚙️ Industrial Equipment", "🔩 Hardware & Fasteners", "⚡ Electrical", "🛢️ Chemicals", "🚚 Logistics", "🖥️ IT Equipment", "🏗️ Construction", "🧪 Lab & Safety"];
const BUYER_NEEDS = ["⚙️ Bearings & Mech", "🔩 Fasteners", "🛢️ Chemicals", "🛠️ Hydraulics", "⚡ Electrical", "⛑️ Safety/PPE", "🪨 Raw Materials", "🧴 MRO"];
const SKU_RANGES = ["1–10", "11–25", "26–100", "101–500", "500+"];
const TEAM_RANGES = ["Just me", "2–5", "6–10", "11–25", "25+"];

const VENDOR_PLANS = [
  { id: "free", icon: "🌱", name: "Free", price: "$0", note: "No credit card", features: ["Storefront", "Up to 25 listings", "Basic metrics"] },
  { id: "pro", icon: "🔥", name: "Seller Pro", price: "$49", note: "Most popular · 14-day trial", features: ["Unlimited listings", "Analytics", "Featured placement", "Priority support"], featured: true },
  { id: "ent", icon: "🏭", name: "Enterprise", price: "Custom", note: "Tailored for volume", features: ["Bulk import / API", "ERP integration", "Account manager"] },
];

const BUYER_PLANS = [
  { id: "free", icon: "🌱", name: "Starter", price: "$0", note: "14-day free trial", features: ["Up to 5 users", "PR/PO workflow", "Basic analytics"] },
  { id: "pro", icon: "🔥", name: "Procurement Pro", price: "$79", note: "Most popular · billed yearly", features: ["Unlimited users", "ML risk scoring", "Real-time dashboards", "PayMongo & Stripe"], featured: true },
  { id: "ent", icon: "🏭", name: "Enterprise", price: "Custom", note: "Tailored for ops", features: ["SAP / ERP integration", "Account manager", "On-prem option"] },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { portal = "vendor" } = Route.useSearch();
  const [step, setStep] = React.useState(1);
  const isVendor = portal === "vendor";

  const cats = isVendor ? VENDOR_CATEGORIES : BUYER_NEEDS;
  const plans = isVendor ? VENDOR_PLANS : BUYER_PLANS;

  const [category, setCategory] = React.useState(cats[0]);
  const [sku, setSku] = React.useState(SKU_RANGES[2]);
  const [team, setTeam] = React.useState(TEAM_RANGES[1]);
  const [plan, setPlan] = React.useState<string | null>(null);

  const finish = () => navigate({ to: isVendor ? "/vendor" : "/buyer" });

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper p-6">
      <div className="w-full max-w-3xl overflow-hidden rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-8 py-4">
          <span className="font-display text-base font-extrabold">
            ProcurLi · {isVendor ? "Vendor" : "Buyer"} Onboarding
          </span>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <span key={n} className={cn("h-2 w-2 rounded-full", n === step ? "scale-150 bg-foreground" : n < step ? "bg-foreground" : "bg-border")} />
            ))}
          </div>
          <button onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1} className="inline-flex items-center gap-1 text-xs text-muted-foreground disabled:opacity-30">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        </div>

        <div className="flex min-h-[440px] flex-col items-center px-8 py-12 text-center">
          {step === 1 && (
            <>
              <h2 className="font-display text-3xl font-extrabold">{isVendor ? "What's your business name?" : "What's your company name?"}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isVendor ? "This is the name buyers will see on your vendor storefront." : "We'll use this to brand your procurement workspace."}
              </p>
              <input defaultValue={isVendor ? "Acme Industrial Supply" : "Pacific Manufacturing Corp"} className="mt-8 h-14 w-full max-w-md rounded-sm border-2 border-border bg-card px-4 text-center text-lg outline-none focus:border-foreground" />
            </>
          )}
          {step === 2 && (
            <div className="w-full max-w-xl">
              <h2 className="font-display text-3xl font-extrabold">
                {isVendor ? "What do you primarily sell?" : "What do you primarily buy?"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isVendor ? "Pick your main category." : "Pick your top sourcing categories."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {cats.map((c) => (
                  <button key={c} onClick={() => setCategory(c)} className={cn("rounded-sm border-2 px-3 py-3 text-xs font-semibold transition-colors", category === c ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>{c}</button>
                ))}
              </div>
              <h3 className="mt-8 font-display text-xl font-extrabold">
                {isVendor ? "How many SKUs do you carry?" : "How big is your procurement team?"}
              </h3>
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {(isVendor ? SKU_RANGES : TEAM_RANGES).map((r) => (
                  <button
                    key={r}
                    onClick={() => isVendor ? setSku(r) : setTeam(r)}
                    className={cn("h-10 rounded-sm border-2 px-4 text-sm font-semibold", (isVendor ? sku : team) === r ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="w-full max-w-xl">
              <h2 className="font-display text-3xl font-extrabold">
                {isVendor ? "Upload compliance documents" : "Upload company documents"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isVendor ? "Verified vendors get a Certified Badge. You can skip and upload later." : "Verified buyers get faster vendor responses. Skip and upload later if needed."}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {(isVendor
                  ? ["BIR Certificate", "Business Permit", "ISO / Quality Cert", "Product Catalogue"]
                  : ["BIR Certificate", "Business Permit", "Audited Financials", "Procurement Policy"]
                ).map((d) => (
                  <label key={d} className="flex cursor-pointer flex-col items-center gap-2 rounded-sm border-2 border-dashed border-border bg-paper p-5 text-center hover:border-foreground hover:bg-paper-mid">
                    <Upload className="h-5 w-5 text-muted-foreground" />
                    <span className="text-xs font-semibold">{d}</span>
                    <span className="text-[10px] text-muted-foreground">PDF, JPG · max 5MB</span>
                  </label>
                ))}
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="w-full">
              <h2 className="font-display text-3xl font-extrabold">Choose your plan</h2>
              <p className="mt-2 text-sm text-muted-foreground">Start free. Upgrade anytime.</p>
              <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => { setPlan(p.id); setTimeout(finish, 250); }}
                    className={cn("flex flex-col items-start gap-3 rounded-md border p-5 text-left transition-all hover:shadow-md", p.featured ? "border-foreground" : "border-border", plan === p.id && "ring-2 ring-foreground")}
                  >
                    {p.featured && <span className="rounded-sm bg-foreground px-2 py-[2px] font-mono text-[9px] font-bold uppercase tracking-widest text-background">Most popular</span>}
                    <span className="text-3xl">{p.icon}</span>
                    <span className="font-display text-xl font-extrabold">{p.name}</span>
                    <span className="font-display text-3xl font-extrabold">{p.price}<span className="ml-1 text-base font-normal text-muted-foreground">/mo</span></span>
                    <span className="text-[11px] text-muted-foreground">{p.note}</span>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {p.features.map((f) => <li key={f} className="flex items-start gap-2"><Check className="mt-[2px] h-3 w-3 text-emerald-600" /> {f}</li>)}
                    </ul>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-8 py-4">
          <span className="text-xs text-muted-foreground">Step {step} of 4 · {isVendor ? "Vendor" : "Buyer"}</span>
          {step < 4 && (
            <button onClick={() => setStep((s) => Math.min(4, s + 1))} className="inline-flex h-11 items-center gap-2 rounded-sm bg-foreground px-6 text-sm font-semibold text-background hover:opacity-85">
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
