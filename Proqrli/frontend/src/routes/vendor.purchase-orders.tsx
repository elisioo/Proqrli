/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PermissionGate } from "@/components/PermissionGate";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls, NumberInput } from "@/components/CrudDrawer";
import { useCollection } from "@/lib/use-collection";
import { useVendor } from "@/lib/vendor-context";
import { PURCHASE_ORDERS, formatCurrency, type PurchaseOrder } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor/purchase-orders")({
    component: () => (
        <PermissionGate permission="po:view">
            <POPage />
        </PermissionGate>
    ),
});

type PORow = PurchaseOrder & { archived?: boolean };

const EMPTY: Omit<PORow, "id"> = {
    poNumber: "",
    buyerName: "",
    status: "Issued",
    total: 0,
    poDate: new Date().toISOString().slice(0, 10),
    expectedDelivery: new Date().toISOString().slice(0, 10),
    paymentTerms: "Net30",
    itemCount: 1,
};

function POPage() {
    const { hasPermission } = useVendor();
    const canAck = hasPermission("po:acknowledge");
    const store = useCollection<PORow>(PURCHASE_ORDERS as PORow[], "po");

    const [view, setView] = React.useState<"active" | "archived">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState<Omit<PORow, "id">>(EMPTY);

    const list = view === "active" ? store.items : store.archived;

    const openCreate = () => { setDraft({ ...EMPTY }); setDrawer({ mode: "create" }); };
    const openEdit = (p: PORow) => {
        const { id, ...rest } = p; void id;
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
    const handleArchive = () => { if (drawer?.id) { store.archive(drawer.id); closeDrawer(); } };

    const acknowledge = (id: string) => store.update(id, { status: "Acknowledged" });

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Procurement"
                title="Purchase orders"
                description="Formal POs received from accredited buyers."
                actions={
                    canAck && (
                        <button
                            onClick={openCreate}
                            className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85"
                        >
                            + New PO
                        </button>
                    )
                }
            />

            <div className="flex gap-1 border-b border-border">
                {(["active", "archived"] as const).map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v)}
                        className={cn(
                            "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                            view === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {v} ({v === "active" ? store.items.length : store.archived.length})
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-card">
                <table className="w-full text-sm">
                    <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">PO #</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">Items</th>
                            <th className="px-4 py-3">Total</th>
                            <th className="px-4 py-3">Terms</th>
                            <th className="px-4 py-3">Expected</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {list.map((p) => (
                            <tr key={p.id} className="hover:bg-muted/40">
                                <td className="px-4 py-3 font-mono text-xs">{p.poNumber}</td>
                                <td className="px-4 py-3 font-medium">{p.buyerName}</td>
                                <td className="px-4 py-3">{p.itemCount}</td>
                                <td className="px-4 py-3 font-mono font-semibold">{formatCurrency(p.total)}</td>
                                <td className="px-4 py-3">
                                    <span className="rounded-sm bg-muted px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest">
                                        {p.paymentTerms}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{p.expectedDelivery}</td>
                                <td className="px-4 py-3">
                                    <AutoStatus status={p.archived ? "Archived" : p.status} />
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        {p.archived ? (
                                            <button
                                                onClick={() => store.restore(p.id)}
                                                className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                            >
                                                <RotateCcw className="h-3 w-3" /> Restore
                                            </button>
                                        ) : (
                                            <>
                                                {canAck && p.status === "Issued" && (
                                                    <button
                                                        onClick={() => acknowledge(p.id)}
                                                        className="h-7 rounded-sm bg-foreground px-2 text-[10px] font-semibold text-background hover:opacity-85"
                                                    >
                                                        Acknowledge
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEdit(p)}
                                                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => store.archive(p.id)}
                                                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                                                >
                                                    <Archive className="h-3 w-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    No purchase orders in this view.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "New purchase order" : draft.poNumber || "Edit PO"}
                description="Track formal POs received from buyers."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={draft.poNumber.trim() !== "" && draft.buyerName.trim() !== ""}
            >
                <div className="grid grid-cols-2 gap-3">
                    <Field label="PO number">
                        <input className={inputCls} value={draft.poNumber}
                            onChange={(e) => setDraft({ ...draft, poNumber: e.target.value })} />
                    </Field>
                    <Field label="Buyer">
                        <input className={inputCls} value={draft.buyerName}
                            onChange={(e) => setDraft({ ...draft, buyerName: e.target.value })} />
                    </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Items">
                        <NumberInput value={draft.itemCount} placeholder="0" onChange={(val) => setDraft({ ...draft, itemCount: val })} />
                    </Field>
                    <Field label="Total">
                        <NumberInput step="0.01" value={draft.total} placeholder="0.00" onChange={(val) => setDraft({ ...draft, total: val })} />
                    </Field>
                    <Field label="Terms">
                        <select className={selectCls} value={draft.paymentTerms}
                            onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })}>
                            <option>COD</option><option>Net15</option><option>Net30</option><option>Net45</option><option>Net60</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="PO date">
                        <input type="date" className={inputCls} value={draft.poDate}
                            onChange={(e) => setDraft({ ...draft, poDate: e.target.value })} />
                    </Field>
                    <Field label="Expected delivery">
                        <input type="date" className={inputCls} value={draft.expectedDelivery}
                            onChange={(e) => setDraft({ ...draft, expectedDelivery: e.target.value })} />
                    </Field>
                </div>
                <Field label="Status">
                    <select className={selectCls} value={draft.status}
                        onChange={(e) => setDraft({ ...draft, status: e.target.value as PurchaseOrder["status"] })}>
                        <option>Issued</option>
                        <option>Acknowledged</option>
                        <option>Partially Received</option>
                        <option>Received</option>
                        <option>Cancelled</option>
                    </select>
                </Field>
                <Field label="Internal notes">
                    <textarea className={textareaCls} placeholder="Notes for your fulfilment team…" />
                </Field>
            </CrudDrawer>
        </div>
    );
}
