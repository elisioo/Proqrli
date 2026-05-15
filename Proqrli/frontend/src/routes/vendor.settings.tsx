import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { useVendor } from "@/lib/vendor-context";
import { CloudinaryUploadWidget } from "@/components/CloudinaryUploadWidget";
import { TEAM_MEMBERS, ROLE_LABELS, ROLE_DESCRIPTIONS, type VendorRole } from "@/lib/mock-data";
import { THEME_PRESETS } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { vendorStoreApi } from "@/lib/api";

export const Route = createFileRoute("/vendor/settings")({
  component: () => (
    <PermissionGate permission="settings:view">
      <SettingsPage />
    </PermissionGate>
  ),
});

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "bank", label: "Bank details" },
  { id: "team", label: "Team & RBAC" },
  { id: "theme", label: "Theme" },
] as const;
type Tab = (typeof TABS)[number]["id"];

function SettingsPage() {
  const [tab, setTab] = React.useState<Tab>("profile");
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader eyebrow="Manage" title="Settings" description="Profile, payouts, team access, and storefront theme." />
      <div className="flex flex-wrap gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn("h-10 border-b-2 px-4 text-sm font-medium transition-colors", tab === t.id ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "profile" && <ProfileTab />}
      {tab === "bank" && <BankTab />}
      {tab === "team" && <TeamTab />}
      {tab === "theme" && <ThemeTab />}
    </div>
  );
}

function ProfileTab() {
  const { tenant } = useVendor();
  const [logoPath, setLogoPath] = React.useState<string | null | undefined>(tenant.logoPath);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    vendorStoreApi
      .getProfile()
      .then((profile) => {
        if (!cancelled) setLogoPath(profile.logoPath ?? tenant.logoPath);
      })
      .catch(() => {
        // Silently fall back to mock data if the endpoint is unavailable
      });
    return () => { cancelled = true; };
  }, [tenant.logoPath]);

  async function handleLogoUpload(url: string) {
    setIsUploading(true);
    try {
      const result = await vendorStoreApi.updateLogo(url);
      setLogoPath(result.logoPath);
    } catch (err) {
      console.error("Failed to save logo URL:", err);
      alert("Logo uploaded to Cloudinary but failed to save. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">

      <div className="mb-6 flex items-end gap-6">
          <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed border-border bg-muted/40 overflow-hidden">
              {logoPath ? (
                  <img src={logoPath} alt="Logo" className="h-full w-full object-contain" />
              ) : (
                  <span className="text-xs text-muted-foreground">No logo</span>
              )}
          </div>
          <div className="flex flex-col gap-2">
              <label className="t-label">Company Logo</label>
              <CloudinaryUploadWidget
                  preset="proqrli_vendor_profiles"
                  onUpload={handleLogoUpload}
                  label={isUploading ? "Saving…" : "Upload Logo"}
              />
              <p className="text-[11px] text-muted-foreground">JPG, PNG, or WebP. Max 5MB.</p>
          </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Company name" value={tenant.companyName} />
        <Field label="Industry" value={tenant.industry} />
        <Field label="Contact email" value={tenant.contactEmail} />
        <Field label="Storefront URL" value={`procurli.com/store/${tenant.storeSlug}`} />
        <div className="md:col-span-2">
          <Field label="Tagline" value={tenant.tagline} />
        </div>
        <div className="md:col-span-2">
          <label className="t-label mb-2 block">About</label>
          <textarea defaultValue={tenant.storeBio} className="min-h-[100px] w-full rounded-sm border border-border bg-card px-3 py-2 text-sm outline-none focus:border-foreground" />
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="inline-flex h-10 items-center rounded-sm bg-foreground px-5 text-sm font-medium text-background hover:opacity-85">Save changes</button>
      </div>
    </div>
  );
}

function BankTab() {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <p className="mb-4 text-sm text-muted-foreground">PayMongo will route your payouts to this account.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Bank" value="Bank of the Philippine Islands" />
        <Field label="Account name" value="Acme Industrial Supply Inc." />
        <Field label="Account number" value="****4421" />
        <Field label="Branch code" value="MNL-014" />
      </div>
    </div>
  );
}

function TeamTab() {
  const { user, hasPermission } = useVendor();
  return (
    <div className="space-y-4">
      {hasPermission("team:manage") && (
        <div className="flex justify-end">
          <button className="inline-flex h-10 items-center rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">Invite teammate</button>
        </div>
      )}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TEAM_MEMBERS.map((m) => (
              <tr key={m.id} className={cn("hover:bg-muted/40", !m.active && "opacity-50")}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">{m.initials}</span>
                    <div>
                      <div className="font-medium">{m.name}{m.id === user.id && <span className="ml-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">(you)</span>}</div>
                      <div className="text-[11px] text-muted-foreground">{m.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={m.role} /></td>
                <td className="px-4 py-3 text-muted-foreground">{m.department}</td>
                <td className="px-4 py-3 text-muted-foreground">{m.joinedAt}</td>
                <td className="px-4 py-3">
                  <span className={cn("rounded-sm px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest", m.active ? "bg-emerald-50 text-emerald-800" : "bg-muted text-muted-foreground")}>
                    {m.active ? "Active" : "Suspended"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Role matrix */}
      <div className="rounded-md border border-border bg-card p-6">
        <h3 className="font-display text-lg font-extrabold mb-3">Roles</h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {(["vendor_admin", "vendor_staff"] as VendorRole[]).map((r) => (
            <div key={r} className="rounded-sm border border-border bg-paper-mid p-4">
              <RoleBadge role={r} />
              <div className="mt-2 font-display text-base font-extrabold">{ROLE_LABELS[r]}</div>
              <p className="mt-1 text-[12px] leading-snug text-muted-foreground">{ROLE_DESCRIPTIONS[r]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: VendorRole }) {
  return (
    <span className="rounded-sm bg-foreground px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest text-background">
      {ROLE_LABELS[role]}
    </span>
  );
}

function ThemeTab() {
  const { themeId, setThemeId, accent, setAccent } = useVendor();
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-card p-6">
        <h3 className="font-display text-lg font-extrabold">Preset themes</h3>
        <p className="mb-4 text-sm text-muted-foreground">Pick a starting palette tuned to your industry.</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {THEME_PRESETS.map((p) => {
            const active = themeId === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setThemeId(p.id)}
                className={cn("flex flex-col gap-3 rounded-md border p-4 text-left transition-all hover:shadow-md", active ? "border-foreground" : "border-border")}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg font-extrabold">{p.name}</span>
                  {active && <span className="rounded-sm bg-foreground px-2 py-[2px] font-mono text-[9px] font-bold uppercase tracking-widest text-background">Active</span>}
                </div>
                <div className="flex h-12 overflow-hidden rounded-sm">
                  <div className="flex-1" style={{ background: p.accent }} />
                  <div className="flex-1 bg-paper-mid" />
                  <div className="flex-1 bg-foreground" />
                </div>
                <p className="text-[12px] leading-snug text-muted-foreground">{p.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        <h3 className="font-display text-lg font-extrabold">Custom accent</h3>
        <p className="mb-4 text-sm text-muted-foreground">Override the preset accent with your brand color. Buttons, links, badges and charts adapt automatically.</p>
        <div className="flex flex-wrap items-center gap-3">
          <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-12 w-20 cursor-pointer rounded-sm border border-border bg-transparent p-0" />
          <input value={accent} onChange={(e) => setAccent(e.target.value)} className="h-12 w-44 rounded-sm border border-border bg-card px-3 font-mono text-sm uppercase outline-none focus:border-foreground" />
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <button className="inline-flex h-10 items-center rounded-sm bg-foreground px-4 text-sm font-medium text-background">Primary button</button>
            <button className="inline-flex h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground">Accent</button>
            <a className="text-sm font-semibold underline-offset-4 hover:underline" style={{ color: accent }}>A link styled with your accent</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="t-label mb-2 block">{label}</label>
      <input defaultValue={value} className="h-10 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground" />
    </div>
  );
}
