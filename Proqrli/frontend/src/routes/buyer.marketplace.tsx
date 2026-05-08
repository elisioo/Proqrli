/* eslint-disable prettier/prettier */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { marketplaceApi, type MarketplaceProduct } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import {
    Search, ShoppingCart, Star, Truck, X, Plus, Minus,
    Eye, Package, BadgeCheck,
} from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/marketplace")({
    component: () => (
        <BuyerPermissionGate permission="marketplace:browse">
            <MarketplacePage />
        </BuyerPermissionGate>
    ),
});

// ─── Stock status helpers ─────────────────────────────────────────────────────

function StockPill({ product }: { product: MarketplaceProduct }) {
    if (!product.inStock) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                Out of stock
            </span>
        );
    }
    if ((product.stock ?? 0) <= (product.reorderPoint ?? 5)) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-sm bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Low stock
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 rounded-sm bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            In stock
        </span>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function MarketplacePage() {
    const [cat, setCat] = React.useState("All");
    const [q, setQ] = React.useState("");
    const [cart, setCart] = React.useState<Record<string, number>>({});
    const [detail, setDetail] = React.useState<MarketplaceProduct | null>(null);
    const [detailQty, setDetailQty] = React.useState(1);
    const [cartOpen, setCartOpen] = React.useState(false);

    const {
        data: marketplaceProducts = [],
        isLoading: isProductsLoading,
        error: productsError,
    } = useQuery({
        queryKey: ["marketplace-products"],
        queryFn: marketplaceApi.getProducts,
    });

    const {
        data: marketplaceCategories = [],
        error: categoriesError,
    } = useQuery({
        queryKey: ["marketplace-categories"],
        queryFn: marketplaceApi.getCategories,
    });

    const apiError = productsError ?? categoriesError;

    const filtered = marketplaceProducts.filter(
        (p) =>
            (cat === "All" || p.category === cat) &&
            (q === "" ||
                (p.name || "").toLowerCase().includes(q.toLowerCase()) ||
                (p.sku || "").toLowerCase().includes(q.toLowerCase())),
    );

    const addToCart = (id: string, qty = 1) =>
        setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + qty }));

    const removeFromCart = (id: string) =>
        setCart((c) => { const n = { ...c }; delete n[id]; return n; });

    const updateQty = (id: string, qty: number) => {
        if (qty <= 0) { removeFromCart(id); return; }
        setCart((c) => ({ ...c, [id]: qty }));
    };

    const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);
    const cartTotal = marketplaceProducts.reduce(
        (s, p) => s + (cart[p.id] ?? 0) * p.price,
        0,
    );

    const openDetail = (p: MarketplaceProduct) => {
        setDetail(p);
        setDetailQty(cart[p.id] ?? 1);
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Source from accredited vendors"
                title="Marketplace"
                description="Browse the catalogue, add items to your draft requisition, and request quotations."
                actions={
                    <button
                        onClick={() => setCartOpen(true)}
                        className="relative inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85"
                    >
                        <ShoppingCart className="h-4 w-4" />
                        Cart
                        {cartCount > 0 && (
                            <>
                                <span className="h-[1px] w-px bg-background/30" />
                                <span>{cartCount} item{cartCount !== 1 ? "s" : ""}</span>
                                <span className="font-mono">{formatBuyerCurrency(cartTotal)}</span>
                            </>
                        )}
                        {cartCount === 0 && <span className="text-background/60">· Empty</span>}
                    </button>
                }
            />

            {/* ── API error banner ── */}
            {apiError && (
                <div className="rounded-sm border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                    <p className="font-semibold">Could not load marketplace data</p>
                    <p className="text-xs text-rose-700">{apiError instanceof Error ? apiError.message : String(apiError)}</p>
                </div>
            )}

            {/* ── Search + Category filters ── */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <div className="relative md:w-80">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search SKU or product name…"
                        className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-9 text-sm outline-none focus:border-foreground"
                    />
                    {q && (
                        <button
                            onClick={() => setQ("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                    {(marketplaceCategories.length > 0 ? marketplaceCategories : ["All"]).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCat(c)}
                            className={cn(
                                "rounded-sm border px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-widest transition-colors",
                                cat === c
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <span className="ml-auto text-xs text-muted-foreground">
                    {filtered.length} product{filtered.length !== 1 ? "s" : ""}
                </span>
            </div>

            {/* ── Product grid ── */}
            {isProductsLoading ? (
                <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                    Loading products...
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((p) => (
                        <ProductCard
                            key={p.id}
                            product={p}
                            cartQty={cart[p.id] ?? 0}
                            onOpen={() => openDetail(p)}
                            onAddToCart={() => addToCart(p.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-md border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                    No products match your filters. Try clearing the search.
                </div>
            )}

            {/* ── Product detail drawer ── */}
            <Sheet open={detail !== null} onOpenChange={(o) => { if (!o) setDetail(null); }}>
                <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                    {detail && (
                        <>
                            {/* Image banner */}
                            <div className="flex h-56 items-center justify-center border-b border-border bg-muted text-8xl shrink-0 overflow-hidden relative group">
                                {detail.image ? (
                                    <img src={detail.image} alt={detail.name} className="h-full w-full object-cover object-center" />
                                ) : (
                                    <Package className="h-20 w-20 text-muted-foreground/30" />
                                )}
                            </div>

                            {/* Scrollable body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-5">
                                {/* Name + price */}
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <SheetTitle className="font-display text-xl font-extrabold leading-tight">
                                            {detail.name}
                                        </SheetTitle>
                                        <div className="text-right shrink-0">
                                            <p className="font-display text-xl font-extrabold">
                                                {formatBuyerCurrency(detail.price)}
                                            </p>
                                            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                                / {detail.uom}
                                            </p>
                                        </div>
                                    </div>
                                    <SheetDescription className="mt-1 text-xs text-muted-foreground">
                                        {detail.sku} · {detail.vendorName}
                                    </SheetDescription>
                                </div>

                                {/* Stock + badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <StockPill product={detail} />
                                    <span className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] font-semibold">
                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        {detail.rating}
                                    </span>
                                    <span className="inline-flex items-center gap-1 rounded-sm border border-border px-2 py-1 text-[11px] font-semibold text-muted-foreground">
                                        <Truck className="h-3 w-3" /> {detail.leadTimeDays}d lead time
                                    </span>
                                    {detail.vendorAccredited && (
                                        <span className="inline-flex items-center gap-1 rounded-sm bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-700">
                                            <BadgeCheck className="h-3 w-3" /> Accredited
                                        </span>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="border-t border-border" />

                                {/* Vendor info */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Vendor</p>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-foreground font-mono text-xs font-bold text-background">
                                            {detail.vendorName.split(" ").slice(0, 2).map((w: string) => w[0]).join("")}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold">{detail.vendorName}</p>
                                            <p className="text-xs text-muted-foreground">{detail.category}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Specs / details table */}
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Product details</p>
                                    <div className="rounded-md border border-border divide-y divide-border text-sm">
                                        {[
                                            { label: "SKU", value: detail.sku },
                                            { label: "Category", value: detail.category },
                                            { label: "Unit", value: detail.uom },
                                            { label: "Lead time", value: `${detail.leadTimeDays} days` },
                                            { label: "Min. order", value: detail.minOrder ? `${detail.minOrder} ${detail.uom}` : "1" },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="flex items-center justify-between px-3 py-2">
                                                <span className="text-muted-foreground">{label}</span>
                                                <span className="font-semibold">{value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Description if available */}
                                {detail.description && (
                                    <div>
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Description</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">{detail.description}</p>
                                    </div>
                                )}
                            </div>

                            {/* Sticky footer — qty + add to cart */}
                            <div className="border-t border-border bg-muted px-6 py-4">
                                {detail.inStock ? (
                                    <div className="flex items-center gap-3">
                                        {/* Quantity stepper */}
                                        <div className="flex items-center rounded-sm border border-border bg-card">
                                            <button
                                                onClick={() => setDetailQty(Math.max(1, detailQty - 1))}
                                                className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                                            >
                                                <Minus className="h-3.5 w-3.5" />
                                            </button>
                                            <span className="w-10 text-center font-mono text-sm font-semibold">
                                                {detailQty}
                                            </span>
                                            <button
                                                onClick={() => setDetailQty(detailQty + 1)}
                                                className="flex h-9 w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                                            >
                                                <Plus className="h-3.5 w-3.5" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => { addToCart(detail.id, detailQty); setDetail(null); }}
                                            className="flex-1 rounded-sm bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-85"
                                        >
                                            {cart[detail.id]
                                                ? `Update cart · ${formatBuyerCurrency(detail.price * detailQty)}`
                                                : `Add to cart · ${formatBuyerCurrency(detail.price * detailQty)}`}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="rounded-sm border border-rose-200 bg-rose-50 py-3 text-center text-sm font-semibold text-rose-700">
                                        Out of stock — check back later
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

            {/* ── Cart drawer ── */}
            <Sheet open={cartOpen} onOpenChange={setCartOpen}>
                <SheetContent side="right" className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md">
                    <SheetHeader className="border-b border-border px-6 py-5">
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Draft requisition
                        </div>
                        <SheetTitle className="font-display text-2xl font-extrabold">
                            Cart ({cartCount})
                        </SheetTitle>
                        <SheetDescription className="text-xs text-muted-foreground">
                            Review items before submitting a purchase request.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto divide-y divide-border">
                        {cartCount === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
                                <Package className="h-10 w-10 text-muted-foreground/40" />
                                <p className="text-sm text-muted-foreground">Your cart is empty.</p>
                            </div>
                        ) : (
                            marketplaceProducts.filter((p) => (cart[p.id] ?? 0) > 0).map((p) => (
                                <div key={p.id} className="flex items-center gap-4 px-6 py-4">
                                    {/* Thumbnail */}
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-sm bg-muted text-2xl overflow-hidden shadow-sm">
                                        {p.image ? (
                                            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <Package className="h-5 w-5 text-muted-foreground/40" />
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold">{p.name}</p>
                                        <p className="font-mono text-xs text-muted-foreground">{p.sku}</p>
                                        <p className="mt-0.5 font-mono text-xs font-semibold">
                                            {formatBuyerCurrency(p.price)} / {p.uom}
                                        </p>
                                    </div>

                                    {/* Qty stepper */}
                                    <div className="flex shrink-0 items-center gap-1">
                                        <button
                                            onClick={() => updateQty(p.id, (cart[p.id] ?? 0) - 1)}
                                            className="flex h-7 w-7 items-center justify-center rounded-sm border border-border hover:border-foreground"
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center font-mono text-sm font-semibold">
                                            {cart[p.id]}
                                        </span>
                                        <button
                                            onClick={() => updateQty(p.id, (cart[p.id] ?? 0) + 1)}
                                            className="flex h-7 w-7 items-center justify-center rounded-sm border border-border hover:border-foreground"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                        <button
                                            onClick={() => removeFromCart(p.id)}
                                            className="ml-1 flex h-7 w-7 items-center justify-center rounded-sm border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cartCount > 0 && (
                        <div className="border-t border-border bg-muted px-6 py-4 space-y-3">
                            {/* Subtotal */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({cartCount} items)</span>
                                <span className="font-mono font-bold">{formatBuyerCurrency(cartTotal)}</span>
                            </div>
                            {/* Submit as PR */}
                            <button className="w-full rounded-sm bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-85">
                                Submit as purchase requisition
                            </button>
                            <button
                                onClick={() => setCart({})}
                                className="w-full rounded-sm border border-border bg-card py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                                Clear cart
                            </button>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({
    product: p,
    cartQty,
    onOpen,
    onAddToCart,
}: {
    product: MarketplaceProduct;
    cartQty: number;
    onOpen: () => void;
    onAddToCart: () => void;
}) {
    return (
        <div className="group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-shadow hover:shadow-md">
            {/* Image area — clicking opens drawer */}
            <button
                onClick={onOpen}
                className="relative flex h-44 w-full items-center justify-center bg-muted text-7xl transition-colors hover:bg-muted/70 overflow-hidden"
            >
                {p.image ? (
                    <img src={p.image} alt={p.name} className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                    <Package className="h-16 w-16 text-muted-foreground/30" />
                )}
            </button>

            {/* Details */}
            <div className="flex flex-col gap-2 p-4">
                {/* Name + price */}
                <div className="flex items-start justify-between gap-2">
                    <button onClick={onOpen} className="text-left">
                        <p className="text-sm font-semibold leading-snug line-clamp-2 hover:underline underline-offset-2">
                            {p.name}
                        </p>
                    </button>
                    <div className="shrink-0 text-right">
                        <p className="font-mono text-sm font-bold">{formatBuyerCurrency(p.price)}</p>
                    </div>
                </div>

                {/* Category + vendor */}
                <p className="text-[11px] text-muted-foreground">{p.category}</p>

                {/* Divider */}
                <div className="border-t border-border" />

                {/* Stock pill + actions row */}
                <div className="flex items-center justify-between gap-2">
                    <StockPill product={p} />

                    <div className="flex items-center gap-1">
                        {/* Inline add/count button */}
                        {cartQty > 0 && (
                            <span className="rounded-sm bg-foreground px-2 py-1 font-mono text-[10px] font-bold text-background">
                                ×{cartQty}
                            </span>
                        )}
                        <button
                            disabled={!p.inStock}
                            onClick={(e) => { e.stopPropagation(); onAddToCart(); }}
                            className="h-7 rounded-sm bg-foreground px-2.5 text-[11px] font-semibold text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                            {cartQty > 0 ? "Add more" : "Add"}
                        </button>
                        {/* More / detail button */}
                        <button
                            onClick={onOpen}
                            className="flex h-7 w-7 items-center justify-center rounded-sm border border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                            title="View details"
                        >
                            <Eye className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}