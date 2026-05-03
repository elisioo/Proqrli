import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import { SERVICE_HEALTH, SYSTEM_METRICS } from "@/lib/admin-mock-data";
import { Activity, Server, Database, Cpu } from "lucide-react";

export const Route = createFileRoute("/admin/system")({
  component: SystemHealthPage,
});

const mapStatus = (s: string) =>
  s === "Operational" ? "Active" : s === "Degraded" ? "Pending" : s === "Outage" ? "Failed" : "Pending Review";

function SystemHealthPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Operations"
        title="System health"
        description="Live operational metrics for the ProcurLi platform. Triage incidents, schedule maintenance, roll back deploys."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="API p95" value="212 ms" delta="−18 ms WoW" icon={Activity} tone="ink" />
        <StatCard label="Error rate (24h)" value="0.04%" delta="within SLO" icon={Server} />
        <StatCard label="Storage" value="8.42 TB" delta="of 16 TB" icon={Database} />
        <StatCard label="Background queue" value="142" delta="jobs in flight" icon={Cpu} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-6 lg:col-span-2">
          <h2 className="mb-5 font-display text-lg font-bold">Service status</h2>
          <ul className="divide-y divide-border">
            {SERVICE_HEALTH.map((s) => (
              <li key={s.service} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-medium">{s.service}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{s.region}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-[12px] text-ink-muted">{s.uptime}</span>
                  <AutoStatus status={mapStatus(s.status)} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <h2 className="mb-5 font-display text-lg font-bold">Platform metrics</h2>
          <ul className="space-y-4">
            {SYSTEM_METRICS.map((m) => (
              <li key={m.name}>
                <div className="text-[12px] text-ink-muted">{m.name}</div>
                <div className="mt-0.5 flex items-baseline justify-between gap-3">
                  <span className="font-display text-lg font-bold">{m.value}</span>
                  <span className={`text-[11px] ${m.ok ? "text-emerald-700" : "text-rose-700"}`}>{m.delta}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
