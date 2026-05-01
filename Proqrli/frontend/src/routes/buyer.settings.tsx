import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { useBuyer } from "@/lib/buyer-context";
import { BUYER_TEAM, BUYER_ROLE_LABELS, BUYER_ROLE_DESCRIPTIONS, type BuyerRole } from "@/lib/buyer-mock-data";
import { THEME_PRESETS } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/buyer/settings")({
  component: () => (
    <BuyerPermissionGate permission="settings:view">
      <SettingsPage />
    </BuyerPermissionGate>
  ),
});

function SettingsPage() {
  const { tenant, themeId, setThemeId, accent, setAccent, hasPermission } = useBuyer();
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description={`Configure ${tenant.companyName} — your team, theme, and integrations.`}
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="team" disabled={!hasPermission("team:view")}>Team & RBAC</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="budget" disabled={!hasPermission("budget:view")}>Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="t-label mb-4">Company profile</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Company name" defaultValue={tenant.companyName} />
              <Field label="Industry" defaultValue={tenant.industry} />
              <Field label="Procurement email" defaultValue={tenant.contactEmail} />
              <Field label="Tax ID / TIN" defaultValue="000-123-456-001" />
            </div>
            <button className="mt-6 h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">Save changes</button>
          </div>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="t-label">Team & roles</span>
              {hasPermission("team:manage") && <button className="h-9 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85">+ Invite member</button>}
            </div>
            <ul className="divide-y divide-border">
              {BUYER_TEAM.map((m) => (
                <li key={m.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                  <div className="col-span-4 flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">{m.initials}</span>
                    <div>
                      <div className="text-sm font-semibold">{m.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{m.email}</div>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground">{m.department}</div>
                  <div className="col-span-3">
                    <RolePill role={m.role} />
                  </div>
                  <div className="col-span-2 font-mono text-[10px] text-muted-foreground">Joined {m.joinedAt}</div>
                  <div className="col-span-1 text-right">
                    <span className={cn("inline-block h-2 w-2 rounded-full", m.active ? "bg-emerald-500" : "bg-rose-500")} />
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-border bg-paper-mid p-5">
              <div className="t-label mb-3">Role permission matrix</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(BUYER_ROLE_LABELS) as BuyerRole[]).map((r) => (
                  <div key={r} className="rounded-sm border border-border bg-card p-3">
                    <div className="font-display text-sm font-extrabold">{BUYER_ROLE_LABELS[r]}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{BUYER_ROLE_DESCRIPTIONS[r]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="theme" className="mt-6">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="t-label mb-4">Marketplace theme</div>
            <p className="mb-6 text-sm text-muted-foreground">Choose how your procurement workspace feels. Picks a coordinated accent across charts, buttons, and badges.</p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setThemeId(p.id)}
                  className={cn(
                    "flex flex-col gap-3 rounded-md border-2 p-4 text-left transition-all hover:shadow-sm",
                    themeId === p.id ? "border-foreground" : "border-border",
                  )}
                >
                  <div className="flex h-12 w-full rounded-sm" style={{ background: p.accent }} />
                  <div>
                    <div className="font-display text-base font-extrabold">{p.name}</div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-6">
              <div className="t-label mb-3">Custom accent</div>
              <div className="flex items-center gap-3">
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-12 w-20 cursor-pointer rounded-sm border border-border bg-transparent p-0" />
                <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-11 w-44 rounded-sm border border-border bg-paper px-3 font-mono text-sm uppercase outline-none focus:border-foreground" />
                <span className="rounded-sm px-3 py-2 text-sm font-semibold" style={{ background: "var(--accent-solid)", color: "var(--accent-foreground-solid)" }}>Preview button</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-6">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="t-label mb-4">FY budget controls</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Annual procurement budget" defaultValue="850,000" />
              <Field label="PO approval threshold" defaultValue="10,000" />
              <Field label="Bill auto-pay limit" defaultValue="2,500" />
              <Field label="Required approvers ≥ threshold" defaultValue="2" />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">POs over threshold require approval from a member with <span className="font-semibold">Approver</span> or <span className="font-semibold">Owner</span> role.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="t-label mb-2 block">{label}</label>
      <input {...props} className="h-11 w-full rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" />
    </div>
  );
}

function RolePill({ role }: { role: BuyerRole }) {
  const tones: Record<BuyerRole, string> = {
    buyer_owner:       "bg-foreground text-background",
    buyer_procurement: "bg-sky-100 text-sky-800 border border-sky-200",
    buyer_approver:    "bg-amber-100 text-amber-800 border border-amber-200",
    buyer_finance:     "bg-emerald-100 text-emerald-800 border border-emerald-200",
    inventory_staff:   "bg-violet-100 text-violet-800 border border-violet-200",
    inventory_manager: "bg-teal-100 text-teal-800 border border-teal-200",
  };
  return (
    <span className={cn("inline-block rounded-sm px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest", tones[role])}>
      {BUYER_ROLE_LABELS[role]}
    </span>
  );
}
