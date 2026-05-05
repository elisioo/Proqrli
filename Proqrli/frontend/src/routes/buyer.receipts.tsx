/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { deliveriesApi, type DeliveryRecord, type CreateDeliveryPayload, type UpdateDeliveryPayload } from "@/lib/api";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/receipts")({
    component: () => (
        <BuyerPermissionGate permission="receipts:view">
            <ReceiptsPage />
        </BuyerPermissionGate>
    ),
});

const GRN_STATUSES = ["Pending", "Pending Inspection", "Accepted", "Partially Accepted", "Rejected", "Cancelled"] as const;

const EMPTY = {
    pOID: 0,
    grnNumber: "",
    expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    courierName: "",
    trackingNumber: "",
    deliveryAddress: "",
    notes: "",
    status: "Pending" as string,
};

function ReceiptsPage() {
    const { hasPermission } = useBuyer();
    const canCreate = hasPermission("receipts:create");

    const store = useApiCollection<DeliveryRecord, CreateDeliveryPayload, UpdateDeliveryPayload>(deliveriesApi);
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);
    const [poLookup, setPoLookup] = React.useState<{ id: number; label: string }[]>([]);

    React.useEffect(() => {
        deliveriesApi.getPOLookup().then(setPoLookup).catch(console.error);
    }, []);

    const active = store.items.filter((d) => d.status !== "Cancelled");

    const openCreate = () => { setDraft({ ...EMPTY }); setDrawer({ mode: "create" }); };
    const openEdit = (d: DeliveryRecord) => {
        setDraft({
            pOID: 0,
            grnNumber: d.grnNumber,
            expectedDate: d.receivedAt,
            courierName: d.courierName ?? "",
            trackingNumber: d.trackingNumber ?? "",
            deliveryAddress: "",
            notes: d.notes ?? "",
            status: d.status,
        });
        setDrawer({ mode: "edit", id: d.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    pOID: draft.pOID,
                    grnNumber: draft.grnNumber || undefined,
                    expectedDate: draft.expectedDate,
                    courierName: draft.courierName || undefined,
                    trackingNumber: draft.trackingNumber || undefined,
                    deliveryAddress: draft.deliveryAddress || undefined,
                    notes: draft.notes || undefined,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    status: draft.status,
                    courierName: draft.courierName || undefined,
                    trackingNumber: draft.trackingNumber || undefined,
                    notes: draft.notes || undefined,
                });
            }
            closeDrawer();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (drawer?.id) { await store.archive(drawer.id); closeDrawer(); }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Inbound"
                title="Goods receipts (GRN)"
                description="Record what was received against each PO. Inspect, accept, or flag discrepancies."
                actions={
                    canCreate && (
                        <button onClick={openCreate} className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
                            + Record receipt
                        </button>
                    )
                }
            />

            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading deliveries…
                </div>
            )}

            {store.state === "error" && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Failed to load: {store.error}
                    <button onClick={store.reload} className="ml-2 font-semibold underline">Retry</button>
                </div>
            )}

            {store.state === "idle" && (
                <div className="grid grid-cols-1 gap-3">
                    {active.map((g) => (
                        <div key={g.id} className="rounded-md border border-border bg-card p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{g.grnNumber}</div>
                                    <div className="mt-1 font-display text-lg font-extrabold">{g.vendorName}</div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                        PO {g.poRef} · received by {g.receivedBy || "—"} on {g.receivedAt}
                                    </div>
                                    {g.courierName && (
                                        <div className="mt-1 text-xs text-muted-foreground">
                                            Courier: {g.courierName} {g.trackingNumber && `· ${g.trackingNumber}`}
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <AutoStatus status={g.status} />
                                    <div className="mt-2 font-mono text-xs text-muted-foreground">{g.itemCount} items</div>
                                    <div className="mt-2 flex gap-1">
                                        <button onClick={() => openEdit(g)}
                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground">
                                            <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                        <button onClick={() => store.archive(g.id)}
                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                                            <Archive className="h-3 w-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            {g.notes && (
                                <div className="mt-3 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                                    <span className="font-semibold">Note:</span> {g.notes}
                                </div>
                            )}
                        </div>
                    ))}
                    {active.length === 0 && (
                        <div className="rounded-md border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
                            No goods receipts recorded yet.
                        </div>
                    )}
                </div>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Record Receipt" : `Edit ${draft.grnNumber || "GRN"}`}
                description="Record goods received against a purchase order."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={!saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                {drawer?.mode === "create" ? (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="GRN Number" hint="Auto-generated if left blank">
                                <input className={inputCls} value={draft.grnNumber} placeholder="Auto"
                                    onChange={(e) => setDraft({ ...draft, grnNumber: e.target.value })} />
                            </Field>
                            <Field label="PO (linked purchase order)">
                                <select className={selectCls} value={draft.pOID || ""}
                                    onChange={(e) => setDraft({ ...draft, pOID: Number(e.target.value) })}>
                                    <option value="" disabled>Select a Purchase Order...</option>
                                    {poLookup.map((po) => (
                                        <option key={po.id} value={po.id}>{po.label}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field label="Expected date">
                            <input type="date" className={inputCls} value={draft.expectedDate}
                                onChange={(e) => setDraft({ ...draft, expectedDate: e.target.value })} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Courier name">
                                <input className={inputCls} value={draft.courierName} placeholder="e.g. J&T Express"
                                    onChange={(e) => setDraft({ ...draft, courierName: e.target.value })} />
                            </Field>
                            <Field label="Tracking number">
                                <input className={inputCls} value={draft.trackingNumber}
                                    onChange={(e) => setDraft({ ...draft, trackingNumber: e.target.value })} />
                            </Field>
                        </div>
                        <Field label="Delivery address">
                            <input className={inputCls} value={draft.deliveryAddress}
                                onChange={(e) => setDraft({ ...draft, deliveryAddress: e.target.value })} />
                        </Field>
                        <Field label="Notes">
                            <textarea className={textareaCls} value={draft.notes} placeholder="Inspection notes, damage reports…"
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                        </Field>
                    </>
                ) : (
                    <>
                        <Field label="Status">
                            <select className={selectCls} value={draft.status}
                                onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                                {GRN_STATUSES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Courier name">
                                <input className={inputCls} value={draft.courierName}
                                    onChange={(e) => setDraft({ ...draft, courierName: e.target.value })} />
                            </Field>
                            <Field label="Tracking number">
                                <input className={inputCls} value={draft.trackingNumber}
                                    onChange={(e) => setDraft({ ...draft, trackingNumber: e.target.value })} />
                            </Field>
                        </div>
                        <Field label="Notes">
                            <textarea className={textareaCls} value={draft.notes} placeholder="Inspection notes…"
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })} />
                        </Field>
                    </>
                )}
            </CrudDrawer>
        </div>
    );
}
