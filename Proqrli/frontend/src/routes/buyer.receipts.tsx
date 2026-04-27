import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { GOODS_RECEIPTS } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/receipts")({
  component: () => (
    <BuyerPermissionGate permission="receipts:view">
      <ReceiptsPage />
    </BuyerPermissionGate>
  ),
});

function ReceiptsPage() {
  const { hasPermission } = useBuyer();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Inbound"
        title="Goods receipts (GRN)"
        description="Record what was received against each PO. Inspect, accept, or flag discrepancies."
        actions={
          hasPermission("receipts:create") && (
            <button className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
              + Record receipt
            </button>
          )
        }
      />

      <div className="grid grid-cols-1 gap-3">
        {GOODS_RECEIPTS.map((g) => (
          <div key={g.id} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{g.grnNumber}</div>
                <div className="mt-1 font-display text-lg font-extrabold">{g.vendorName}</div>
                <div className="mt-1 text-xs text-muted-foreground">PO {g.poRef} · received by {g.receivedBy} on {g.receivedAt}</div>
              </div>
              <div className="text-right">
                <AutoStatus status={g.status} />
                <div className="mt-2 font-mono text-xs text-muted-foreground">{g.itemCount} items</div>
              </div>
            </div>
            {g.notes && (
              <div className="mt-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <span className="font-semibold">Note:</span> {g.notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
