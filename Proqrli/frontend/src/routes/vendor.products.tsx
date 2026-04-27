import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { useVendor } from "@/lib/vendor-context";
import { PRODUCTS, PRODUCT_CATEGORIES, formatCurrencyDecimal } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/products")({
  component: () => (
    <PermissionGate permission="products:view">
      <ProductsPage />
    </PermissionGate>
  ),
});

function ProductsPage() {
  const { hasPermission } = useVendor();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Catalogue"
        title="Product listings"
        description="Manage SKUs, prices, stock and storefront visibility."
        actions={
          hasPermission("products:manage") && (
            <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
              <Plus className="h-4 w-4" /> New listing
            </button>
          )
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-foreground" placeholder="Search SKU, name..." />
        </div>
        <div className="flex flex-wrap gap-1">
          {PRODUCT_CATEGORIES.slice(0, 6).map((c) => (
            <button key={c} className="h-8 rounded-sm border border-border bg-card px-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground">{c}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PRODUCTS.map((p) => (
          <div key={p.id} className="group flex flex-col rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-md">
            <div className="mb-3 flex aspect-square items-center justify-center rounded-sm bg-paper-mid text-6xl">
              {p.image}
            </div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.sku}</div>
                <div className="truncate text-sm font-semibold">{p.name}</div>
              </div>
              <AutoStatus status={p.status} />
            </div>
            <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
              <div>
                <div className="font-display text-xl font-extrabold">{formatCurrencyDecimal(p.price)}</div>
                <div className="text-[11px] text-muted-foreground">/ {p.uom} · stock {p.stock.toLocaleString()}</div>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <div>{p.orders} orders</div>
                <div>★ {p.rating || "—"}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
