import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import {
  AUDIT_EVENTS,
  SERVICE_HEALTH,
  SYSTEM_METRICS,
  TENANTS,
  formatRelative,
  formatUSD,
} from "@/lib/admin-mock-data";
import { ArrowUpRight, Building2, Server, Wallet, Users } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const activeTenants = TENANTS.filter((t) => t.status === "Active").length;
  const trialTenants = TENANTS.filter((t) => t.status === "Trial").length;
  const totalUsers = TENANTS.reduce((s, t) => s + t.users, 0);
  const totalMRR = TENANTS.reduce((s, t) => s + t.mrrUSD, 0);

  const recentTenants = [...TENANTS].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  const recentEvents = AUDIT_EVENTS.slice(0, 6);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Platform control plane"
        title="System overview"
        description="The owner's view of every tenant, every user, every module — live."
        actions={
          <Link
            to="/admin/system"
            className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-[12.5px] font-medium text-background hover:opacity-90"
          >
            System health <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active tenants" value={activeTenants} delta={`${trialTenants} on trial`} icon={Building2} tone="ink" />
        <StatCard label="Platform users" value={totalUsers.toLocaleString()} delta="across all tenants" icon={Users} />
        <StatCard label="MRR" value={formatUSD(totalMRR)} delta="+4.1% MoM" icon={Wallet} tone="accent" />
        <StatCard label="Open incidents" value="1" delta="ML risk · degraded" icon={Server} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-6 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">Recent tenants</h2>
            <Link to="/admin/tenants" className="text-[12px] font-medium text-foreground underline-offset-4 hover:underline">
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                <tr>
                  <th className="pb-2 font-semibold">Organization</th>
                  <th className="pb-2 font-semibold">Plan</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 text-right font-semibold">YTD spend</th>
                  <th className="pb-2 text-right font-semibold">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/40">
                    <td className="py-3">
                      <div className="font-medium">{t.name}</div>
                      <div className="text-[11px] text-ink-muted">{t.industry} · {t.region}</div>
                    </td>
                    <td className="py-3">
                      <span className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                        {t.plan}
                      </span>
                    </td>
                    <td className="py-3"><AutoStatus status={t.status} /></td>
                    <td className="py-3 text-right font-mono text-[12.5px]">{formatUSD(t.spendYTD)}</td>
                    <td className="py-3 text-right text-[12px] text-ink-muted">{t.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold">System pulse</h2>
            <Link to="/admin/system" className="text-[12px] font-medium text-foreground underline-offset-4 hover:underline">
              Health →
            </Link>
          </div>
          <ul className="space-y-3">
            {SYSTEM_METRICS.slice(0, 5).map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-[12px] text-ink-muted">{m.name}</div>
                  <div className="font-display text-base font-bold">{m.value}</div>
                </div>
                <span className={`text-[11px] ${m.ok ? "text-emerald-700" : "text-rose-700"}`}>{m.delta}</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-border pt-4">
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-muted">Services</div>
            <ul className="space-y-1.5 text-[12.5px]">
              {SERVICE_HEALTH.slice(0, 4).map((s) => (
                <li key={s.service} className="flex items-center justify-between">
                  <span>{s.service}</span>
                  <AutoStatus status={s.status === "Operational" ? "Active" : s.status === "Degraded" ? "Pending" : s.status === "Outage" ? "Failed" : "Pending Review"} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-card p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Latest activity</h2>
          <Link to="/admin/audit" className="text-[12px] font-medium text-foreground underline-offset-4 hover:underline">
            Audit log →
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {recentEvents.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      e.severity === "critical" ? "bg-rose-500" : e.severity === "warn" ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span className="font-mono text-[11px] text-ink-muted">{e.action}</span>
                </div>
                <div className="mt-1 truncate text-sm">{e.target}</div>
                <div className="mt-0.5 text-[11px] text-ink-muted">by {e.actor}</div>
              </div>
              <div className="font-mono text-[11px] text-ink-muted">{formatRelative(e.at)}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
