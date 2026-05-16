/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Plus, Search, Pencil, Archive, RotateCcw, LayoutGrid, List, Package } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls, NumberInput, SelectOrCustom } from "@/components/CrudDrawer";
import { useVendor } from "@/lib/vendor-context";
import {
    PRODUCT_CATEGORIES,
    formatCurrencyDecimal,
} from "@/lib/mock-data";
import { vendorProductsApi, type VendorProductListing } from "@/lib/api";
import { useApiCollection } from "@/lib/use-api-collection";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor/products")({
    component: () => (
        <PermissionGate permission="products:view">
            <ProductsPage />
        </PermissionGate>
    ),
});

type ProductRow = VendorProductListing & { archived?: boolean };

const EMPTY_DRAFT: Omit<ProductRow, "id"> = {
    sku: "",
    name: "",
    category: PRODUCT_CATEGORIES[0],
    price: 0,
    uom: "pc",
    stock: 0,
    status: "Draft",
    views: 0,
    orders: 0,
    rating: 0,
    image: "📦",
};

function isImageUrl(image?: string | null) {
    return typeof image === "string" && image.startsWith("http");
}

const CLOUDINARY_CLOUD_NAME = "dnvcbxofk";
const CLOUDINARY_UPLOAD_PRESET = "proqrli_products";

function generateVendorCode(prefix: string) {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `${prefix}-${datePart}-${randomPart}`;
}

function ProductsPage() {
    const { hasPermission } = useVendor();
    const canManage = hasPermission("products:manage");
    const store = useApiCollection<ProductRow>(vendorProductsApi);

    const [view, setView] = React.useState<"active" | "archived">("active");
    const [query, setQuery] = React.useState("");
    const [category, setCategory] = React.useState<string | null>(null);
    const [layout, setLayout] = React.useState<"grid" | "rows">("grid");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState<Omit<ProductRow, "id">>(EMPTY_DRAFT);
    const [imageUploading, setImageUploading] = React.useState(false);
    const [imageUploadError, setImageUploadError] = React.useState<string | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [saveError, setSaveError] = React.useState<string | null>(null);

    const activeProducts = store.items.filter((p) => !p.archived);
    const archivedProducts = store.archived;
    const list = (view === "active" ? activeProducts : archivedProducts).filter((p) => {
        const matchesQ =
            query === "" ||
            (p.sku ?? "").toLowerCase().includes(query.toLowerCase()) ||
            (p.name ?? "").toLowerCase().includes(query.toLowerCase());
        const matchesC = !category || p.category === category;
        return matchesQ && matchesC;
    });

    const openCreate = () => {
        setImageUploadError(null);
        setSaveError(null);
        setDraft({ ...EMPTY_DRAFT, sku: generateVendorCode("SKU"), image: "" });
        setDrawer({ mode: "create" });
    };
    const openEdit = (p: ProductRow) => {
        const { id: _id, ...rest } = p;
        void _id;
        setImageUploadError(null);
        setSaveError(null);
        setDraft({ ...rest, image: isImageUrl(rest.image) ? rest.image : "" });
        setDrawer({ mode: "edit", id: p.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        setSaveError(null);
        try {
            const payload = { ...draft, image: isImageUrl(draft.image) ? draft.image : "" };
            if (drawer.mode === "create") {
                await store.create(payload);
                setView("active");
                setCategory(null);
                setQuery("");
            }
            else if (drawer.id) await store.update(drawer.id, payload);
            closeDrawer();
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = () => {
        if (drawer?.id) {
            store.archive(drawer.id);
            closeDrawer();
        }
    };

    const canSave = draft.sku.trim() !== "" && draft.name.trim() !== "" && !imageUploading && !saving;

    const uploadImage = async (file: File) => {
        setImageUploading(true);
        setImageUploadError(null);
        try {
            const form = new FormData();
            form.append("file", file);
            form.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            form.append("folder", "proqrli_products");

            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: "POST",
                body: form,
            });
            const data = await res.json();
            if (!res.ok || !data.secure_url) {
                throw new Error(data.error?.message ?? "Image upload failed");
            }
            setDraft((prev) => ({ ...prev, image: data.secure_url }));
        } catch (err) {
            setImageUploadError(err instanceof Error ? err.message : "Image upload failed");
        } finally {
            setImageUploading(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Catalogue"
                title="Product listings"
                description="Manage SKUs, prices, stock and storefront visibility."
                actions={
                    canManage && (
                        <button
                            onClick={openCreate}
                            className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85"
                        >
                            <Plus className="h-4 w-4" /> New listing
                        </button>
                    )
                }
            />

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 border-b border-border">
                    {(["active", "archived"] as const).map((v) => (
                        <button
                            key={v}
                            onClick={() => setView(v)}
                            className={cn(
                                "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors",
                                view === v
                                    ? "border-foreground text-foreground"
                                    : "border-transparent text-muted-foreground hover:text-foreground",
                            )}
                        >
                            {v} ({v === "active" ? activeProducts.length : archivedProducts.length})
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 min-w-[240px] max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="h-10 w-full rounded-sm border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-foreground"
                        placeholder="Search SKU, name..."
                    />
                </div>
                <div className="flex flex-wrap gap-1">
                    <button
                        onClick={() => setCategory(null)}
                        className={cn(
                            "h-8 rounded-sm border px-3 font-mono text-[11px] uppercase tracking-widest",
                            !category
                                ? "border-foreground bg-foreground text-background"
                                : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                        )}
                    >
                        All
                    </button>
                    {PRODUCT_CATEGORIES.slice(0, 6).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCategory(c)}
                            className={cn(
                                "h-8 rounded-sm border px-3 font-mono text-[11px] uppercase tracking-widest",
                                category === c
                                    ? "border-foreground bg-foreground text-background"
                                    : "border-border bg-card text-muted-foreground hover:border-foreground hover:text-foreground",
                            )}
                        >
                            {c}
                        </button>
                    ))}
                </div>
                <div className="ml-auto inline-flex h-10 overflow-hidden rounded-sm border border-border bg-card">
                    <button
                        type="button"
                        onClick={() => setLayout("grid")}
                        title="Grid layout"
                        aria-label="Grid layout"
                        className={cn(
                            "inline-flex w-10 items-center justify-center text-muted-foreground hover:text-foreground",
                            layout === "grid" && "bg-foreground text-background hover:text-background",
                        )}
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setLayout("rows")}
                        title="Row layout"
                        aria-label="Row layout"
                        className={cn(
                            "inline-flex w-10 items-center justify-center border-l border-border text-muted-foreground hover:text-foreground",
                            layout === "rows" && "bg-foreground text-background hover:text-background",
                        )}
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 gap-3",
                layout === "grid" && "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
            )}>
                {list.map((p) => (
                    <div
                        key={p.id}
                        className={cn(
                            "group relative rounded-md border border-border bg-card transition-shadow hover:shadow-md",
                            layout === "grid" ? "flex flex-col p-4" : "flex items-center gap-3 p-3",
                        )}
                    >
                        <div className={cn(
                            "flex shrink-0 items-center justify-center overflow-hidden rounded-sm bg-paper-mid",
                            layout === "grid" ? "mb-3 aspect-square w-full" : "h-16 w-16",
                        )}>
                            {isImageUrl(p.image) ? (
                                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                            ) : (
                                <Package className="h-10 w-10 text-muted-foreground/45" />
                            )}
                        </div>
                        <div className={cn(
                            "flex items-start justify-between gap-2",
                            layout === "rows" && "min-w-0 flex-1",
                        )}>
                            <div className="min-w-0">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    {p.sku}
                                </div>
                                <div className="truncate text-sm font-semibold">{p.name}</div>
                            </div>
                            <AutoStatus status={p.archived ? "Archived" : p.status} />
                        </div>
                        <div className={cn(
                            "flex items-end justify-between",
                            layout === "grid" ? "mt-3 border-t border-border pt-3" : "shrink-0 gap-4",
                        )}>
                            <div>
                                <div className="font-display text-xl font-extrabold">
                                    {formatCurrencyDecimal(p.price)}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                    / {p.uom} · stock {p.stock.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right text-[11px] text-muted-foreground">
                                <div>{p.orders} orders</div>
                                <div>★ {p.rating || "—"}</div>
                            </div>
                        </div>

                        {canManage && (
                            <div className={cn(
                                "flex shrink-0 gap-1",
                                layout === "grid" ? "mt-3 border-t border-border pt-3" : "",
                            )}>
                                {p.archived ? (
                                    <button
                                        onClick={() => store.restore(p.id)}
                                        className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-border bg-card py-1.5 text-[11px] font-semibold hover:border-foreground"
                                    >
                                        <RotateCcw className="h-3 w-3" /> Restore
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => openEdit(p)}
                                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-border bg-card py-1.5 text-[11px] font-semibold hover:border-foreground"
                                        >
                                            <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                        <button
                                            onClick={() => store.archive(p.id)}
                                            className="inline-flex items-center justify-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-100"
                                            title="Archive"
                                        >
                                            <Archive className="h-3 w-3" />
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ))}
                {list.length === 0 && (
                    <div className="col-span-full rounded-md border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
                        No products in this view.
                    </div>
                )}
            </div>

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "New product listing" : (draft.name || "Edit listing")}
                description="SKU, pricing, stock and storefront status."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={canSave}
                saveLabel={saving ? "Saving..." : undefined}
            >
                {saveError && (
                    <div className="rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                        {saveError}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="SKU">
                        <input
                            className={cn(inputCls, "cursor-not-allowed bg-muted opacity-70")}
                            value={draft.sku}
                            disabled
                            readOnly
                            placeholder="Auto-generated"
                        />
                    </Field>
                    <Field label="Product Image">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                            {isImageUrl(draft.image) && (
                                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-sm border border-border bg-muted">
                                    <img src={draft.image} alt="Preview" className="h-full w-full object-cover" />
                                </div>
                            )}
                            <label className={cn(
                                "inline-flex h-10 cursor-pointer items-center rounded-sm border border-border bg-card px-4 text-sm font-medium hover:bg-muted",
                                imageUploading && "cursor-not-allowed opacity-60",
                            )}>
                                {imageUploading ? "Uploading..." : "Upload Image"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    disabled={imageUploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        e.target.value = "";
                                        if (file) void uploadImage(file);
                                    }}
                                />
                            </label>
                            <input
                                className={cn(inputCls, "flex-1")}
                                value={isImageUrl(draft.image) ? draft.image : ""}
                                onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                                placeholder="Image URL (optional)"
                            />
                            </div>
                            {imageUploadError && (
                                <p className="text-xs text-rose-600">{imageUploadError}</p>
                            )}
                        </div>
                    </Field>
                </div>

                <Field label="Product name">
                    <input
                        className={inputCls}
                        value={draft.name}
                        onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Category">
                        <SelectOrCustom
                            value={draft.category}
                            options={PRODUCT_CATEGORIES}
                            onChange={(val) => setDraft({ ...draft, category: val })}
                            addLabel="+ Create new category..."
                            placeholder="Type category..."
                        />
                    </Field>
                    <Field label="Status">
                        <select
                            className={selectCls}
                            value={draft.status}
                            onChange={(e) =>
                                setDraft({ ...draft, status: e.target.value as VendorProductListing["status"] })
                            }
                        >
                            <option value="Active">Active</option>
                            <option value="Draft">Draft</option>
                            <option value="Out of stock">Out of stock</option>
                        </select>
                    </Field>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Field label="Price">
                        <NumberInput step="0.01" value={draft.price} placeholder="0.00" onChange={(val) => setDraft({ ...draft, price: val ?? 0 })} />
                    </Field>
                    <Field label="UOM">
                        <input
                            className={inputCls}
                            value={draft.uom}
                            onChange={(e) => setDraft({ ...draft, uom: e.target.value })}
                        />
                    </Field>
                    <Field label="Stock">
                        <NumberInput value={draft.stock} placeholder="0" onChange={(val) => setDraft({ ...draft, stock: val ?? 0 })} />
                    </Field>
                </div>

                <Field label="Notes (internal)">
                    <textarea
                        className={textareaCls}
                        placeholder="Optional notes for your team — not shown on the storefront."
                    />
                </Field>
            </CrudDrawer>
        </div>
    );
}
