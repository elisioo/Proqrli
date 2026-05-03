import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/admin/settings")({
  component: PlatformSettings,
});

const SECTIONS = [
  {
    title: "Branding",
    fields: [
      { label: "Platform name", value: "ProcurLi" },
      { label: "Support email", value: "support@procurli.io" },
      { label: "Default locale", value: "en-US" },
    ],
  },
  {
    title: "Security",
    fields: [
      { label: "MFA enforcement", value: "Required for all admins" },
      { label: "Session lifetime", value: "8 hours" },
      { label: "IP allowlist", value: "Disabled" },
    ],
  },
  {
    title: "Billing",
    fields: [
      { label: "Stripe account", value: "acct_1Pxx…live" },
      { label: "Default currency", value: "USD" },
      { label: "Invoice cadence", value: "Monthly · 1st" },
    ],
  },
  {
    title: "Data residency",
    fields: [
      { label: "Primary region", value: "us-east-1" },
      { label: "EU mirror", value: "eu-west-1" },
      { label: "Backups", value: "Daily · 35-day retention" },
    ],
  },
];

function PlatformSettings() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        eyebrow="Configuration"
        title="Platform settings"
        description="Global defaults for every tenant — branding, security posture, billing, and data residency."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <section key={s.title} className="rounded-md border border-border bg-card p-6">
            <h2 className="mb-4 font-display text-lg font-bold">{s.title}</h2>
            <dl className="divide-y divide-border">
              {s.fields.map((f) => (
                <div key={f.label} className="flex items-center justify-between gap-4 py-3">
                  <dt className="text-[13px] text-ink-muted">{f.label}</dt>
                  <dd className="font-mono text-[12.5px]">{f.value}</dd>
                </div>
              ))}
            </dl>
            <button className="mt-4 rounded-sm border border-border px-3 py-1.5 text-[12px] hover:bg-muted">
              Edit
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
