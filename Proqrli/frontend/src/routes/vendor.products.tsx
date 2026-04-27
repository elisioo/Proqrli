/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Plus, Search, Pencil, Archive, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls } from "@/components/CrudDrawer";
import { useCollection } from "@/lib/use-collection";
import { useVendor } from "@/lib/vendor-context";
import {
    PRODUCTS,
    PRODUCT_CATEGORIES,
    formatCurrencyDecimal,
    type ProductListing,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor/products")({
    component: () => (
        <PermissionGate permission="products:view">
            <ProductsPage />
        </PermissionGate>
    ),
});

type ProductRow = ProductListing & { archived?: boolean };

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

function ProductsPage() {
    const { hasPermission } = useVendor();
    const canManage = hasPermission("products:manage");
    const store = useCollection<ProductRow>(PRODUCTS as ProductRow[], "p");

    const [view, setView] = React.useState<"active" | "archived">("active");
    const [query, setQuery] = React.useState("");
    const [category, setCategory] = React.useState<string | null>(null);
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState<Omit<ProductRow, "id">>(EMPTY_DRAFT);

    const list = (view === "active" ? store.items : store.archived).filter((p) => {
        const matchesQ =
            query === "" ||
            p.sku.toLowerCase().includes(query.toLowerCase()) ||
            p.name.toLowerCase().includes(query.toLowerCase());
        const matchesC = !category || p.category === category;
        return matchesQ && matchesC;
    });

    const openCreate = () => {
        setDraft({ ...EMPTY_DRAFT });
        setDrawer({ mode: "create" });
    };
    const openEdit = (p: ProductRow) => {
        const { id: _id, ...rest } = p;
        void _id;
        setDraft(rest);
        setDrawer({ mode: "edit", id: p.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = () => {
        if (!drawer) return;
        if (drawer.mode === "create") store.create(draft);
        else if (drawer.id) store.update(drawer.id, draft);
        closeDrawer();
    };

    const handleArchive = () => {
        if (drawer?.id) {
            store.archive(drawer.id);
            closeDrawer();
        }
    };

    const canSave = draft.sku.trim() !== "" && draft.name.trim() !== "";

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
                            {v} ({v === "active" ? store.items.length : store.archived.length})
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
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((p) => (
                    <div
                        key={p.id}
                        className="group relative flex flex-col rounded-md border border-border bg-card p-4 transition-shadow hover:shadow-md"
                    >
                        <div className="mb-3 flex aspect-square items-center justify-center rounded-sm bg-paper-mid text-6xl">
                            {p.image}
                        </div>
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    {p.sku}
                                </div>
                                <div className="truncate text-sm font-semibold">{p.name}</div>
                            </div>
                            <AutoStatus status={p.archived ? "Archived" : p.status} />
                        </div>
                        <div className="mt-3 flex items-end justify-between border-t border-border pt-3">
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
                            <div className="mt-3 flex gap-1 border-t border-border pt-3">
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
            >
                <div className="grid grid-cols-2 gap-3">
                    <Field label="SKU">
                        <input
                            className={inputCls}
                            value={draft.sku}
                            onChange={(e) => setDraft({ ...draft, sku: e.target.value })}
                            placeholder="ACM-XXX-0000"
                        />
                    </Field>
                    <Field label="Image (emoji)">
                        <input
                            className={inputCls}
                            value={draft.image}
                            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                        />
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
                        <select
                            className={selectCls}
                            value={draft.category}
                            onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                        >
                            {PRODUCT_CATEGORIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </Field>
                    <Field label="Status">
                        <select
                            className={selectCls}
                            value={draft.status}
                            onChange={(e) =>
                                setDraft({ ...draft, status: e.target.value as ProductListing["status"] })
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
                        <input
                            type="number"
                            step="0.01"
                            className={inputCls}
                            value={draft.price}
                            onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                        />
                    </Field>
                    <Field label="UOM">
                        <input
                            className={inputCls}
                            value={draft.uom}
                            onChange={(e) => setDraft({ ...draft, uom: e.target.value })}
                        />
                    </Field>
                    <Field label="Stock">
                        <input
                            type="number"
                            className={inputCls}
                            value={draft.stock}
                            onChange={(e) => setDraft({ ...draft, stock: Number(e.target.value) })}
                        />
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
