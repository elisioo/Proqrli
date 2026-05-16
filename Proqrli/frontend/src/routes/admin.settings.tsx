import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { adminApi, type AdminSettingSection } from "@/lib/api";

export const Route = createFileRoute("/admin/settings")({
  component: PlatformSettings,
});

function PlatformSettings() {
  const [sections, setSections] = useState<AdminSettingSection[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.settings()
      .then(setSections)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load platform settings."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        eyebrow="Configuration"
        title="Platform settings"
        description="Global platform posture and database-backed configuration counts."
      />

      <div className="grid gap-6 md:grid-cols-2">
        {sections.map((s) => (
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
          </section>
        ))}
        {(loading || error || sections.length === 0) && (
          <section className="rounded-md border border-border bg-card p-6 text-sm text-ink-muted">
            {loading ? "Loading platform settings..." : error ?? "No settings available."}
          </section>
        )}
      </div>
    </div>
  );
}
