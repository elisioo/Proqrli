import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { PURCHASE_ORDERS, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/purchase-orders")({
  component: () => (
    <PermissionGate permission="po:view">
      <POPage />
    </PermissionGate>
  ),
});

function POPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader eyebrow="Procurement" title="Purchase orders" description="Formal POs received from accredited buyers." />
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">PO #</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Terms</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PURCHASE_ORDERS.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{p.poNumber}</td>
                <td className="px-4 py-3 font-medium">{p.buyerName}</td>
                <td className="px-4 py-3">{p.itemCount}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(p.total)}</td>
                <td className="px-4 py-3"><span className="rounded-sm bg-muted px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest">{p.paymentTerms}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{p.expectedDelivery}</td>
                <td className="px-4 py-3"><AutoStatus status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
