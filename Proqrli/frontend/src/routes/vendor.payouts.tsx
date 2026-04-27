import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { PAYOUTS, formatCurrency } from "@/lib/mock-data";
import { Wallet, Calendar, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/vendor/payouts")({
  component: () => (
    <PermissionGate permission="payouts:view">
      <PayoutsPage />
    </PermissionGate>
  ),
});

function PayoutsPage() {
  const scheduled = PAYOUTS.filter((p) => p.status === "Scheduled").reduce((s, p) => s + p.amount, 0);
  const ytd = PAYOUTS.filter((p) => p.status === "Paid").reduce((s, p) => s + p.amount, 0);
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader eyebrow="Finance" title="Payouts" description="PayMongo-disbursed payouts to your bank account." />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Next payout" value={formatCurrency(scheduled)} delta="Scheduled Apr 28" icon={Calendar} tone="ink" />
        <StatCard label="Paid this month" value={formatCurrency(ytd)} delta="3 transfers" icon={CheckCircle2} />
        <StatCard label="Settlement account" value="BPI ****4421" delta="PayMongo gateway" icon={Wallet} />
      </div>
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Method</th>
              <th className="px-4 py-3">Invoices</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PAYOUTS.map((p) => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.scheduledFor}</td>
                <td className="px-4 py-3">{p.method}</td>
                <td className="px-4 py-3">{p.invoiceCount}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-3"><AutoStatus status={p.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
