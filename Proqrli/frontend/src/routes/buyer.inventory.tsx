import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import {
  INVENTORY,
  getStockState,
  formatBuyerCurrency,
  type InventoryItem,
} from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { Boxes, AlertTriangle, PackageX, RefreshCw, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/inventory")({
  component: () => (
    <BuyerPermissionGate permission="inventory:view">
      <InventoryPage />
    </BuyerPermissionGate>
  ),
});

const TABS = ["All", "Low stock", "Out of stock", "In stock"] as const;

function InventoryPage() {
  const { hasPermission } = useBuyer();
  const canManage = hasPermission("inventory:manage");

  const [tab, setTab] = React.useState<(typeof TABS)[number]>("All");
  const [query, setQuery] = React.useState("");
  const [reorder, setReorder] = React.useState<InventoryItem | null>(null);

  const enriched = INVENTORY.map((i) => ({ ...i, state: getStockState(i), available: i.onHand })); // reserved=0
  const filtered = enriched.filter((i) =>
    (tab === "All" || i.state === tab) &&
    (query === "" || i.name.toLowerCase().includes(query.toLowerCase()) || i.sku.toLowerCase().includes(query.toLowerCase())),
  );

  const lowCount = enriched.filter((i) => i.state === "Low stock").length;
  const outCount = enriched.filter((i) => i.state === "Out of stock").length;
  const inCount = enriched.filter((i) => i.state === "In stock").length;
  const stockValue = enriched.reduce((s, i) => s + i.onHand * i.unitCost, 0);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Warehouse"
        title="Inventory"
        description="Live stock across all SKUs. Items at or below reorder point trigger an auto-PR suggestion."
        actions={
          canManage && (
            <button className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm font-semibold hover:bg-muted">
              <RefreshCw className="h-3 w-3" /> Sync from GRNs
            </button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="In stock" value={inCount} icon={Boxes} delta={`${enriched.length} total SKUs`} />
        <StatCard label="Low stock" value={lowCount} icon={AlertTriangle} delta="Reorder suggested" tone="accent" />
        <StatCard label="Out of stock" value={outCount} icon={PackageX} delta="Urgent reorder" tone="ink" />
        <StatCard label="Stock value" value={formatBuyerCurrency(stockValue)} icon={Boxes} delta="At unit cost" />
      </div>

      {/* Tabs + search */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1 border-b border-border">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors",
                tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
              {t === "Low stock" && lowCount > 0 && <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 text-[9px] text-amber-800">{lowCount}</span>}
              {t === "Out of stock" && outCount > 0 && <span className="ml-1.5 rounded-full bg-rose-100 px-1.5 text-[9px] text-rose-800">{outCount}</span>}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search SKU or name…"
          className="h-10 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground md:w-72"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3 text-right">On hand</th>
              <th className="px-4 py-3 text-right">On order</th>
              <th className="px-4 py-3 text-right">Available</th>
              <th className="px-4 py-3 text-right">Reorder pt</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((i) => (
              <tr key={i.id} className={cn("hover:bg-muted/40", i.state === "Out of stock" && "bg-rose-50/40", i.state === "Low stock" && "bg-amber-50/30")}>
                <td className="px-4 py-3 font-mono text-xs">{i.sku}</td>
                <td className="px-4 py-3">
                  <div className="font-medium">{i.name}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{i.category}</div>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{i.location}</td>
                <td className="px-4 py-3 text-right font-mono">
                  <span className={cn(
                    "font-bold",
                    i.state === "Out of stock" && "text-rose-700",
                    i.state === "Low stock" && "text-amber-700",
                  )}>
                    {i.onHand}
                  </span>
                  <span className="text-muted-foreground"> {i.uom}</span>
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {i.onOrder > 0 ? (
                    <span className="text-sky-700">+{i.onOrder}</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-mono font-semibold">{i.available + i.onOrder}</td>
                <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{i.reorderPoint}</td>
                <td className="px-4 py-3"><AutoStatus status={i.state} /></td>
                <td className="px-4 py-3">
                  {(i.state === "Low stock" || i.state === "Out of stock") && hasPermission("requisitions:create") && (
                    <button
                      onClick={() => setReorder(i)}
                      className="inline-flex h-8 items-center gap-1 rounded-sm bg-foreground px-3 text-[10px] font-semibold uppercase tracking-widest text-background hover:opacity-85"
                    >
                      <ShoppingCart className="h-3 w-3" /> Reorder
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">No matching items.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Stock is updated when a Goods Receipt is accepted. <Link to="/buyer/receipts" className="underline">Open receipts →</Link>
      </p>

      {reorder && <ReorderModal item={reorder} onClose={() => setReorder(null)} />}
    </div>
  );
}

function ReorderModal({ item, onClose }: { item: InventoryItem; onClose: () => void }) {
  const [qty, setQty] = React.useState(item.reorderQty);
  const [route, setRoute] = React.useState<"po" | "rfq">("po");
  const total = qty * item.unitCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg overflow-hidden rounded-md border border-border bg-card shadow-2xl">
        <div className="border-b border-border px-5 py-4">
          <div className="t-label">Auto-prefill Purchase Requisition</div>
          <div className="mt-1 font-display text-xl font-extrabold">{item.name}</div>
          <div className="font-mono text-[11px] text-muted-foreground">{item.sku} · current on hand {item.onHand} {item.uom}</div>
        </div>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="t-label mb-1">Reorder quantity</div>
              <input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))}
                className="h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground" />
              <p className="mt-1 text-[10px] text-muted-foreground">Suggested: {item.reorderQty} {item.uom}</p>
            </div>
            <div>
              <div className="t-label mb-1">Estimated total</div>
              <div className="flex h-10 items-center font-display text-xl font-extrabold">
                {formatBuyerCurrency(total)}
              </div>
            </div>
          </div>

          <div>
            <div className="t-label mb-2">Sourcing route</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setRoute("po")}
                className={cn(
                  "rounded-sm border px-3 py-3 text-left text-xs transition-colors",
                  route === "po" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                )}
              >
                <div className="font-semibold">Direct PO</div>
                <div className="mt-1 text-[10px] opacity-80">to {item.preferredVendorName}</div>
              </button>
              <button
                onClick={() => setRoute("rfq")}
                className={cn(
                  "rounded-sm border px-3 py-3 text-left text-xs transition-colors",
                  route === "rfq" ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
                )}
              >
                <div className="font-semibold">Open RFQ</div>
                <div className="mt-1 text-[10px] opacity-80">Invite multiple vendors</div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted px-5 py-3">
          <button onClick={onClose} className="h-9 rounded-sm border border-border bg-card px-3 text-xs font-semibold hover:bg-paper-mid">Cancel</button>
          <Link
            to={route === "po" ? "/buyer/requisitions" : "/buyer/rfqs"}
            onClick={onClose}
            className="inline-flex h-9 items-center gap-1 rounded-sm bg-foreground px-4 text-xs font-semibold text-background hover:opacity-85"
          >
            Create {route === "po" ? "PR → PO" : "PR → RFQ"}
          </Link>
        </div>
      </div>
    </div>
  );
}
