import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { INVOICES, formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/invoices")({
  component: () => (
    <PermissionGate permission="invoices:view">
      <InvoicesPage />
    </PermissionGate>
  ),
});

function InvoicesPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader eyebrow="Finance" title="Invoices" description="Three-way matched invoices against POs and deliveries." />
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Buyer</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3">Due</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {INVOICES.map((i) => (
              <tr key={i.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-mono text-xs">{i.invoiceNumber}</td>
                <td className="px-4 py-3 font-medium">{i.buyerName}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{i.reference}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.issuedAt}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.dueAt}</td>
                <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(i.amount)}</td>
                <td className="px-4 py-3"><AutoStatus status={i.status} /></td>
                <td className="px-4 py-3"><button className="text-muted-foreground hover:text-foreground"><Download className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
