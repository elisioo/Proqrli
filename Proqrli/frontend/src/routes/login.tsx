/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { ArrowRight, ShoppingCart, Store, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { TEAM_MEMBERS, ROLE_LABELS } from "@/lib/mock-data";
import { BUYER_TEAM, BUYER_ROLE_LABELS } from "@/lib/buyer-mock-data";
import { authApi, type AuthUser } from "@/lib/api";
import { cn } from "@/lib/utils";
import logo from "@/assets/logos/logo.png";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

type Portal = "vendor" | "buyer";

const PORTAL_THEME: Record<Portal, { tint: string; tintSoft: string; tintRing: string; chipBg: string; chipFg: string; sceneFrom: string; sceneTo: string }> = {
  vendor: {
    tint: "bg-amber-500",
    tintSoft: "bg-amber-50",
    tintRing: "ring-amber-500",
    chipBg: "bg-amber-500",
    chipFg: "text-white",
    sceneFrom: "from-amber-100",
    sceneTo: "to-amber-50",
  },
  buyer: {
    tint: "bg-emerald-600",
    tintSoft: "bg-emerald-50",
    tintRing: "ring-emerald-600",
    chipBg: "bg-emerald-600",
    chipFg: "text-white",
    sceneFrom: "from-emerald-100",
    sceneTo: "to-emerald-50",
  },
};


function checkPassword(pw: string) {
  return {
    length: pw.length >= 12,
    uppercase: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

function LoginPage() {
  const [portal, setPortal] = React.useState<Portal>("buyer");
  const theme = PORTAL_THEME[portal];

  return (
    <div className="min-h-screen w-full bg-paper p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col-reverse overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)] md:flex-row md:min-h-[680px]">
        {/* LEFT — form */}
        <div className="flex w-full flex-col px-6 py-8 md:w-[52%] md:px-12 md:py-10">
          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-2">
            <img src={logo} alt="ProcurLi Logo" className="w-[100px]"/>
          </Link>

          {/* Portal selector */}
          <div className="mt-10 inline-flex w-fit gap-1 rounded-full bg-paper-mid p-1">
            {(["vendor", "buyer"] as Portal[]).map((p) => {
              const active = p === portal;
              const Icon = p === "vendor" ? Store : ShoppingCart;
              return (
                <button
                  key={p}
                  onClick={() => setPortal(p)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all",
                    active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {p === "vendor" ? "I sell" : "I buy"}
                </button>
              );
            })}
          </div>

          <h1 className="mt-8 font-display text-[40px] leading-[1.05] font-extrabold tracking-tight md:text-5xl">
            Welcome <br className="hidden sm:block" /> back.
          </h1>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {portal === "vendor"
              ? "Sign back into your vendor cockpit — orders, payouts, and storefront in one place."
              : "Pick up your sourcing right where you left it — RFQs, POs, and approvals."}
          </p>

          <LoginForm portal={portal} theme={theme} />

          <p className="mt-8 text-center text-sm text-muted-foreground md:text-left">
            New to ProcurLi?{" "}
            <Link to="/register" className="font-semibold text-foreground underline-offset-4 hover:underline">
              Create an account →
            </Link>
          </p>
        </div>

        {/* RIGHT — illustration */}
        <div className={cn("relative w-full overflow-hidden md:w-[48%]", "bg-gradient-to-br", theme.sceneFrom, theme.sceneTo)}>
          <SceneIllustration portal={portal} />
        </div>
      </div>
    </div>
  );
}

// ─── Login form (real API + mock fallback) ───────────────────────────────────
function LoginForm({ portal, theme }: { portal: Portal; theme: typeof PORTAL_THEME[Portal] }) {
  const navigate = useNavigate();
  const team = portal === "vendor" ? TEAM_MEMBERS : BUYER_TEAM;

  const [step, setStep] = React.useState<"login" | "otp" | "changePassword">("login");
  const [email, setEmail]     = React.useState("");
  const [password, setPassword] = React.useState("");
  const [otp, setOtp]         = React.useState("");
  const [newPw, setNewPw]     = React.useState("");
  const [confirmPw, setConfirmPw] = React.useState("");
  const [showPw, setShowPw]   = React.useState(false);
  const [showCPw, setShowCPw]   = React.useState(false);
  const [loading, setLoading]  = React.useState(false);
  const [error, setError]      = React.useState<string | null>(null);
  const [info, setInfo]        = React.useState<string | null>(null);

  const pwStrength = checkPassword(newPw);
  const pwOk = Object.values(pwStrength).every(Boolean) && newPw === confirmPw;

  React.useEffect(() => {
    setEmail("");
    setPassword("");
    setOtp("");
    setNewPw("");
    setConfirmPw("");
    setError(null);
    setInfo(null);
    setStep("login");
  }, [portal, team]);

  const finishSession = (user: AuthUser) => {
    if (portal === "buyer") {
      try { window.localStorage.setItem("procurli:buyer:realUser", JSON.stringify(user)); } catch {}
      try { window.localStorage.setItem("procurli:buyer:userId", `real:${user.userId}`); } catch {}
      navigate({ to: "/buyer" });
    } else {
      try { window.localStorage.setItem("procurli:vendor:userId", `real:${user.userId}`); } catch {}
      navigate({ to: "/vendor" });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });

      // Check if this is an invited user requiring OTP
      if ((res as any).requiresOtp === true) {
        setInfo("A verification code has been sent to your inbox.");
        setStep("otp");
        setLoading(false);
        return;
      }

      finishSession(res);
    } catch (apiErr) {
      const isMockPassword = password === "demo" || password === "";
      const mockMatch = team.find((m) => m.email === email);

      if (isMockPassword && mockMatch) {
        if (portal === "vendor") {
          try { window.localStorage.setItem("procurli:vendor:userId", mockMatch.id); } catch {}
          navigate({ to: "/vendor" });
        } else {
          try { window.localStorage.setItem("procurli:buyer:userId", mockMatch.id); } catch {}
          navigate({ to: "/buyer" });
        }
        return;
      }

      const msg = apiErr instanceof Error ? apiErr.message : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // We skip calling authApi.verifyOtp here because the subsequent authApi.changePassword
    // call also requires the OTP. Some backend implementations consume the OTP once verified,
    // which would cause the password change to fail with an "expired" error.
    setStep("changePassword");
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!pwOk) {
      setError("Please meet all password requirements.");
      return;
    }

    setLoading(true);
    try {
      const user = await authApi.changePassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword: newPw,
      });
      finishSession(user);
    } catch (apiErr) {
      const msg = apiErr instanceof Error ? apiErr.message : "Password change failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 space-y-4">
      {/* Error / Info banner */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {info && !error && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {info}
        </div>
      )}

      {step === "login" && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Business email</label>
            <input
              id="login-email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              type="email"
              placeholder="Enter your email"
              required
              className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition-colors focus:border-foreground"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Password</label>
            <div className="relative">
              <input
                id="login-password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                type={showPw ? "text" : "password"}
                placeholder="Enter your password"
                required
                className="h-12 w-full rounded-full border border-border bg-card px-5 pr-12 text-sm outline-none transition-colors focus:border-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            id="login-submit"
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60",
              theme.tint,
            )}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
            ) : (
              <>Sign in to {portal === "vendor" ? "vendor" : "buyer"} portal <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Verification code</label>
            <input
              value={otp}
              onChange={(e) => { setOtp(e.target.value); setError(null); }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter 6-digit code"
              required
              className="h-12 w-full rounded-full border border-border bg-card px-5 text-center text-lg font-mono tracking-[0.5em] outline-none transition-colors focus:border-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60",
              theme.tint,
            )}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Verifying…</>
            ) : (
              <>Verify code <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}

      {step === "changePassword" && (
        <form onSubmit={handleChangePassword} className="space-y-4">
          <PasswordField
            id="new-password"
            label="New password"
            placeholder="At least 12 characters"
            value={newPw}
            show={showPw}
            onToggle={() => setShowPw((v) => !v)}
            onChange={(e) => { setNewPw(e.target.value); setError(null); }}
          />

          {/* Strength indicators */}
          <div className="grid grid-cols-2 gap-1.5">
            <StrengthRow ok={pwStrength.length} label="12+ characters" />
            <StrengthRow ok={pwStrength.uppercase} label="Uppercase letter" />
            <StrengthRow ok={pwStrength.number} label="Number" />
            <StrengthRow ok={pwStrength.special} label="Special character" />
          </div>

          <PasswordField
            id="confirm-password"
            label="Confirm password"
            placeholder="Repeat password"
            value={confirmPw}
            show={showCPw}
            onToggle={() => setShowCPw((v) => !v)}
            onChange={(e) => { setConfirmPw(e.target.value); setError(null); }}
          />

          {confirmPw && (
            <p className={cn("text-xs px-2", newPw === confirmPw ? "text-emerald-600" : "text-rose-600")}>
              {newPw === confirmPw ? "✓ Passwords match" : "✗ Passwords don't match"}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !pwOk}
            className={cn(
              "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60",
              theme.tint,
            )}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Setting password…</>
            ) : (
              <>Set password & sign in <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
        </form>
      )}
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function StrengthRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={cn("flex items-center gap-1.5 text-xs px-2", ok ? "text-emerald-600" : "text-muted-foreground")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-500" : "bg-muted-foreground/40")} />
      {label}
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
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-foreground">
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
          className="h-12 w-full rounded-full border border-border bg-card px-5 pr-12 text-sm outline-none transition-colors focus:border-foreground"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   SVG illustration scene — shifts mood per portal
----------------------------------------------------------------- */
function SceneIllustration({ portal }: { portal: Portal }) {
  const isVendor = portal === "vendor";
  const accent = isVendor ? "#f59e0b" : "#059669";
  const accentDark = isVendor ? "#b45309" : "#065f46";

  return (
    <div className="relative h-full min-h-[420px] w-full">
      {/* floating geo shapes */}
      <div className="absolute left-8 top-10 h-16 w-16 rotate-12 rounded-2xl bg-white/60 shadow-md" />
      <div className="absolute right-12 top-16 h-10 w-10 rounded-full bg-white/70 shadow-md" />
      <div className="absolute right-6 bottom-32 h-14 w-14 -rotate-6 rounded-2xl bg-white/60 shadow-md" />
      <div className="absolute left-12 bottom-12 h-8 w-8 rounded-full" style={{ background: accent, opacity: 0.6 }} />

      {/* device card */}
      <div className="absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-[55%] rounded-[22px] bg-foreground/95 p-3 shadow-2xl">
        <div className="rounded-[16px] bg-white p-5">
          {/* tiny brand */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: accent }} />
            <span className="font-display text-[11px] font-extrabold tracking-tight">proqrli</span>
          </div>
          {/* dashes */}
          <div className="mt-4 flex gap-1.5">
            <span className="h-1.5 w-7 rounded-full" style={{ background: accentDark }} />
            <span className="h-1.5 w-7 rounded-full" style={{ background: accent }} />
            <span className="h-1.5 w-7 rounded-full bg-paper-dark" />
            <span className="h-1.5 w-7 rounded-full bg-paper-dark" />
          </div>
          <div className="mt-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
            Step 2 of 4
          </div>
          <div className="mt-2 font-display text-[20px] font-extrabold leading-tight">
            {isVendor ? "What do you sell?" : "What do you source?"}
          </div>

          {/* option chips */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-paper p-2">
              <div className="h-5 w-5 rounded-md bg-paper-mid" />
              <span className="text-[8px] font-semibold">Hardware</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl p-2 text-white shadow-md" style={{ background: "#1b1b1b" }}>
              <div className="h-5 w-5 rounded-md" style={{ background: accent }} />
              <span className="text-[8px] font-semibold">{isVendor ? "Equipment" : "Computers"}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-paper p-2">
              <div className="h-5 w-5 rounded-md bg-paper-mid" />
              <span className="text-[8px] font-semibold">Chemicals</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button className="rounded-full border border-border px-3 py-1 text-[9px] font-semibold">Back</button>
            <button className="rounded-full px-4 py-1.5 text-[9px] font-semibold text-white" style={{ background: accent }}>Continue</button>
          </div>
        </div>
      </div>

      {/* footer caption */}
      <div className="absolute bottom-6 left-8 right-8 text-[11px] font-mono uppercase tracking-widest text-foreground/70">
        ProcurLi · {isVendor ? "Vendor portal" : "Buyer portal"}
      </div>
    </div>
  );
}
