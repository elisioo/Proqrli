import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AUDIT_EVENTS, formatRelative } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/audit")({
  component: AuditPage,
});

const sevTone = (s: "info" | "warn" | "critical") =>
  s === "critical" ? "bg-rose-500" : s === "warn" ? "bg-amber-500" : "bg-emerald-500";

function AuditPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <PageHeader
        eyebrow="Compliance"
        title="Audit log"
        description="Immutable log of every privileged action — tenant changes, module rollouts, password resets, billing events."
      />

      <div className="rounded-md border border-border bg-card">
        <ul className="divide-y divide-border">
          {AUDIT_EVENTS.map((e) => (
            <li key={e.id} className="flex items-start gap-4 px-5 py-4">
              <span className={`mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full ${sevTone(e.severity)}`} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-mono text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                    {e.action}
                  </span>
                  <span className="font-mono text-[10.5px] text-ink-muted">
                    {e.severity}
                  </span>
                </div>
                <div className="mt-1 text-[14px] text-foreground">{e.target}</div>
                <div className="mt-0.5 text-[12px] text-ink-muted">
                  by <span className="font-mono">{e.actor}</span>
                  {e.tenantId && <> · tenant <span className="font-mono">{e.tenantId}</span></>}
                </div>
              </div>
              <div className="flex-shrink-0 font-mono text-[11px] text-ink-muted">
                {formatRelative(e.at)}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
