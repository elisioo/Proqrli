import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { adminApi, type AdminTenant } from "@/lib/api";
import { formatCurrency } from "@/lib/mock-data";
import { Search, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/tenants")({
  component: TenantsPage,
});

function TenantsPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("All");
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setTenants(await adminApi.tenants({ search: q, status }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load tenants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(load, 200);
    return () => window.clearTimeout(id);
  }, [q, status]);

  const updateStatus = async (tenant: AdminTenant, nextStatus: string) => {
    await adminApi.updateTenantStatus(tenant.id, nextStatus);
    await load();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Tenants"
        title="Organizations"
        description="Every organization on the platform, loaded from the tenant database."
        actions={
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-[12.5px] font-medium text-background hover:opacity-90">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search organization, slug, industry..."
            className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          />
        </div>
        <div className="flex gap-1 rounded-sm border border-border bg-card p-1">
          {["All", "Active", "Trial", "Suspended", "Inactive"].map((s) => (
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
              <th className="px-4 py-2 font-semibold">Type</th>
              <th className="px-4 py-2 font-semibold">Plan</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 text-right font-semibold">Users</th>
              <th className="px-4 py-2 text-right font-semibold">Network</th>
              <th className="px-4 py-2 text-right font-semibold">MRR</th>
              <th className="px-4 py-2 text-right font-semibold">YTD spend</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tenants.map((t) => (
              <tr key={t.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{t.name}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{t.slug} · {t.industry}</div>
                </td>
                <td className="px-4 py-3 text-[12.5px]">{t.type}</td>
                <td className="px-4 py-3">
                  <span className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                    {t.plan}
                  </span>
                </td>
                <td className="px-4 py-3"><AutoStatus status={t.status} /></td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{t.users}</td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{t.vendors}</td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{formatCurrency(t.mrr)}</td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{formatCurrency(t.spendYtd)}</td>
                <td className="px-4 py-3 text-right">
                  <select
                    value={t.status === "Trial" ? "Active" : t.status}
                    onChange={(e) => updateStatus(t, e.target.value)}
                    className="rounded-sm border border-border bg-card px-2 py-1 text-[11px]"
                  >
                    <option>Active</option>
                    <option>Suspended</option>
                    <option>Inactive</option>
                  </select>
                </td>
              </tr>
            ))}
            {(loading || error || tenants.length === 0) && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-sm text-ink-muted">
                  {loading ? "Loading tenants..." : error ?? "No tenants match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
