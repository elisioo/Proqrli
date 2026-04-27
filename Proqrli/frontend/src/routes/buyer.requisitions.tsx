import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { REQUISITIONS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/requisitions")({
  component: () => (
    <BuyerPermissionGate permission="requisitions:view">
      <RequisitionsPage />
    </BuyerPermissionGate>
  ),
});

function RequisitionsPage() {
  const { hasPermission } = useBuyer();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Demand intake"
        title="Purchase requisitions"
        description="Internal requests from departments. Approve, then convert into an RFQ or PO."
        actions={
          hasPermission("requisitions:create") && (
            <button className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
              + New requisition
            </button>
          )
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">PR #</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Requested by</th>
              <th className="px-4 py-3">Dept</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Needed by</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {REQUISITIONS.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{r.prNumber}</td>
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.requestedBy}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.department}</td>
                <td className="px-4 py-3">{r.itemCount}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(r.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.neededBy}</td>
                <td className="px-4 py-3"><AutoStatus status={r.status} /></td>
                <td className="px-4 py-3">
                  {r.status === "Pending Approval" && hasPermission("requisitions:approve") && (
                    <div className="flex gap-1">
                      <button className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background">Approve</button>
                      <button className="rounded-sm border border-border px-2 py-1 text-[10px] font-semibold">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
