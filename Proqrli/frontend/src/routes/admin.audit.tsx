import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { adminApi, type AdminAuditEvent } from "@/lib/api";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/audit")({
  component: AuditPage,
});

const sevTone = (s: string) =>
  s === "critical" ? "bg-rose-500" : s === "warn" ? "bg-amber-500" : "bg-emerald-500";

function AuditPage() {
  const [q, setQ] = useState("");
  const [events, setEvents] = useState<AdminAuditEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setEvents(await adminApi.audit(q));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load audit log.");
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => window.clearTimeout(id);
  }, [q]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Tenant and platform audit events from the database."
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search actor, action, tenant..."
          className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="rounded-md border border-border bg-card">
        <ul className="divide-y divide-border">
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-4 px-5 py-4">
              <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${sevTone(e.severity)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {e.action}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink-muted">{e.severity}</span>
                </div>
                <div className="mt-1 text-[14px] text-foreground">{e.target}</div>
                <div className="mt-0.5 text-[12px] text-ink-muted">
                  by <span className="font-mono">{e.actor}</span>
                  {e.tenantName && <> · tenant <span className="font-mono">{e.tenantName}</span></>}
                  {e.ipAddress && <> · <span className="font-mono">{e.ipAddress}</span></>}
                </div>
              </div>
              <div className="flex-shrink-0 font-mono text-[11px] text-ink-muted">{formatRelative(e.at)}</div>
            </li>
          ))}
          {(loading || error || events.length === 0) && (
            <li className="px-5 py-10 text-center text-sm text-ink-muted">
              {loading ? "Loading audit log..." : error ?? "No audit events match your filters."}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}

function formatRelative(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}
