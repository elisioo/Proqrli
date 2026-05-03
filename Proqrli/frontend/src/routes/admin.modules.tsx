import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { MODULES } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/modules")({
  component: ModulesPage,
});

function ModulesPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(
    () => Object.fromEntries(MODULES.map((m) => [m.key, m.status !== "Deprecated"])),
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Platform"
        title="Modules & feature flags"
        description="Patch and roll out platform modules. Each module defines a capability available to one or more plans."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((m) => (
          <div key={m.key} className="flex flex-col gap-4 rounded-md border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-base font-bold">{m.name}</h3>
                  <AutoStatus status={m.status === "Stable" ? "Active" : m.status === "Beta" ? "Pending" : "Archived"} />
                </div>
                <div className="mt-1 font-mono text-[11px] text-ink-muted">
                  {m.key} · v{m.version}
                </div>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  {enabled[m.key] ? "On" : "Off"}
                </span>
                <span
                  onClick={() => setEnabled((p) => ({ ...p, [m.key]: !p[m.key] }))}
                  className={`relative h-5 w-9 rounded-full transition ${
                    enabled[m.key] ? "bg-foreground" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-paper transition ${
                      enabled[m.key] ? "left-4" : "left-0.5"
                    }`}
                  />
                </span>
              </label>
            </div>
            <p className="text-[13px] leading-relaxed text-ink-soft">{m.description}</p>
            <div>
              <div className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                Available on
              </div>
              <div className="flex flex-wrap gap-1.5">
                {m.enabledForPlans.map((p) => (
                  <span
                    key={p}
                    className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
