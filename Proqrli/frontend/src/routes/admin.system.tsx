import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import { adminApi, type AdminSystemSummary } from "@/lib/api";
import { Activity, Server, Database, Cpu } from "lucide-react";

export const Route = createFileRoute("/admin/system")({
  component: SystemHealthPage,
});

const mapStatus = (s: string) =>
  s === "Operational" ? "Active" : s === "Degraded" ? "Pending" : s === "Outage" ? "Failed" : "Pending Review";

function SystemHealthPage() {
  const [data, setData] = useState<AdminSystemSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi.system().then(setData).catch((err) => setError(err instanceof Error ? err.message : "Unable to load system health."));
  }, []);

  if (error) return <State message={error} />;
  if (!data) return <State message="Loading system health..." />;

  const metrics = data.metrics;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Operations"
        title="System health"
        description="Operational metrics based on current platform database state."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label={metrics[0]?.name ?? "Tenants"} value={metrics[0]?.value ?? "0"} delta={metrics[0]?.delta ?? ""} icon={Activity} tone="ink" />
        <StatCard label={metrics[1]?.name ?? "Users"} value={metrics[1]?.value ?? "0"} delta={metrics[1]?.delta ?? ""} icon={Server} />
        <StatCard label={metrics[2]?.name ?? "RFQs"} value={metrics[2]?.value ?? "0"} delta={metrics[2]?.delta ?? ""} icon={Database} />
        <StatCard label={metrics[3]?.name ?? "Purchase orders"} value={metrics[3]?.value ?? "0"} delta={metrics[3]?.delta ?? ""} icon={Cpu} tone="accent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-6 lg:col-span-2">
          <h2 className="mb-5 font-display text-lg font-bold">Service status</h2>
          <ul className="divide-y divide-border">
            {data.services.map((s) => (
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
            {data.metrics.map((m) => (
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

function State({ message }: { message: string }) {
  return <div className="mx-auto max-w-7xl rounded-md border border-border bg-card p-6 text-sm text-ink-muted">{message}</div>;
}
