/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { AlertCircle, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import logo from "@/assets/logos/logo.png";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

type Portal = "vendor" | "buyer";

// ─── Buyer industry options (matches Tenant.Industry column) ─────────────────
const BUYER_TYPES = [
  { id: "manufacturer",  label: "Manufacturer" },
  { id: "construction",  label: "Construction / EPC" },
  { id: "logistics",     label: "Logistics / Operator" },
  { id: "energy",        label: "Energy / Mining" },
];

const VENDOR_TYPES = [
  { id: "supplier",     label: "Supplier / Manufacturer" },
  { id: "distributor",  label: "Distributor" },
  { id: "service",      label: "Service Provider" },
];

// ─── Company size options (maps to Tenant.CompanySize) ───────────────────────
const COMPANY_SIZES = [
  { id: "Small",      label: "1–50 employees" },
  { id: "Medium",     label: "51–200 employees" },
  { id: "Large",      label: "201–500 employees" },
  { id: "Enterprise", label: "500+ employees" },
];

function RegisterPage() {
  const navigate   = useNavigate();
  const [portal, setPortal]   = React.useState<Portal>("buyer");
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState<string | null>(null);

  const types = portal === "buyer" ? BUYER_TYPES : VENDOR_TYPES;

  // ── Form fields ────────────────────────────────────────────────────────────
  const [companyName, setCompanyName]       = React.useState("");
  const [fullName,    setFullName]           = React.useState("");
  const [email,       setEmail]             = React.useState("");
  const [password,    setPassword]           = React.useState("");
  const [confirmPw,   setConfirmPw]         = React.useState("");
  const [showPw,      setShowPw]            = React.useState(false);
  const [showConfirm, setShowConfirm]       = React.useState(false);
  const [industry,    setIndustry]           = React.useState(types[0].id);
  const [companySize, setCompanySize]        = React.useState(COMPANY_SIZES[0].id);
  const [agreed,      setAgreed]            = React.useState(false);

  // Reset industry when portal switches
  React.useEffect(() => {
    setIndustry((portal === "buyer" ? BUYER_TYPES : VENDOR_TYPES)[0].id);
    setError(null);
  }, [portal]);

  // ── Client-side validation ─────────────────────────────────────────────────
  const validate = (): string | null => {
    if (!companyName.trim()) return "Company name is required.";
    if (!fullName.trim())    return "Your full name is required.";
    if (!email.trim())       return "Business email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPw)  return "Passwords do not match.";
    if (!agreed)             return "Please agree to the terms to continue.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    try {
      // ── Call real API ───────────────────────────────────────────────────
      const user = await authApi.register({
        companyName: companyName.trim(),
        fullName:    fullName.trim(),
        email:       email.trim().toLowerCase(),
        password,
        industry,
        companySize,
      });

      // Persist real session for BuyerProvider
      if (portal === "buyer") {
        try { window.localStorage.setItem("procurli:buyer:realUser", JSON.stringify(user)); } catch {}
        try { window.localStorage.setItem("procurli:buyer:userId",   `real:${user.userId}`); } catch {}
        navigate({ to: "/onboarding", search: { portal: "buyer" } });
      } else {
        // Vendor registration — stub for now; navigate to onboarding
        navigate({ to: "/onboarding", search: { portal: "vendor" } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left panel — form ───────────────────────────────────────────────── */}
      <div className="flex w-full flex-col justify-start overflow-y-auto px-6 py-10 md:w-[52%] md:px-14">
        <Link to="/" className="mb-6 inline-flex items-center gap-2">
          <img src={logo} alt="ProcurLi Logo" className="w-[100px]" />
        </Link>

        {/* Portal selector */}
        <div className="mb-5 inline-flex gap-1 rounded-sm border border-border bg-paper-mid p-1 self-start">
          {(["vendor", "buyer"] as Portal[]).map((p) => (
            <button
              key={p}
              type="button"
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

        {/* Industry type picker */}
        <div className="mt-5 flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setIndustry(t.id)}
              className={cn(
                "flex-1 min-w-[130px] rounded-sm border-2 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors",
                industry === t.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Error banner */}
          {error && (
            <div className="flex items-start gap-2 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Company + Industry row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field
              id="reg-company"
              label="Business name"
              placeholder={portal === "vendor" ? "Acme Industrial Supply" : "Pacific Manufacturing Corp"}
              value={companyName}
              onChange={(e) => { setCompanyName(e.target.value); setError(null); }}
              required
            />
            <div>
              <label className="t-label mb-2 block text-xs font-semibold text-foreground">Company size</label>
              <select
                id="reg-size"
                value={companySize}
                onChange={(e) => setCompanySize(e.target.value)}
                className="h-11 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
              >
                {COMPANY_SIZES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            <Field
              id="reg-fullname"
              label="Your full name"
              placeholder={portal === "vendor" ? "Shane Sorono" : "Elena Marquez"}
              value={fullName}
              onChange={(e) => { setFullName(e.target.value); setError(null); }}
              required
            />
            <Field
              id="reg-jobtitle"
              label="Job title"
              placeholder={portal === "vendor" ? "Sales Manager" : "Procurement Director"}
            />
          </div>

          {/* Email */}
          <Field
            id="reg-email"
            label="Business email"
            type="email"
            placeholder="you@company.com"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            required
          />

          {/* Passwords */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <PasswordField
              id="reg-password"
              label="Password"
              placeholder="Min. 8 characters"
              value={password}
              show={showPw}
              onToggle={() => setShowPw((v) => !v)}
              onChange={(e) => { setPassword(e.target.value); setError(null); }}
            />
            <PasswordField
              id="reg-confirm-password"
              label="Confirm password"
              placeholder="Repeat password"
              value={confirmPw}
              show={showConfirm}
              onToggle={() => setShowConfirm((v) => !v)}
              onChange={(e) => { setConfirmPw(e.target.value); setError(null); }}
            />
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer">
            <input
              id="reg-terms"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-[3px]"
            />
            <span>
              I agree to the{" "}
              <a className="underline" href="#">{portal === "vendor" ? "Vendor" : "Buyer"} Terms</a>,{" "}
              <a className="underline" href="#">Privacy Policy</a>, and{" "}
              <a className="underline" href="#">Marketplace Rules</a>.
            </span>
          </label>

          <button
            id="reg-submit"
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-sm bg-foreground text-sm font-semibold text-background hover:opacity-85 disabled:opacity-60 inline-flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</>
            ) : (
              <>Create {portal === "vendor" ? "vendor" : "buyer"} account →</>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Sign in →
          </Link>
        </p>
      </div>

      {/* ── Right panel — marketing copy ───────────────────────────────────── */}
      <div className="relative hidden flex-1 overflow-hidden bg-foreground md:block">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-background">
          <h2 className="font-display text-5xl font-extrabold uppercase leading-none tracking-tight">
            {portal === "vendor"
              ? <><span>Sell smarter.</span><br /><span className="outline-text">Reach more.</span></>
              : <><span>Source smarter.</span><br /><span className="outline-text">Spend less.</span></>}
          </h2>
          <p className="mt-4 max-w-xs text-sm opacity-60">
            {portal === "vendor"
              ? "Join 500+ vendors growing their industrial business on ProcurLi."
              : "Join 200+ procurement teams running data-driven sourcing on ProcurLi."}
          </p>

          {/* Role feature list */}
          <div className="mt-8 space-y-3">
            {(portal === "buyer"
              ? [
                  { role: "Owner", desc: "Full control — billing, team, approvals, payments" },
                  { role: "Procurement", desc: "Raise PRs, RFQs, POs, browse marketplace" },
                  { role: "Approver", desc: "Approve requisitions and purchase orders" },
                  { role: "Finance", desc: "Manage bills, payments, and budgets" },
                  { role: "Inventory Manager", desc: "Stock control, reorder alerts, warehouse" },
                  { role: "Inventory Staff", desc: "Record stock-in / stock-out movements" },
                ]
              : [
                  { role: "Owner", desc: "Full access including billing and team management" },
                  { role: "Admin", desc: "Manage products, orders, deliveries, storefront" },
                  { role: "Sales / Staff", desc: "Manage products and orders" },
                  { role: "Finance", desc: "Invoices, payouts, and bank details" },
                ]
            ).map((r) => (
              <div key={r.role} className="flex items-start gap-3">
                <span className="mt-[3px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/15 text-[9px] font-bold text-white">
                  ✓
                </span>
                <div>
                  <span className="text-xs font-bold text-white">{r.role}</span>
                  <span className="ml-2 text-[11px] opacity-60">{r.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reusable field helpers ───────────────────────────────────────────────────
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

function PasswordField({
  label, id, value, show, onToggle, onChange, placeholder,
}: {
  label: string;
  id: string;
  value: string;
  show: boolean;
  onToggle: () => void;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="t-label mb-2 block text-xs font-semibold text-foreground">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete="new-password"
          required
          className="h-11 w-full rounded-sm border border-border bg-card px-3 pr-10 text-sm outline-none focus:border-foreground"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}
