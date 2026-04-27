/* eslint-disable no-empty */
/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { ArrowRight, ShoppingCart, Store, Eye, EyeOff } from "lucide-react";
import { TEAM_MEMBERS, ROLE_LABELS } from "@/lib/mock-data";
import { BUYER_TEAM, BUYER_ROLE_LABELS } from "@/lib/buyer-mock-data";
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

function LoginPage() {
  const [portal, setPortal] = React.useState<Portal>("vendor");
  const theme = PORTAL_THEME[portal];

  return (
    <div className="min-h-screen w-full bg-paper p-4 md:p-8">
      <div className="mx-auto flex max-w-6xl flex-col-reverse overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)] md:flex-row md:min-h-[680px]">
        {/* LEFT — form */}
        <div className="flex w-full flex-col px-6 py-8 md:w-[52%] md:px-12 md:py-10">
          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-2">
            {/* <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", theme.tint)}>
              <span className="font-display text-sm font-extrabold text-white">P</span>
            </span> */}
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

          <DemoLogin portal={portal} theme={theme} />

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

function DemoLogin({ portal, theme }: { portal: Portal; theme: typeof PORTAL_THEME[Portal] }) {
  const navigate = useNavigate();
  const team = portal === "vendor" ? TEAM_MEMBERS : BUYER_TEAM;
  const roleLabels = portal === "vendor" ? ROLE_LABELS : BUYER_ROLE_LABELS;

  const [email, setEmail] = React.useState(team[0].email);
  const [password, setPassword] = React.useState("demo");
  const [showPw, setShowPw] = React.useState(false);

  React.useEffect(() => {
    setEmail(team[0].email);
  }, [portal, team]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = team.find((m) => m.email === email) ?? team[0];
    if (portal === "vendor") {
      try { window.localStorage.setItem("procurli:vendor:userId", match.id); } catch {}
      navigate({ to: "/vendor" });
    } else {
      try { window.localStorage.setItem("procurli:buyer:userId", match.id); } catch {}
      navigate({ to: "/buyer" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Business email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition-colors focus:border-foreground"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-foreground">Password</label>
        <div className="relative">
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPw ? "text" : "password"}
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
        type="submit"
        className={cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90", theme.tint)}
      >
        Sign in to {portal === "vendor" ? "vendor" : "buyer"} portal <ArrowRight className="h-4 w-4" />
      </button>

    </form>
  );
}

/* ----------------------------------------------------------------
   SVG illustration scene — shifts mood per portal
----------------------------------------------------------------- */
function SceneIllustration({ portal }: { portal: Portal }) {
  const isVendor = portal === "vendor";
  const accent = isVendor ? "#f59e0b" : "#059669";
  const accentDark = isVendor ? "#b45309" : "#065f46";
  const skin = "#fcd9b8";
  const shirt = isVendor ? "#fbbf24" : "#34d399";

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
