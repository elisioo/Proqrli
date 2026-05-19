import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { VendorStorefrontView } from "@/components/storefront/VendorStorefrontView";
import { marketplaceApi } from "@/lib/api";

export const Route = createFileRoute("/vendor/storefront")({
    component: () => (
        <PermissionGate permission="storefront:view">
            <StorefrontPage />
        </PermissionGate>
    ),
});

function StorefrontPage() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["vendor-storefront-current"],
        queryFn: marketplaceApi.getCurrentStorefront,
    });

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Public storefront"
                title="Your storefront"
                description="This is the same database-backed storefront buyers see from the marketplace."
                actions={
                    data && (
                        <>
                            <a
                                href={`/storefront/${data.vendorId}`}
                                className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-4 text-sm hover:border-foreground"
                            >
                                <ExternalLink className="h-4 w-4" /> Preview public
                            </a>
                            <Link
                                to="/vendor/settings"
                                className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85"
                            >
                                <Settings className="h-4 w-4" /> Store settings
                            </Link>
                        </>
                    )
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
