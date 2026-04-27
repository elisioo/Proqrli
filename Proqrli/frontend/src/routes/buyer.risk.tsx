import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { BUYER_VENDORS, RISK_ALERTS } from "@/lib/buyer-mock-data";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/buyer/risk")({
  component: () => (
    <BuyerPermissionGate permission="risk:view">
      <RiskPage />
    </BuyerPermissionGate>
  ),
});

function RiskPage() {
  const sortedVendors = [...BUYER_VENDORS].sort((a, b) => b.riskScore - a.riskScore);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="ML risk monitoring"
        title="Risk & Compliance"
        description="Random Forest scoring across delivery performance, quality, financials, and compliance."
      />

      {/* Alerts */}
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="t-label">Active alerts</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{RISK_ALERTS.length} signals</span>
        </div>
        <ul className="divide-y divide-border">
          {RISK_ALERTS.map((a) => (
            <li key={a.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <span className={a.level === "High" ? "text-rose-600" : "text-amber-600"}>
                  <ShieldAlert className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-extrabold">{a.vendorName}</span>
                    <AutoStatus status={a.level} />
                    <span className="font-mono text-[10px] text-muted-foreground">{a.raisedAt}</span>
                  </div>
                  <div className="mt-1 text-sm font-medium">{a.signal}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{a.detail}</div>
                </div>
                <button className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground">Investigate</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk leaderboard */}
      <div className="rounded-md border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="t-label">Vendor risk leaderboard</span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> ML model · v2.4
          </span>
        </div>
        <ul className="divide-y divide-border">
          {sortedVendors.map((v) => {
            const pct = Math.round(v.riskScore * 100);
            return (
              <li key={v.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted/40">
                <div className="col-span-4 flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-foreground font-mono text-[11px] font-bold text-background">{v.initials}</span>
                  <span className="text-sm font-semibold">{v.companyName}</span>
                </div>
                <div className="col-span-2 font-mono text-xs text-muted-foreground">{v.category}</div>
                <div className="col-span-4">
                  <div className="h-2 w-full rounded-full bg-paper-mid">
                    <div
                      className={
                        v.riskClass === "High" ? "h-2 rounded-full bg-rose-500" :
                        v.riskClass === "Medium" ? "h-2 rounded-full bg-amber-500" :
                        "h-2 rounded-full bg-emerald-500"
                      }
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <div className="col-span-1 font-mono text-xs">{pct}%</div>
                <div className="col-span-1"><AutoStatus status={v.riskClass} /></div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
