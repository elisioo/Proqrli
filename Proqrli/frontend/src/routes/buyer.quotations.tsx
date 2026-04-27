import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { QUOTATIONS, RFQS, formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";
import { Award } from "lucide-react";

export const Route = createFileRoute("/buyer/quotations")({
  component: () => (
    <BuyerPermissionGate permission="quotations:view">
      <QuotationsPage />
    </BuyerPermissionGate>
  ),
});

function QuotationsPage() {
  const { hasPermission } = useBuyer();
  const rfqsWithQuotes = RFQS.filter((r) => QUOTATIONS.some((q) => q.rfqRef === r.rfqNumber));
  const [openRfq, setOpenRfq] = React.useState<string>(rfqsWithQuotes[0]?.rfqNumber);

  const quotes = QUOTATIONS.filter((q) => q.rfqRef === openRfq);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Bid evaluation"
        title="Quotations"
        description="Side-by-side comparison of vendor responses. Award one to auto-create a PO."
      />

      {/* RFQ tabs */}
      <div className="flex flex-wrap gap-2">
        {rfqsWithQuotes.map((r) => (
          <button
            key={r.id}
            onClick={() => setOpenRfq(r.rfqNumber)}
            className={cn(
              "rounded-sm border px-3 py-2 text-left transition-colors",
              openRfq === r.rfqNumber ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground",
            )}
          >
            <div className="font-mono text-[10px] uppercase tracking-widest opacity-70">{r.rfqNumber}</div>
            <div className="text-sm font-semibold">{r.title}</div>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Vendor</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Lead time</th>
              <th className="px-4 py-3">Valid until</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {quotes.map((q) => (
              <tr key={q.id} className={cn("hover:bg-muted/40", q.rank === 1 && "bg-accent/30")}>
                <td className="px-4 py-3">
                  <span className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full font-mono text-[10px] font-bold",
                    q.rank === 1 ? "bg-foreground text-background" : "border border-border",
                  )}>
                    {q.rank}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium">{q.vendorName}</td>
                <td className="px-4 py-3 font-mono text-base font-extrabold">{formatBuyerCurrency(q.total)}</td>
                <td className="px-4 py-3">{q.leadTimeDays} days</td>
                <td className="px-4 py-3 text-muted-foreground">{q.validUntil}</td>
                <td className="px-4 py-3"><AutoStatus status={q.status} /></td>
                <td className="px-4 py-3">
                  {q.status !== "Awarded" && hasPermission("quotations:award") && (
                    <button className="inline-flex items-center gap-1 rounded-sm bg-foreground px-3 py-1.5 text-[10px] font-semibold text-background hover:opacity-85">
                      <Award className="h-3 w-3" /> Award
                    </button>
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
