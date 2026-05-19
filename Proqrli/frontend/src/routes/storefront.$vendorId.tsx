import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { VendorStorefrontView } from "@/components/storefront/VendorStorefrontView";
import { marketplaceApi } from "@/lib/api";

export const Route = createFileRoute("/storefront/$vendorId")({
    component: PublicVendorStorefrontPage,
});

function PublicVendorStorefrontPage() {
    const { vendorId } = Route.useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ["public-vendor-storefront", vendorId],
        queryFn: () => marketplaceApi.getStorefront(vendorId),
    });

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Public storefront"
                title={data?.storeName ?? "Vendor storefront"}
                description="Live vendor profile and product catalogue."
                actions={
                    <Link
                        to="/"
                        className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm hover:border-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" /> Home
                    </Link>
                }
            />

            {isLoading && (
                <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                    Loading storefront...
                </div>
            )}
            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error instanceof Error ? error.message : "Could not load storefront."}
                </div>
            )}
            {data && <VendorStorefrontView storefront={data} context="vendor" />}
        </div>
    );
}
