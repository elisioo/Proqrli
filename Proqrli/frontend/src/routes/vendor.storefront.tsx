import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Edit3, Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { useVendor } from "@/lib/vendor-context";
import { PRODUCTS, formatCurrencyDecimal } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/storefront")({
  component: () => (
    <PermissionGate permission="storefront:view">
      <StorefrontPage />
    </PermissionGate>
  ),
});

function StorefrontPage() {
  const { tenant, hasPermission } = useVendor();
  const featured = PRODUCTS.filter((p) => p.status === "Active").slice(0, 4);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <PageHeader
        eyebrow="Public storefront"
        title="Your storefront"
        description="What buyers see when they visit your store on the marketplace."
        actions={
          <>
            <button className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm hover:border-foreground">
              <ExternalLink className="h-4 w-4" /> Preview public
            </button>
            {hasPermission("storefront:edit") && (
              <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
                <Edit3 className="h-4 w-4" /> Edit storefront
              </button>
            )}
          </>
        }
      />

      {/* Hero preview */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="grid-bg relative h-48 bg-paper-mid">
          <div className="absolute bottom-4 left-6 flex items-end gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-sm border-4 border-card bg-foreground font-display text-3xl font-extrabold text-background shadow-lg">
              {tenant.companyName[0]}
            </div>
          </div>
          {tenant.certifiedBadge && (
            <div className="absolute right-4 top-4 rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-800">
              ✓ Certified vendor
            </div>
          )}
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="font-display text-3xl font-extrabold tracking-tight">{tenant.companyName}</h2>
              <p className="mt-1 text-base text-muted-foreground">{tenant.tagline}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.8 · 124 reviews
            </div>
          </div>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{tenant.storeBio}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-sm bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest">{tenant.industry}</span>
            <span className="rounded-sm bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest">ISO 9001</span>
            <span className="rounded-sm bg-muted px-3 py-1 font-mono text-[10px] uppercase tracking-widest">SE Asia</span>
          </div>
        </div>
      </div>

      {/* Featured */}
      <div>
        <div className="t-label mb-3">Featured listings</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {featured.map((p) => (
            <div key={p.id} className="rounded-md border border-border bg-card p-3">
              <div className="mb-2 flex aspect-square items-center justify-center rounded-sm bg-paper-mid text-5xl">{p.image}</div>
              <div className="truncate text-xs font-semibold">{p.name}</div>
              <div className="mt-1 font-display text-base font-extrabold">{formatCurrencyDecimal(p.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
