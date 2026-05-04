/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { RFQS } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { ChevronRight } from "lucide-react";

export const Route = createFileRoute("/buyer/rfqs")({
  component: () => (
    <BuyerPermissionGate permission="rfq:view">
      <RfqPage />
    </BuyerPermissionGate>
  ),
});

function RfqPage() {
  const { hasPermission } = useBuyer();
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="Sourcing"
        title="Requests for Quotation"
        description="Invite vendors to bid. Compare quotations, then award the winner."
        actions={
          hasPermission("rfq:create") && (
            <button className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
              + New RFQ
            </button>
          )
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">RFQ #</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">From PR</th>
              <th className="px-4 py-3">Vendors</th>
              <th className="px-4 py-3">Closes</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {RFQS.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <Link to="/buyer/rfqs/$rfqId" params={{ rfqId: r.id }} className="font-mono text-xs font-semibold underline-offset-4 hover:underline">
                    {r.rfqNumber}
                  </Link>
                </td>
                <td className="px-4 py-3 font-medium">{r.title}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{r.prRef}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">
                    <span className="font-semibold">{r.responsesReceived}</span>
                    <span className="text-muted-foreground"> / {r.invitedVendors}</span>
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.closesAt}</td>
                <td className="px-4 py-3"><AutoStatus status={r.status} /></td>
                <td className="px-4 py-3">
                  <Link to="/buyer/rfqs/$rfqId" params={{ rfqId: r.id }} className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline">
                    Open <ChevronRight className="h-3 w-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
