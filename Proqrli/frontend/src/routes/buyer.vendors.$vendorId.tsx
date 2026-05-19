import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { PageHeader } from "@/components/PageHeader";
import { VendorStorefrontView } from "@/components/storefront/VendorStorefrontView";
import { marketplaceApi, type MarketplaceProduct } from "@/lib/api";

export const Route = createFileRoute("/buyer/vendors/$vendorId")({
    component: () => (
        <BuyerPermissionGate permission="vendors:view">
            <BuyerVendorStorefrontPage />
        </BuyerPermissionGate>
    ),
});

function BuyerVendorStorefrontPage() {
    const { vendorId } = Route.useParams();
    const { data, isLoading, error } = useQuery({
        queryKey: ["buyer-vendor-storefront", vendorId],
        queryFn: () => marketplaceApi.getStorefront(vendorId),
    });

    const handleAddProduct = (product: MarketplaceProduct) => {
        toast.success(`${product.name} is available from ${product.vendorName}. Open Marketplace to add it to a requisition cart.`);
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Vendor storefront"
                title={data?.storeName ?? "Vendor storefront"}
                description="Browse this vendor's active public catalogue from the same listings shown in Marketplace."
                actions={
                    <>
                        <Link
                            to="/buyer/vendors"
                            className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm hover:border-foreground"
                        >
                            <ArrowLeft className="h-4 w-4" /> Vendors
                        </Link>
                        <Link
                            to="/buyer/marketplace"
                            className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85"
                        >
                            <ShoppingCart className="h-4 w-4" /> Marketplace
                        </Link>
                    </>
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
            {data && <VendorStorefrontView storefront={data} context="buyer" onAddProduct={handleAddProduct} />}
        </div>
    );
}
