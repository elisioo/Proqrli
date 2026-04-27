import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { BUYER_PAYMENTS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/payments")({
  component: () => (
    <BuyerPermissionGate permission="payments:view">
      <PaymentsPage />
    </BuyerPermissionGate>
  ),
});

function PaymentsPage() {
  const { hasPermission } = useBuyer();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Disbursements"
        title="Payments"
        description="Scheduled and historical payments to vendors. Powered by PayMongo & bank rails."
        actions={
          hasPermission("payments:schedule") && (
            <button className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
              + Schedule payment run
            </button>
          )
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Bill</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Scheduled</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {BUYER_PAYMENTS.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                <td className="px-4 py-3 font-medium">{p.vendorName}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{p.billRef}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(p.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.scheduledFor}</td>
                <td className="px-4 py-3"><AutoStatus status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
