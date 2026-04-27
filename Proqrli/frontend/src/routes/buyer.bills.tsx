import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { StatCard } from "@/components/StatCard";
import { VENDOR_BILLS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/buyer/bills")({
  component: () => (
    <BuyerPermissionGate permission="bills:view">
      <BillsPage />
    </BuyerPermissionGate>
  ),
});

function BillsPage() {
  const { hasPermission } = useBuyer();
  const pending = VENDOR_BILLS.filter((b) => b.status === "Pending");
  const overdue = VENDOR_BILLS.filter((b) => b.status === "Overdue");
  const dueSoon = VENDOR_BILLS.filter((b) => ["Approved", "Scheduled"].includes(b.status));
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Accounts payable"
        title="Bills (vendor invoices)"
        description="Inbox of invoices from your vendors. Approve to schedule payment."
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <StatCard label="Pending approval" value={pending.length} icon={Clock} delta={formatBuyerCurrency(pending.reduce((s, b) => s + b.amount, 0))} />
        <StatCard label="Due soon" value={dueSoon.length} icon={CheckCircle2} delta={formatBuyerCurrency(dueSoon.reduce((s, b) => s + b.amount, 0))} tone="ink" />
        <StatCard label="Overdue" value={overdue.length} icon={AlertCircle} delta={formatBuyerCurrency(overdue.reduce((s, b) => s + b.amount, 0))} tone="accent" />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Bill #</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">PO Ref</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Received</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {VENDOR_BILLS.map((b) => (
              <tr key={b.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{b.billNumber}</td>
                <td className="px-4 py-3 font-medium">{b.vendorName}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{b.poRef}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(b.amount)}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.receivedAt}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.dueAt}</td>
                <td className="px-4 py-3"><AutoStatus status={b.status} /></td>
                <td className="px-4 py-3">
                  {b.status === "Pending" && hasPermission("bills:approve") && (
                    <button className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
