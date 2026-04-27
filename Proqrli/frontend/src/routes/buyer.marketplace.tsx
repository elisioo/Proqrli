import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { MARKETPLACE_CATEGORIES, MARKETPLACE_PRODUCTS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { Search, ShoppingCart, Star, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/marketplace")({
  component: () => (
    <BuyerPermissionGate permission="marketplace:browse">
      <MarketplacePage />
    </BuyerPermissionGate>
  ),
});

function MarketplacePage() {
  const [cat, setCat] = React.useState("All");
  const [q, setQ] = React.useState("");
  const [cart, setCart] = React.useState<Record<string, number>>({});

  const filtered = MARKETPLACE_PRODUCTS.filter((p) =>
    (cat === "All" || p.category === cat) &&
    (q === "" || p.name.toLowerCase().includes(q.toLowerCase()) || p.sku.toLowerCase().includes(q.toLowerCase()))
  );

  const addToCart = (id: string) =>
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }));

  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);
  const cartTotal = MARKETPLACE_PRODUCTS.reduce(
    (s, p) => s + (cart[p.id] ?? 0) * p.price, 0,
  );

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Source from accredited vendors"
        title="Marketplace"
        description="Browse the catalogue, add items to your draft requisition, and request quotations."
        actions={
          <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
            <ShoppingCart className="h-4 w-4" /> Cart ({cartCount}) · {formatBuyerCurrency(cartTotal)}
          </button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search SKU, product name…"
            className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-foreground"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {MARKETPLACE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-sm border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors",
                cat === c ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filtered.map((p) => (
          <div key={p.id} className="flex flex-col rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-sm">
            <div className="flex h-32 items-center justify-center rounded-sm bg-paper-mid text-6xl">
              {p.image}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{p.sku}</span>
              {!p.inStock && <AutoStatus status="Out of stock" />}
            </div>
            <h3 className="mt-1 line-clamp-2 text-sm font-semibold">{p.name}</h3>
            <div className="mt-1 text-xs text-muted-foreground">{p.vendorName}</div>
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{p.rating}</span>
              <span className="inline-flex items-center gap-1"><Truck className="h-3 w-3" />{p.leadTimeDays}d</span>
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="font-display text-xl font-extrabold">{formatBuyerCurrency(p.price)}</div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">/ {p.uom}</div>
              </div>
              <button
                disabled={!p.inStock}
                onClick={() => addToCart(p.id)}
                className="rounded-sm bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-30"
              >
                {cart[p.id] ? `In cart · ${cart[p.id]}` : "Add"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No products match your filters. Try clearing the search.
        </div>
      )}
    </div>
  );
}
