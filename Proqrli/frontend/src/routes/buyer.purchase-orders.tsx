import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { BUYER_PURCHASE_ORDERS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/purchase-orders")({
  component: () => (
    <BuyerPermissionGate permission="po:view">
      <BuyerPOPage />
    </BuyerPermissionGate>
  ),
});

function BuyerPOPage() {
  const { hasPermission } = useBuyer();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Procurement"
        title="Purchase orders"
        description="Formal POs issued to vendors. Track from approval through delivery and closure."
        actions={
          hasPermission("po:create") && (
            <button className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
              + Issue PO
            </button>
          )
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">PO #</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">From PR</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Terms</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Raised by</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {BUYER_PURCHASE_ORDERS.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{p.poNumber}</td>
                <td className="px-4 py-3 font-medium">{p.vendorName}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{p.prRef ?? "—"}</td>
                <td className="px-4 py-3">{p.itemCount}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(p.total)}</td>
                <td className="px-4 py-3"><span className="rounded-sm bg-muted px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest">{p.paymentTerms}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{p.expectedDelivery}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.raisedBy}</td>
                <td className="px-4 py-3"><AutoStatus status={p.status} /></td>
                <td className="px-4 py-3">
                  {p.status === "Pending Approval" && hasPermission("po:approve") && (
                    <button className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background">Approve</button>
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
