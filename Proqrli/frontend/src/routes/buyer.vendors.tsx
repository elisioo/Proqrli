import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { BUYER_VENDORS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { Star } from "lucide-react";

export const Route = createFileRoute("/buyer/vendors")({
  component: () => (
    <BuyerPermissionGate permission="vendors:view">
      <VendorsPage />
    </BuyerPermissionGate>
  ),
});

function VendorsPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Accredited supply base"
        title="Vendors"
        description="Manage approved vendors, view their ML risk score, and onboard new ones."
        actions={
          <button className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
            + Invite vendor
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {BUYER_VENDORS.map((v) => (
          <div key={v.id} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-foreground font-mono text-sm font-bold text-background">
                  {v.initials}
                </span>
                <div>
                  <div className="font-display text-base font-extrabold">{v.companyName}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{v.category}</div>
                </div>
              </div>
              <AutoStatus status={v.status} />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="t-label">Risk</div>
                <div className="mt-1 flex items-center gap-2">
                  <AutoStatus status={v.riskClass} />
                  <span className="font-mono text-[10px] text-muted-foreground">{(v.riskScore * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div>
                <div className="t-label">Rating</div>
                <div className="mt-1 inline-flex items-center gap-1 font-semibold">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  {v.rating > 0 ? v.rating.toFixed(1) : "—"}
                </div>
              </div>
              <div>
                <div className="t-label">Lifetime spend</div>
                <div className="mt-1 font-mono text-sm font-semibold">{formatBuyerCurrency(v.totalSpend)}</div>
              </div>
              <div>
                <div className="t-label">On-time</div>
                <div className="mt-1 font-mono text-sm font-semibold">{v.onTimeRate}%</div>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button className="flex-1 rounded-sm border border-border bg-card py-2 text-xs font-semibold hover:border-foreground">View profile</button>
              <button className="flex-1 rounded-sm bg-foreground py-2 text-xs font-semibold text-background hover:opacity-85" disabled={v.status !== "Accredited"}>
                Invite to RFQ
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
