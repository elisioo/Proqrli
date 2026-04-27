import { U as jsxRuntimeExports, r as reactExports } from "./worker-entry.js";
import { P as PageHeader } from "./PageHeader.js";
import { P as PermissionGate } from "./PermissionGate.js";
import { u as useVendor } from "./vendor-context.js";
import { T as TEAM_MEMBERS, R as ROLE_LABELS, a as ROLE_DESCRIPTIONS } from "./router.js";
import { T as THEME_PRESETS } from "./color-utils.js";
import { c as cn } from "./utils.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./lock.js";
import "./createLucideIcon.js";
const TABS = [{
  id: "profile",
  label: "Profile"
}, {
  id: "bank",
  label: "Bank details"
}, {
  id: "team",
  label: "Team & RBAC"
}, {
  id: "theme",
  label: "Theme"
}];
function SettingsPage() {
  const [tab, setTab] = reactExports.useState("profile");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto flex max-w-5xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(PageHeader, { eyebrow: "Manage", title: "Settings", description: "Profile, payouts, team access, and storefront theme." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1 border-b border-border", children: TABS.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t.id), className: cn("h-10 border-b-2 px-4 text-sm font-medium transition-colors", tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"), children: t.label }, t.id)) }),
    tab === "profile" && /* @__PURE__ */ jsxRuntimeExports.jsx(ProfileTab, {}),
    tab === "bank" && /* @__PURE__ */ jsxRuntimeExports.jsx(BankTab, {}),
    tab === "team" && /* @__PURE__ */ jsxRuntimeExports.jsx(TeamTab, {}),
    tab === "theme" && /* @__PURE__ */ jsxRuntimeExports.jsx(ThemeTab, {})
  ] });
}
function ProfileTab() {
  const {
    tenant
  } = useVendor();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Company name", value: tenant.companyName }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Industry", value: tenant.industry }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Contact email", value: tenant.contactEmail }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Storefront URL", value: `procurli.com/store/${tenant.storeSlug}` }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Tagline", value: tenant.tagline }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "t-label mb-2 block", children: "About" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { defaultValue: tenant.storeBio, className: "min-h-[100px] w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "inline-flex h-10 items-center rounded-sm bg-foreground px-5 text-sm font-medium text-background hover:opacity-85", children: "Save changes" }) })
  ] });
}
function BankTab() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "PayMongo will route your payouts to this account." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-4 md:grid-cols-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bank", value: "Bank of the Philippine Islands" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Account name", value: "Acme Industrial Supply Inc." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Account number", value: "****4421" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Branch code", value: "MNL-014" })
    ] })
  ] });
}
function TeamTab() {
  const {
    user,
    hasPermission
  } = useVendor();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    hasPermission("team:manage") && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "inline-flex h-10 items-center rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85", children: "Invite teammate" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-md border border-border bg-card", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Member" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Department" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Joined" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-4 py-3", children: "Status" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-border", children: TEAM_MEMBERS.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: cn("hover:bg-muted/40", !m.active && "opacity-50"), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background", children: m.initials }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
              m.name,
              m.id === user.id && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground", children: "(you)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[11px] text-muted-foreground", children: m.email })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: m.role }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: m.department }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3 text-muted-foreground", children: m.joinedAt }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-4 py-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("rounded-sm px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest", m.active ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground"), children: m.active ? "Active" : "Suspended" }) })
      ] }, m.id)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold mb-3", children: "Roles" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: ["vendor_owner", "vendor_admin", "vendor_staff", "vendor_finance"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-sm border border-border bg-paper-mid p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RoleBadge, { role: r }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 font-display text-base font-extrabold", children: ROLE_LABELS[r] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-[12px] leading-snug text-muted-foreground", children: ROLE_DESCRIPTIONS[r] })
      ] }, r)) })
    ] })
  ] });
}
function RoleBadge({
  role
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-foreground px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest text-background", children: ROLE_LABELS[role] });
}
function ThemeTab() {
  const {
    themeId,
    setThemeId,
    accent,
    setAccent
  } = useVendor();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold", children: "Preset themes" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Pick a starting palette tuned to your industry." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3", children: THEME_PRESETS.map((p) => {
        const active = themeId === p.id;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setThemeId(p.id), className: cn("flex flex-col gap-3 rounded-md border p-4 text-left transition-all hover:shadow-md", active ? "border-foreground" : "border-border"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-extrabold", children: p.name }),
            active && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded-sm bg-foreground px-2 py-[2px] font-mono text-[9px] font-bold uppercase tracking-widest text-background", children: "Active" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex h-12 overflow-hidden rounded-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1", style: {
              background: p.accent
            } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-paper-mid" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 bg-foreground" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[12px] leading-snug text-muted-foreground", children: p.description })
        ] }, p.id);
      }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-md border border-border bg-card p-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-extrabold", children: "Custom accent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 text-sm text-muted-foreground", children: "Override the preset accent with your brand color. Buttons, links, badges and charts adapt automatically." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: accent, onChange: (e) => setAccent(e.target.value), className: "h-12 w-20 cursor-pointer rounded-sm border border-border bg-transparent p-0" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: accent, onChange: (e) => setAccent(e.target.value), className: "h-12 w-44 rounded-sm border border-border bg-card px-3 font-mono text-sm uppercase outline-none focus:border-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-1 flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "inline-flex h-10 items-center rounded-sm bg-foreground px-4 text-sm font-medium text-background", children: "Primary button" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "inline-flex h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground", children: "Accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("a", { className: "text-sm font-semibold underline-offset-4 hover:underline", style: {
            color: accent
          }, children: "A link styled with your accent" })
        ] })
      ] })
    ] })
  ] });
}
function Field({
  label,
  value
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "t-label mb-2 block", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { defaultValue: value, className: "h-10 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground" })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(PermissionGate, { permission: "settings:view", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsPage, {}) });
export {
  SplitComponent as component
};
