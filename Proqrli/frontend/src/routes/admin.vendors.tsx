import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { adminApi, type AdminVendor } from "@/lib/api";
import { Search } from "lucide-react";

export const Route = createFileRoute("/admin/vendors")({
  component: VendorRegistry,
});

function VendorRegistry() {
  const [q, setQ] = useState("");
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        setVendors(await adminApi.vendors(q));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load vendors.");
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => window.clearTimeout(id);
  }, [q]);

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Marketplace"
        title="Vendor registry"
        description="Every vendor tenant known to the platform, enriched with accreditation and risk data."
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search vendor, category, email..."
          className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">Vendor</th>
              <th className="px-4 py-2 font-semibold">Category</th>
              <th className="px-4 py-2 font-semibold">Risk class</th>
              <th className="px-4 py-2 font-semibold">Accreditation</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 text-right font-semibold">Tenants served</th>
              <th className="px-4 py-2 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{v.name}</div>
                  <div className="font-mono text-[11px] text-ink-muted">{v.email || "No contact email"}</div>
                </td>
                <td className="px-4 py-3 text-[12.5px]">{v.category}</td>
                <td className="px-4 py-3"><AutoStatus status={v.riskClass} /></td>
                <td className="px-4 py-3"><AutoStatus status={v.accreditation === "Unlisted" ? "Pending Review" : v.accreditation} /></td>
                <td className="px-4 py-3"><AutoStatus status={v.status} /></td>
                <td className="px-4 py-3 text-right font-mono text-[12.5px]">{v.tenantsServed}</td>
                <td className="px-4 py-3 text-[12.5px] text-ink-muted">{formatDate(v.joinedAt)}</td>
              </tr>
            ))}
            {(loading || error || vendors.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-ink-muted">
                  {loading ? "Loading vendors..." : error ?? "No vendors match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
