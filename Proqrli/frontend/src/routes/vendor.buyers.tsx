import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { BUYERS, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/buyers")({
  component: () => (
    <PermissionGate permission="buyers:view">
      <BuyersPage />
    </PermissionGate>
  ),
});

function BuyersPage() {
  const pending = BUYERS.filter((b) => b.status === "Pending");
  const approved = BUYERS.filter((b) => b.status === "Approved");
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <PageHeader eyebrow="Accreditation" title="Buyer connections" description="Buyers who have requested or been approved to procure from you." />

      {pending.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-extrabold mb-3">Pending requests <span className="ml-2 rounded-sm bg-amber-100 px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest text-amber-800">{pending.length}</span></h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {pending.map((b) => (
              <div key={b.id} className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50/50 p-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">{b.initials}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{b.companyName}</div>
                  <div className="text-xs text-muted-foreground">{b.industry} · applied {b.appliedAt}</div>
                  <div className="mt-3 flex gap-2">
                    <button className="h-8 rounded-sm bg-foreground px-3 text-xs font-medium text-background hover:opacity-85">Approve</button>
                    <button className="h-8 rounded-sm border border-border bg-card px-3 text-xs hover:border-foreground">Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl font-extrabold mb-3">Approved buyers</h2>
        <div className="overflow-hidden rounded-md border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Buyer</th>
                <th className="px-4 py-3">Industry</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Total spend</th>
                <th className="px-4 py-3">Since</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {approved.map((b) => (
                <tr key={b.id} className="hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">{b.initials}</span>
                      <span className="font-medium">{b.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{b.industry}</td>
                  <td className="px-4 py-3">{b.orderCount}</td>
                  <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(b.totalSpend)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{b.appliedAt}</td>
                  <td className="px-4 py-3"><AutoStatus status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
