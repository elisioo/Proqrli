import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { TENANTS, formatUSD, type Tenant } from "@/lib/admin-mock-data";
import { Search, Plus } from "lucide-react";

export const Route = createFileRoute("/admin/tenants")({
  component: TenantsPage,
});

function TenantsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Tenant["status"] | "All">("All");

  const filtered = TENANTS.filter((t) => {
    const matchQ = !q || (t.name + t.industry + t.slug).toLowerCase().includes(q.toLowerCase());
    const matchS = status === "All" || t.status === status;
    return matchQ && matchS;
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Tenants"
        title="Organizations"
        description="Every buyer organization on the platform. Provision, suspend, change plans, or impersonate."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-[12.5px] font-medium text-background hover:opacity-90">
            <Plus className="h-3.5 w-3.5" />
            New tenant
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search organization, slug, industry…"
            className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <div className="flex gap-1 rounded-sm border border-border bg-card p-1">
          {(["All", "Active", "Trial", "Suspended", "Archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-sm px-3 py-1 text-[12px] ${
                status === s ? "bg-foreground text-background" : "text-ink-soft hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Organization</th>
              <th className="px-4 py-2 font-semibold">Plan</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 text-right font-semibold">Users</th>
              <th className="px-4 py-2 text-right font-semibold">Vendors</th>
              <th className="px-4 py-2 text-right font-semibold">MRR</th>
              <th className="px-4 py-2 text-right font-semibold">YTD spend</th>
              <th className="px-4 py-2 font-semibold">Region</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((t) => (
              <tr key={t.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{t.slug} · {t.industry}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3"><AutoStatus status={t.status} /></td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{t.users}</td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{t.vendors}</td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{formatUSD(t.mrrUSD)}</td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{formatUSD(t.spendYTD)}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-soft">{t.region}</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-sm border border-border px-2 py-1 text-[11px] hover:bg-muted">Manage</button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-muted">
                  No tenants match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
