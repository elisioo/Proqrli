import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

type Portal = "vendor" | "buyer";

const VENDOR_TYPES = [
  { id: "supplier", label: "Supplier / Manufacturer" },
  { id: "distributor", label: "Distributor" },
  { id: "service", label: "Service Provider" },
];

const BUYER_TYPES = [
  { id: "manufacturer", label: "Manufacturer" },
  { id: "construction", label: "Construction / EPC" },
  { id: "logistics", label: "Logistics / Operator" },
  { id: "energy", label: "Energy / Mining" },
];

function RegisterPage() {
  const navigate = useNavigate();
  const [portal, setPortal] = React.useState<Portal>("vendor");
  const types = portal === "vendor" ? VENDOR_TYPES : BUYER_TYPES;
  const [type, setType] = React.useState(types[0].id);

  React.useEffect(() => { setType((portal === "vendor" ? VENDOR_TYPES : BUYER_TYPES)[0].id); }, [portal]);

  return (
    <div className="flex min-h-screen w-full">
      <div className="flex w-full flex-col justify-start overflow-y-auto px-6 py-10 md:w-[46%] md:px-14">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-foreground text-background">
            <span className="font-display text-sm font-extrabold">P</span>
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">ProcurLi</span>
        </Link>

        {/* Portal selector */}
        <div className="mb-5 inline-flex gap-1 rounded-sm border border-border bg-paper-mid p-1 self-start">
          {(["vendor", "buyer"] as Portal[]).map((p) => (
            <button
              key={p}
              onClick={() => setPortal(p)}
              className={cn(
                "rounded-sm px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors",
                portal === p ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {p === "vendor" ? "I want to sell" : "I want to buy"}
            </button>
          ))}
        </div>

        <h1 className="font-display text-3xl font-extrabold">
          {portal === "vendor" ? "Create your vendor account" : "Create your procurement workspace"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {portal === "vendor"
            ? "List your products, receive purchase orders, and connect with industrial buyers."
            : "Source from accredited vendors, run RFQs and POs, and pay bills with full audit trail."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => setType(t.id)}
              className={`flex-1 min-w-[140px] rounded-sm border-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${type === t.id ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/onboarding", search: { portal } });
          }}
          className="mt-6 space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Business name" placeholder={portal === "vendor" ? "Acme Industrial Supply" : "Pacific Manufacturing Corp"} />
            <Field label="Industry" placeholder={portal === "vendor" ? "Industrial Equipment" : "Heavy Equipment"} />
            <Field label="Your full name" placeholder={portal === "vendor" ? "Shane Sorono" : "Elena Marquez"} />
            <Field label="Job title" placeholder={portal === "vendor" ? "Sales Manager" : "Procurement Director"} />
          </div>
          <Field label="Business email" placeholder="you@company.com" type="email" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Password" type="password" placeholder="••••••••" />
            <Field label="Confirm password" type="password" placeholder="••••••••" />
          </div>
          <label className="flex items-start gap-2 text-xs text-muted-foreground">
            <input type="checkbox" required className="mt-[3px]" />
            <span>I agree to the <a className="underline">{portal === "vendor" ? "Vendor" : "Buyer"} Terms</a>, <a className="underline">Privacy Policy</a>, and <a className="underline">Marketplace Rules</a>.</span>
          </label>
          <button type="submit" className="h-12 w-full rounded-sm bg-foreground text-sm font-semibold text-background hover:opacity-85">
            Create {portal === "vendor" ? "vendor" : "buyer"} account →
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">Sign in →</Link>
        </p>
      </div>

      <div className="relative hidden flex-1 overflow-hidden bg-foreground md:block">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-background">
          <h2 className="font-display text-5xl font-extrabold uppercase leading-none tracking-tight">
            {portal === "vendor" ? <>Sell smarter.<br /><span className="outline-text">Reach more.</span></> : <>Source smarter.<br /><span className="outline-text">Spend less.</span></>}
          </h2>
          <p className="mt-4 max-w-xs text-sm opacity-60">
            {portal === "vendor"
              ? "Join 500+ vendors growing their industrial business on ProcurLi."
              : "Join 200+ procurement teams running data-driven sourcing on ProcurLi."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="t-label mb-2 block">{label}</label>
      <input {...props} required className="h-11 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground" />
    </div>
  );
}
