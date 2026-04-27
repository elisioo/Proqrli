import { r as reactExports, U as jsxRuntimeExports } from "./worker-entry.js";
import { L as Link, u as useNavigate, T as TEAM_MEMBERS, B as BUYER_TEAM, R as ROLE_LABELS, c as BUYER_ROLE_LABELS } from "./router.js";
import { c as cn } from "./utils.js";
import { l as logo } from "./logo.js";
import { S as Store } from "./store.js";
import { S as ShoppingCart } from "./shopping-cart.js";
import { c as createLucideIcon } from "./createLucideIcon.js";
import { A as ArrowRight } from "./arrow-right.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode$1 = [
  [
    "path",
    {
      d: "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49",
      key: "ct8e1f"
    }
  ],
  ["path", { d: "M14.084 14.158a3 3 0 0 1-4.242-4.242", key: "151rxh" }],
  [
    "path",
    {
      d: "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143",
      key: "13bj9a"
    }
  ],
  ["path", { d: "m2 2 20 20", key: "1ooewy" }]
];
const EyeOff = createLucideIcon("eye-off", __iconNode$1);
const __iconNode = [
  [
    "path",
    {
      d: "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0",
      key: "1nclc0"
    }
  ],
  ["circle", { cx: "12", cy: "12", r: "3", key: "1v7zrd" }]
];
const Eye = createLucideIcon("eye", __iconNode);
const PORTAL_THEME = {
  vendor: {
    tint: "bg-amber-500",
    tintSoft: "bg-amber-50",
    tintRing: "ring-amber-500",
    chipBg: "bg-amber-500",
    chipFg: "text-white",
    sceneFrom: "from-amber-100",
    sceneTo: "to-amber-50"
  },
  buyer: {
    tint: "bg-emerald-600",
    tintSoft: "bg-emerald-50",
    tintRing: "ring-emerald-600",
    chipBg: "bg-emerald-600",
    chipFg: "text-white",
    sceneFrom: "from-emerald-100",
    sceneTo: "to-emerald-50"
  }
};
function LoginPage() {
  const [portal, setPortal] = reactExports.useState("vendor");
  const theme = PORTAL_THEME[portal];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen w-full bg-paper p-4 md:p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-6xl flex-col-reverse overflow-hidden rounded-[28px] border border-border bg-card shadow-[0_30px_80px_-30px_rgba(0,0,0,0.18)] md:flex-row md:min-h-[680px]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex w-full flex-col px-6 py-8 md:w-[52%] md:px-12 md:py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "inline-flex items-center gap-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: logo, alt: "ProcurLi Logo", className: "w-[100px]" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-10 inline-flex w-fit gap-1 rounded-full bg-paper-mid p-1", children: ["vendor", "buyer"].map((p) => {
        const active = p === portal;
        const Icon = p === "vendor" ? Store : ShoppingCart;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setPortal(p), className: cn("inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all", active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-3.5 w-3.5" }),
          p === "vendor" ? "I sell" : "I buy"
        ] }, p);
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-8 font-display text-[40px] leading-[1.05] font-extrabold tracking-tight md:text-5xl", children: [
        "Welcome ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("br", { className: "hidden sm:block" }),
        " back."
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 max-w-sm text-sm text-muted-foreground", children: portal === "vendor" ? "Sign back into your vendor cockpit — orders, payouts, and storefront in one place." : "Pick up your sourcing right where you left it — RFQs, POs, and approvals." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DemoLogin, { portal, theme }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-8 text-center text-sm text-muted-foreground md:text-left", children: [
        "New to ProcurLi?",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/register", className: "font-semibold text-foreground underline-offset-4 hover:underline", children: "Create an account →" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("relative w-full overflow-hidden md:w-[48%]", "bg-gradient-to-br", theme.sceneFrom, theme.sceneTo), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SceneIllustration, { portal }) })
  ] }) });
}
function DemoLogin({
  portal,
  theme
}) {
  const navigate = useNavigate();
  const team = portal === "vendor" ? TEAM_MEMBERS : BUYER_TEAM;
  const roleLabels = portal === "vendor" ? ROLE_LABELS : BUYER_ROLE_LABELS;
  const [email, setEmail] = reactExports.useState(team[0].email);
  const [password, setPassword] = reactExports.useState("demo");
  const [showPw, setShowPw] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setEmail(team[0].email);
  }, [portal, team]);
  const handleSubmit = (e) => {
    e.preventDefault();
    const match = team.find((m) => m.email === email) ?? team[0];
    if (portal === "vendor") {
      try {
        window.localStorage.setItem("procurli:vendor:userId", match.id);
      } catch {
      }
      navigate({
        to: "/vendor"
      });
    } else {
      try {
        window.localStorage.setItem("procurli:buyer:userId", match.id);
      } catch {
      }
      navigate({
        to: "/buyer"
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "mt-8 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1.5 block text-xs font-semibold text-foreground", children: "Business email" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", className: "h-12 w-full rounded-full border border-border bg-card px-5 text-sm outline-none transition-colors focus:border-foreground" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-1.5 block text-xs font-semibold text-foreground", children: "Password" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: password, onChange: (e) => setPassword(e.target.value), type: showPw ? "text" : "password", className: "h-12 w-full rounded-full border border-border bg-card px-5 pr-12 text-sm outline-none transition-colors focus:border-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPw((v) => !v), className: "absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", children: showPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "submit", className: cn("inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90", theme.tint), children: [
      "Sign in to ",
      portal === "vendor" ? "vendor" : "buyer",
      " portal ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "h-4 w-4" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("rounded-2xl p-4", theme.tintSoft), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "t-label mb-2", children: "Demo accounts (click to fill)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: team.filter((m) => m.active).slice(0, 4).map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: () => setEmail(m.email), className: "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs hover:bg-card", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: m.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: roleLabels[m.role] })
      ] }, m.id)) })
    ] })
  ] });
}
function SceneIllustration({
  portal
}) {
  const isVendor = portal === "vendor";
  const accent = isVendor ? "#f59e0b" : "#059669";
  const accentDark = isVendor ? "#b45309" : "#065f46";
  const skin = "#fcd9b8";
  const shirt = isVendor ? "#fbbf24" : "#34d399";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-full min-h-[420px] w-full", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-8 top-10 h-16 w-16 rotate-12 rounded-2xl bg-white/60 shadow-md" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-12 top-16 h-10 w-10 rounded-full bg-white/70 shadow-md" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-6 bottom-32 h-14 w-14 -rotate-6 rounded-2xl bg-white/60 shadow-md" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-12 bottom-12 h-8 w-8 rounded-full", style: {
      background: accent,
      opacity: 0.6
    } }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-1/2 top-1/2 w-[78%] -translate-x-1/2 -translate-y-[55%] rounded-[22px] bg-foreground/95 p-3 shadow-2xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-[16px] bg-white p-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-2.5 w-2.5 rounded-sm", style: {
          background: accent
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-[11px] font-extrabold tracking-tight", children: "proqrli" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-7 rounded-full", style: {
          background: accentDark
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-7 rounded-full", style: {
          background: accent
        } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-7 rounded-full bg-paper-dark" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "h-1.5 w-7 rounded-full bg-paper-dark" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-[9px] font-mono uppercase tracking-widest text-muted-foreground", children: "Step 2 of 4" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-display text-[20px] font-extrabold leading-tight", children: isVendor ? "What do you sell?" : "What do you source?" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-3 gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 rounded-xl border border-border bg-paper p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 rounded-md bg-paper-mid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-semibold", children: "Hardware" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 rounded-xl p-2 text-white shadow-md", style: {
          background: "#1b1b1b"
        }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 rounded-md", style: {
            background: accent
          } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-semibold", children: isVendor ? "Equipment" : "Computers" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center gap-1 rounded-xl border border-border bg-paper p-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-5 w-5 rounded-md bg-paper-mid" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[8px] font-semibold", children: "Chemicals" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-full border border-border px-3 py-1 text-[9px] font-semibold", children: "Back" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "rounded-full px-4 py-1.5 text-[9px] font-semibold text-white", style: {
          background: accent
        }, children: "Continue" })
      ] })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", { viewBox: "0 0 200 200", className: "absolute -right-2 bottom-0 h-[42%] w-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "30", y: "80", width: "120", height: "90", rx: "12", fill: "#1b1b1b", opacity: "0.85" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "55", y: "95", width: "90", height: "80", rx: "20", fill: shirt }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "100", cy: "70", r: "28", fill: skin }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M72 65 Q78 38 100 38 Q124 38 128 65 Q120 50 100 52 Q80 52 72 65 Z", fill: "#3b2417" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "91", cy: "72", r: "6", fill: "none", stroke: "#1b1b1b", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("circle", { cx: "109", cy: "72", r: "6", fill: "none", stroke: "#1b1b1b", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("line", { x1: "97", y1: "72", x2: "103", y2: "72", stroke: "#1b1b1b", strokeWidth: "2" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("path", { d: "M92 84 Q100 92 108 84", stroke: "#1b1b1b", strokeWidth: "2", fill: "none", strokeLinecap: "round" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "40", y: "155", width: "120", height: "14", rx: "3", fill: "#1b1b1b" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("rect", { x: "50", y: "135", width: "100", height: "22", rx: "3", fill: "#e5e7eb" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-6 left-8 right-8 text-[11px] font-mono uppercase tracking-widest text-foreground/70", children: [
      "ProcurLi · ",
      isVendor ? "Vendor portal" : "Buyer portal"
    ] })
  ] });
}
export {
  LoginPage as component
};
