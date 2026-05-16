import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { adminApi, type AdminModule } from "@/lib/api";

export const Route = createFileRoute("/admin/modules")({
  component: ModulesPage,
});

function ModulesPage() {
  const [modules, setModules] = useState<AdminModule[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.modules()
      .then(setModules)
      .catch((err) => setError(err instanceof Error ? err.message : "Unable to load modules."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Platform"
        title="Modules & feature flags"
        description="Installed platform capabilities and their current database footprint."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <div key={m.key} className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold">{m.name}</h3>
                  <AutoStatus status={m.status === "Stable" ? "Active" : m.status === "Beta" ? "Pending" : "Archived"} />
                </div>
                <div className="mt-1 font-mono text-[11px] text-ink-muted">{m.key}</div>
              </div>
              <span className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                {m.records.toLocaleString()} records
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">{m.description}</p>
          </div>
        ))}
        {(loading || error || modules.length === 0) && (
          <div className="rounded-md border border-border bg-card p-6 text-sm text-ink-muted">
            {loading ? "Loading modules..." : error ?? "No modules available."}
          </div>
        )}
      </div>
    </div>
  );
}
