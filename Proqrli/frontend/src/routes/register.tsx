/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import {
  AlertCircle, Loader2, Eye, EyeOff, Mail, ShieldCheck, Lock,
  CheckCircle2, ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authApi } from "@/lib/api";
import logo from "@/assets/logos/logo.png";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

type Portal = "vendor" | "buyer";
type Step   = "email" | "otp" | "password";

// ─── Password strength checker ────────────────────────────────────────────────
function checkPassword(pw: string) {
  return {
    length:    pw.length >= 12,
    uppercase: /[A-Z]/.test(pw),
    number:    /[0-9]/.test(pw),
    special:   /[^A-Za-z0-9]/.test(pw),
  };
}

function RegisterPage() {
  const navigate = useNavigate();
  const [portal, setPortal] = React.useState<Portal>("buyer");
  const [step, setStep]     = React.useState<Step>("email");

  // ── Shared state across steps ──────────────────────────────────────────────
  const [email,     setEmail]     = React.useState("");
  const [otp,       setOtp]       = React.useState("");
  const [password,  setPassword]  = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [showPw,    setShowPw]    = React.useState(false);
  const [showCPw,   setShowCPw]   = React.useState(false);
  const [devCode,   setDevCode]   = React.useState<string | null>(null);  // shown in dev

  const [loading, setLoading] = React.useState(false);
  const [error,   setError]   = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const pwStrength = checkPassword(password);
  const pwOk = Object.values(pwStrength).every(Boolean) && password === confirmPw;

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendOtp({ email: email.trim().toLowerCase() });
      setSuccess(res.message);
      if (res.devCode) setDevCode(res.devCode);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (otp.trim().length !== 6) { setError("Enter the 6-digit code."); return; }
    setLoading(true);
    try {
      await authApi.verifyOtp({ email: email.trim().toLowerCase(), code: otp.trim() });
      setStep("password");
      setSuccess(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Create account ────────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!pwOk) { setError("Please meet all password requirements."); return; }
    setLoading(true);
    try {
      const user = await authApi.register({
        email:    email.trim().toLowerCase(),
        password,
        portal,
      });
      // Store session
      try { window.localStorage.setItem("procurli:buyer:realUser", JSON.stringify(user)); } catch {}
      try { window.localStorage.setItem("procurli:buyer:userId",   `real:${user.userId}`); } catch {}
      // New account → onboarding
      navigate({ to: "/onboarding", search: { portal } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step progress dots ────────────────────────────────────────────────────
  const steps: Step[] = ["email", "otp", "password"];
  const stepIdx       = steps.indexOf(step);

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Left panel ─────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col justify-start overflow-y-auto px-6 py-10 md:w-[52%] md:px-14">
        <Link to="/" className="mb-8 inline-flex items-center gap-2">
          <img src={logo} alt="ProcurLi Logo" className="w-[100px]" />
        </Link>

        {/* Portal selector — only visible on step 1 */}
        {step === "email" && (
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
        )}

        {/* Step back link for otp/password */}
        {step !== "email" && (
          <button
            type="button"
            onClick={() => { setStep(step === "password" ? "otp" : "email"); setError(null); }}
            className="mb-6 inline-flex items-center gap-1.5 self-start text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </button>
        )}

        {/* Progress indicator */}
        <div className="mb-6 flex items-center gap-2">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors",
                i < stepIdx  ? "bg-emerald-600 text-white" :
                i === stepIdx ? "bg-foreground text-background" :
                                "border border-border text-muted-foreground",
              )}>
                {i < stepIdx ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={cn("h-px flex-1 transition-colors", i < stepIdx ? "bg-emerald-600" : "bg-border")} />
              )}
            </React.Fragment>
          ))}
        </div>

        {}
        {step === "email" && (
          <>
            <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10">
              <Mail className="h-5 w-5" />
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold">
              {portal === "vendor" ? "Create your vendor account" : "Create your procurement workspace"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We'll send a verification code to confirm your email address.
            </p>

            <form onSubmit={handleSendOtp} className="mt-8 space-y-4">
              <ErrorBanner error={error} />
              <div>
                <label htmlFor="reg-email" className="t-label mb-2 block text-xs font-semibold text-foreground">
                  Business email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(null); }}
                  required
                  className="h-12 w-full rounded-sm border border-border bg-card px-4 text-sm outline-none focus:border-foreground"
                />
              </div>

              <button
                id="reg-send-otp"
                type="submit"
                disabled={loading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-foreground text-sm font-semibold text-background hover:opacity-85 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending code…</> : "Send verification code →"}
              </button>
            </form>
          </>
        )}

        {step === "otp" && (
          <>
            <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold">Check your inbox</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a 6-digit code to <span className="font-semibold text-foreground">{email}</span>. Enter it below.
            </p>

            {/* Dev helper */}
            {devCode && (
              <div className="mt-4 flex items-center gap-2 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                <span className="font-mono font-bold">DEV MODE — your code: {devCode}</span>
                <button type="button" className="ml-auto text-[10px] underline" onClick={() => setOtp(devCode)}>
                  Auto-fill
                </button>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="mt-8 space-y-4">
              <ErrorBanner error={error} />
              <div>
                <label htmlFor="reg-otp" className="t-label mb-2 block text-xs font-semibold text-foreground">
                  Verification code
                </label>
                <input
                  id="reg-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, "")); setError(null); }}
                  className="h-12 w-full rounded-sm border border-border bg-card px-4 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-foreground"
                />
              </div>

              <button
                id="reg-verify-otp"
                type="submit"
                disabled={loading || otp.length !== 6}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-foreground text-sm font-semibold text-background hover:opacity-85 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</> : "Verify code →"}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                Didn't receive it?{" "}
                <button
                  type="button"
                  className="font-semibold text-foreground hover:underline"
                  onClick={() => { setStep("email"); setOtp(""); setDevCode(null); setError(null); }}
                >
                  Resend code
                </button>
              </p>
            </form>
          </>
        )}

        {/* ── STEP 3: Password ──────────────────────────────────────────────── */}
        {step === "password" && (
          <>
            <div className="mb-1 inline-flex h-10 w-10 items-center justify-center rounded-full bg-foreground/10">
              <Lock className="h-5 w-5" />
            </div>
            <h1 className="mt-3 font-display text-3xl font-extrabold">Set your password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Choose a strong password to protect your account.
            </p>

            <form onSubmit={handleRegister} className="mt-8 space-y-4">
              <ErrorBanner error={error} />

              <PasswordField
                id="reg-password"
                label="Password"
                placeholder="At least 12 characters"
                value={password}
                show={showPw}
                onToggle={() => setShowPw((v) => !v)}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
              />

              {/* Strength indicators */}
              <div className="grid grid-cols-2 gap-1.5">
                <StrengthRow ok={pwStrength.length}    label="12+ characters" />
                <StrengthRow ok={pwStrength.uppercase} label="Uppercase letter" />
                <StrengthRow ok={pwStrength.number}    label="Number" />
                <StrengthRow ok={pwStrength.special}   label="Special character" />
              </div>

              <PasswordField
                id="reg-confirm-password"
                label="Confirm password"
                placeholder="Repeat password"
                value={confirmPw}
                show={showCPw}
                onToggle={() => setShowCPw((v) => !v)}
                onChange={(e) => { setConfirmPw(e.target.value); setError(null); }}
              />

              {confirmPw && (
                <p className={cn("text-xs", password === confirmPw ? "text-emerald-600" : "text-rose-600")}>
                  {password === confirmPw ? "✓ Passwords match" : "✗ Passwords don't match"}
                </p>
              )}

              <button
                id="reg-submit"
                type="submit"
                disabled={loading || !pwOk}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-sm bg-foreground text-sm font-semibold text-background hover:opacity-85 disabled:opacity-60"
              >
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Creating account…</> : "Create account →"}
              </button>
            </form>
          </>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-foreground underline-offset-4 hover:underline">
            Sign in →
          </Link>
        </p>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────────────── */}
      <div className="relative hidden flex-1 overflow-hidden bg-foreground md:block">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="relative z-10 flex h-full flex-col justify-end p-12 text-background">
          <div className="mb-6 space-y-3">
            <StepCard active={step === "email"}    num={1} title="Verify your email"     desc="Enter your business email to receive a one-time code." />
            <StepCard active={step === "otp"}      num={2} title="Enter the OTP"          desc="A 6-digit code is sent to your inbox — valid for 10 minutes." />
            <StepCard active={step === "password"} num={3} title="Set a secure password" desc="12+ characters with uppercase, number & special character." />
          </div>
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
        </div>
      </div>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function ErrorBanner({ error }: { error: string | null }) {
  if (!error) return null;
  return (
    <div className="flex items-start gap-2 rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs", ok ? "text-emerald-600" : "text-muted-foreground")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-muted-foreground/40")} />
      {label}
    </div>
  );
}

function StepCard({ active, num, title, desc }: { active: boolean; num: number; title: string; desc: string }) {
  return (
    <div className={cn(
      "rounded-sm p-3 transition-all",
      active ? "bg-white/15 ring-1 ring-white/30" : "opacity-40",
    )}>
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 font-mono text-[10px] font-bold text-white">
          {num}
        </span>
        <span className="text-xs font-bold text-white">{title}</span>
      </div>
      <p className="mt-1 pl-7 text-[11px] text-white/60">{desc}</p>
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
          className="h-12 w-full rounded-sm border border-border bg-card px-4 pr-11 text-sm outline-none focus:border-foreground"
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
