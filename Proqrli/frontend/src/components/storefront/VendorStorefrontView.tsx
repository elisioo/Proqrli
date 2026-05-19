import * as React from "react";
import { BadgeCheck, Mail, MapPin, Package, Phone, ShoppingCart, Star } from "lucide-react";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import type { MarketplaceProduct, VendorStorefrontDto } from "@/lib/api";

function isImageUrl(value?: string | null) {
    return typeof value === "string" && value.startsWith("http");
}

function initials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "VS";
}

function StockPill({ product }: { product: MarketplaceProduct }) {
    if (!product.inStock) {
        return <span className="rounded-sm bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">Out of stock</span>;
    }

    return <span className="rounded-sm bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">In stock</span>;
}

export function VendorStorefrontView({
    storefront,
    context = "buyer",
    onAddProduct,
}: {
    storefront: VendorStorefrontDto;
    context?: "buyer" | "vendor";
    onAddProduct?: (product: MarketplaceProduct) => void;
}) {
    const [category, setCategory] = React.useState("All");
    const [query, setQuery] = React.useState("");
    const products = storefront.products.filter((product) => {
        const matchesCategory = category === "All" || product.category === category;
        const search = query.trim().toLowerCase();
        const matchesQuery = search === "" || product.name.toLowerCase().includes(search) || product.sku.toLowerCase().includes(search);
        return matchesCategory && matchesQuery;
    });

    const categories = ["All", ...storefront.categories];
    const heroStyle = isImageUrl(storefront.bannerPath)
        ? { backgroundImage: `linear-gradient(90deg, rgba(16, 18, 20, 0.72), rgba(16, 18, 20, 0.18)), url(${storefront.bannerPath})` }
        : undefined;

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <section className="overflow-hidden rounded-md border border-border bg-card">
                <div
                    className={isImageUrl(storefront.bannerPath) ? "bg-cover bg-center p-6 text-white md:p-8" : "grid-bg bg-paper-mid p-6 md:p-8"}
                    style={heroStyle}
                >
                    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                        <div className="flex items-end gap-4">
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-sm border-4 border-card bg-foreground font-display text-2xl font-extrabold text-background shadow-lg">
                                {isImageUrl(storefront.logoPath) ? (
                                    <img src={storefront.logoPath} alt={storefront.storeName} className="h-full w-full object-cover" />
                                ) : (
                                    initials(storefront.storeName)
                                )}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">
                                        {storefront.storeName}
                                    </h1>
                                    {storefront.isVerified && (
                                        <span className="inline-flex items-center gap-1 rounded-sm bg-sky-100 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-sky-700">
                                            <BadgeCheck className="h-3 w-3" /> Verified
                                        </span>
                                    )}
                                </div>
                                <p className={isImageUrl(storefront.bannerPath) ? "mt-1 text-sm text-white/82" : "mt-1 text-sm text-muted-foreground"}>
                                    {storefront.industry}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-sm">
                            <span className={isImageUrl(storefront.bannerPath) ? "inline-flex items-center gap-1 text-white" : "inline-flex items-center gap-1 text-foreground"}>
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                {(storefront.overallRating || 0).toFixed(1)} ({storefront.reviewCount})
                            </span>
                            {storefront.businessAddress && (
                                <span className={isImageUrl(storefront.bannerPath) ? "inline-flex items-center gap-1 text-white/82" : "inline-flex items-center gap-1 text-muted-foreground"}>
                                    <MapPin className="h-4 w-4" /> {storefront.businessAddress}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="space-y-4 p-6">
                    <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
                        {storefront.storeDescription || `${storefront.companyName} has not added a storefront description yet.`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {storefront.contactEmail && (
                            <a href={`mailto:${storefront.contactEmail}`} className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground">
                                <Mail className="h-3.5 w-3.5" /> Email vendor
                            </a>
                        )}
                        {storefront.contactPhone && (
                            <span className="inline-flex items-center gap-1 rounded-sm border border-border px-3 py-1.5 text-xs font-semibold">
                                <Phone className="h-3.5 w-3.5" /> {storefront.contactPhone}
                            </span>
                        )}
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search products..."
                    className="h-10 w-full rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground md:max-w-sm"
                />
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((item) => (
                        <button
                            key={item}
                            onClick={() => setCategory(item)}
                            className={category === item
                                ? "rounded-sm border border-foreground bg-foreground px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-background"
                                : "rounded-sm border border-border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:border-foreground hover:text-foreground"}
                        >
                            {item}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                    {products.length} product{products.length === 1 ? "" : "s"}
                </span>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            context={context}
                            onAddProduct={onAddProduct}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-md border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
                    No products match this view.
                </div>
            )}
        </div>
    );
}

function ProductCard({
    product,
    context,
    onAddProduct,
}: {
    product: MarketplaceProduct;
    context: "buyer" | "vendor";
    onAddProduct?: (product: MarketplaceProduct) => void;
}) {
    return (
        <article className="flex flex-col overflow-hidden rounded-md border border-border bg-card">
            <div className="flex aspect-square items-center justify-center overflow-hidden bg-muted">
                {isImageUrl(product.image) ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                    <Package className="h-14 w-14 text-muted-foreground/40" />
                )}
            </div>
            <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{product.sku}</div>
                    <h2 className="mt-1 line-clamp-2 text-sm font-semibold">{product.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                </div>
                {product.description && <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{product.description}</p>}
                <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
                    <div>
                        <div className="font-display text-xl font-extrabold">{formatBuyerCurrency(product.price)}</div>
                        <div className="text-[11px] text-muted-foreground">/ {product.uom} - min {product.minOrder || 1}</div>
                    </div>
                    <StockPill product={product} />
                </div>
                {context === "buyer" && onAddProduct && (
                    <button
                        disabled={!product.inStock}
                        onClick={() => onAddProduct(product)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        <ShoppingCart className="h-3.5 w-3.5" /> Add to requisition
                    </button>
                )}
            </div>
        </article>
    );
}
