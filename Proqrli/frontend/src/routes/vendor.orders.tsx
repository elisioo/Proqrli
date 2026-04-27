import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Filter } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { MARKETPLACE_ORDERS, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/orders")({
  component: () => (
    <PermissionGate permission="orders:view">
      <OrdersPage />
    </PermissionGate>
  ),
});

function OrdersPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader eyebrow="Marketplace" title="Orders" description="Orders placed via your storefront listings." />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-foreground" placeholder="Search by order # or buyer..." />
        </div>
        <button className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm hover:border-foreground"><Filter className="h-4 w-4" /> All statuses</button>
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Placed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MARKETPLACE_ORDERS.map((o) => (
              <tr key={o.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-4 py-3 font-medium">{o.buyerName}</td>
                <td className="px-4 py-3">{o.itemCount}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.placedAt}</td>
                <td className="px-4 py-3"><AutoStatus status={o.status} /></td>
                <td className="px-4 py-3 text-right"><Link to="/vendor/orders" className="text-xs font-semibold underline-offset-4 hover:underline">View →</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
