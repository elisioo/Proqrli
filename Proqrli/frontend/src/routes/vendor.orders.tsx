import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Filter, PackageSearch, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { formatCurrency } from "@/lib/mock-data";
import { purchaseOrdersApi, type PurchaseOrder } from "@/lib/api";
import { useApiCollection } from "@/lib/use-api-collection";

export const Route = createFileRoute("/vendor/orders")({
  component: () => (
    <PermissionGate permission="orders:view">
      <OrdersPage />
    </PermissionGate>
  ),
});

function OrdersPage() {
  const { items, state, error, reload } = useApiCollection<PurchaseOrder>(purchaseOrdersApi);
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
            {state === "loading" && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading marketplace orders...
                  </span>
                </td>
              </tr>
            )}
            {state === "error" && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-rose-700">
                  Could not load marketplace orders: {error}
                  <button onClick={reload} className="ml-2 font-semibold underline">Retry</button>
                </td>
              </tr>
            )}
            {state === "idle" && items.map((o) => (
              <tr key={o.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{o.poNumber}</td>
                <td className="px-4 py-3 font-medium">{o.raisedBy || o.vendorName}</td>
                <td className="px-4 py-3">{o.itemCount}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(o.total)}</td>
                <td className="px-4 py-3 text-muted-foreground">{o.poDate}</td>
                <td className="px-4 py-3"><AutoStatus status={o.status} /></td>
                <td className="px-4 py-3 text-right"><Link to="/vendor/orders" className="text-xs font-semibold underline-offset-4 hover:underline">View →</Link></td>
              </tr>
            ))}
            {state === "idle" && items.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14">
                  <div className="flex flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
                    <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-dashed border-border bg-muted">
                      <PackageSearch className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">No marketplace orders found</p>
                      <p className="mt-1 text-xs">Orders placed from your storefront will appear here.</p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
