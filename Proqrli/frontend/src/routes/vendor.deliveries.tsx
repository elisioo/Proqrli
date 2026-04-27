import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { DELIVERIES } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/deliveries")({
  component: () => (
    <PermissionGate permission="deliveries:view">
      <DeliveriesPage />
    </PermissionGate>
  ),
});

function DeliveriesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader eyebrow="Logistics" title="Deliveries" description="Track every shipment from packing to buyer hand-off." />
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Carrier</th>
              <th className="px-4 py-3">Tracking</th>
              <th className="px-4 py-3">Expected</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DELIVERIES.map((d) => (
              <tr key={d.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{d.deliveryNumber}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{d.orderRef}</td>
                <td className="px-4 py-3 font-medium">{d.buyerName}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.carrier}</td>
                <td className="px-4 py-3 font-mono text-xs">{d.trackingNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{d.expectedAt}</td>
                <td className="px-4 py-3"><AutoStatus status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
