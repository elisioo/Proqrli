import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PLATFORM_VENDORS } from "@/lib/admin-mock-data";

export const Route = createFileRoute("/admin/vendors")({
  component: VendorRegistry,
});

function VendorRegistry() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Marketplace"
        title="Vendor registry"
        description="Every vendor known to the platform. Vendors live across tenants — moderate accreditation and risk class here."
      />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Vendor</th>
              <th className="px-4 py-2 font-semibold">Category</th>
              <th className="px-4 py-2 font-semibold">Country</th>
              <th className="px-4 py-2 font-semibold">Risk class</th>
              <th className="px-4 py-2 font-semibold">Accreditation</th>
              <th className="px-4 py-2 text-right font-semibold">Tenants served</th>
              <th className="px-4 py-2 font-semibold">Joined</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PLATFORM_VENDORS.map((v) => (
              <tr key={v.id} className="hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">{v.name}</td>
                <td className="px-4 py-3 text-[12.5px]">{v.category}</td>
                <td className="px-4 py-3 font-mono text-[12px] text-ink-muted">{v.country}</td>
                <td className="px-4 py-3"><AutoStatus status={v.riskClass} /></td>
                <td className="px-4 py-3"><AutoStatus status={v.accreditation === "Accredited" ? "Accredited" : v.accreditation === "Suspended" ? "Suspended" : "Pending Review"} /></td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{v.tenantsServed}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-muted">{v.joinedAt}</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-sm border border-border px-2 py-1 text-[11px] hover:bg-muted">Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
