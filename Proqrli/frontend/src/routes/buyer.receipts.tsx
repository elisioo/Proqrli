/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, Loader2, PackageCheck, PackageX, Clock, Boxes, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { StatCard } from "@/components/StatCard";
import {
    CrudDrawer,
    Field,
    inputCls,
    selectCls,
    textareaCls,
    NumberInput,
} from "@/components/CrudDrawer";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useApiCollection } from "@/lib/use-api-collection";
import {
    deliveriesApi,
    type DeliveryRecord,
    type CreateDeliveryPayload,
    type UpdateDeliveryPayload,
} from "@/lib/api";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/receipts")({
    component: () => (
        <BuyerPermissionGate permission="receipts:view">
            <ReceiptsPage />
        </BuyerPermissionGate>
    ),
});

// ─── Constants ────────────────────────────────────────────────────────────────

const GRN_STATUSES = [
    "Pending",
    "Pending Inspection",
    "Accepted",
    "Partially Accepted",
    "Rejected",
    "Cancelled",
] as const;

type GrnStatus = (typeof GRN_STATUSES)[number];

type ViewTab = "all" | "Pending" | "Pending Inspection" | "Accepted" | "Partially Accepted" | "Rejected";

const VIEW_TABS: ViewTab[] = ["all", "Pending", "Pending Inspection", "Accepted", "Partially Accepted", "Rejected"];

// Auto-generate GRN number — same pattern as PR and SKU in other modules.
function generateGRNNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `GRN-${datePart}-${rand}`;
}

const EMPTY = {
    pOID: null as number | null,   // null = nothing selected (not 0, which is falsy)
    grnNumber: "",
    expectedDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    courierName: "",
    trackingNumber: "",
    deliveryAddress: "",
    notes: "",
    itemsReceived: 0,
    status: "Pending" as string,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function ReceiptsPage() {
    const { hasPermission } = useBuyer();
    const canCreate = hasPermission("receipts:create");
    const canEdit = hasPermission("receipts:edit");

    const store = useApiCollection<DeliveryRecord, CreateDeliveryPayload, UpdateDeliveryPayload>(deliveriesApi);

    const [tab, setTab] = React.useState<ViewTab>("all");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);
    const [poLookup, setPoLookup] = React.useState<{ id: number; label: string }[]>([]);
    const [confirmState, setConfirmState] = React.useState<{
        title: string; desc: string; onConfirm: () => void;
    } | null>(null);

    React.useEffect(() => {
        deliveriesApi.getPOLookup().then(setPoLookup).catch(console.error);
    }, []);

    // ── Derived lists ──────────────────────────────────────────────────────

    const active = store.items.filter((d) => d.status !== "Cancelled");
    const cancelled = store.items.filter((d) => d.status === "Cancelled");

    const listed = React.useMemo(() => {
        if (tab === "all") return active;
        return active.filter((d) => d.status === tab);
    }, [active, tab, store.items]);

    // Stats
    const pending = active.filter((d) => d.status === "Pending" || d.status === "Pending Inspection").length;
    const accepted = active.filter((d) => d.status === "Accepted").length;
    const partial = active.filter((d) => d.status === "Partially Accepted").length;
    const rejected = active.filter((d) => d.status === "Rejected").length;

    // ── Drawer helpers ─────────────────────────────────────────────────────

    const openCreate = () => {
        setDraft({ ...EMPTY, grnNumber: generateGRNNumber() });
        setDrawer({ mode: "create" });
    };

    const openEdit = (d: DeliveryRecord) => {
        setDraft({
            pOID: null,
            grnNumber: d.grnNumber,
            expectedDate: d.receivedAt,
            courierName: d.courierName ?? "",
            trackingNumber: d.trackingNumber ?? "",
            deliveryAddress: "",
            notes: d.notes ?? "",
            itemsReceived: d.itemCount ?? 0,
            status: d.status,
        });
        setDrawer({ mode: "edit", id: d.id });
    };

    const closeDrawer = () => setDrawer(null);

    // ── Save ──────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    pOID: draft.pOID!,
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

    // ── Archive with confirmation ─────────────────────────────────────────

    const handleArchive = () => {
        if (!drawer?.id) return;
        const target = store.items.find((d) => d.id === drawer.id);
        setConfirmState({
            title: "Cancel this receipt?",
            desc: `Cancel GRN "${target?.grnNumber ?? "this record"}"? It will be moved to cancelled and inventory will NOT be updated.`,
            onConfirm: async () => { await store.archive(drawer.id!); closeDrawer(); },
        });
    };

    // canSave — require a PO to be selected when creating
    const canSave = drawer?.mode === "create"
        ? draft.pOID !== null && !saving
        : !saving;

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Inbound"
                title="Goods receipts (GRN)"
                description="Record what was received against each PO. Inspect, accept, or flag discrepancies."
                actions={
                    canCreate && (
                        <button
                            onClick={openCreate}
                            className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85"
                        >
                            + Record receipt
                        </button>
                    )
                }
            />

            {/* ── Flow hint ── */}
            <div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <span>
                    <span className="font-semibold">Inventory updates automatically</span> only when a GRN is set to{" "}
                    <span className="font-semibold">Accepted</span> or <span className="font-semibold">Partially Accepted</span>.
                    Pending and Rejected receipts do not affect stock.
                </span>
            </div>

            {/* ── Stats ── */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <StatCard label="Pending inspection" value={pending} icon={Clock} tone="accent" delta="Awaiting review" />
                <StatCard label="Accepted" value={accepted} icon={PackageCheck} delta="Stock updated" />
                <StatCard label="Partially accepted" value={partial} icon={Boxes} tone="accent" delta="Partial stock in" />
                <StatCard label="Rejected" value={rejected} icon={PackageX} tone="ink" delta="Returned to vendor" />
            </div>

            {/* ── Loading / Error ── */}
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
                <>
                    {/* ── Status tabs ── */}
                    <div className="flex flex-wrap gap-1 border-b border-border">
                        {VIEW_TABS.map((t) => {
                            const count = t === "all"
                                ? active.length
                                : active.filter((d) => d.status === t).length;
                            return (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={cn(
                                        "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest capitalize transition-colors",
                                        tab === t
                                            ? "border-foreground text-foreground"
                                            : "border-transparent text-muted-foreground hover:text-foreground",
                                    )}
                                >
                                    {t === "all" ? `All (${count})` : `${t} (${count})`}
                                </button>
                            );
                        })}
                        {/* Cancelled tab on far right */}
                        <button
                            onClick={() => setTab("all")}
                            className="ml-auto border-b-2 border-transparent px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            title={`${cancelled.length} cancelled`}
                        >
                            Cancelled ({cancelled.length})
                        </button>
                    </div>

                    {/* ── GRN Cards ── */}
                    <div className="grid grid-cols-1 gap-3">
                        {listed.map((g) => (
                            <div
                                key={g.id}
                                className={cn(
                                    "rounded-md border bg-card p-5 transition-colors",
                                    g.status === "Accepted" && "border-emerald-200 bg-emerald-50/30",
                                    g.status === "Partially Accepted" && "border-amber-200 bg-amber-50/30",
                                    g.status === "Rejected" && "border-rose-200 bg-rose-50/30",
                                    g.status === "Pending" || g.status === "Pending Inspection"
                                        ? "border-border"
                                        : "",
                                )}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    {/* Left — info */}
                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                            {g.grnNumber}
                                        </p>
                                        <p className="mt-0.5 font-display text-lg font-extrabold leading-tight">
                                            {g.vendorName}
                                        </p>
                                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                            <span>PO <span className="font-mono font-semibold text-foreground">{g.poRef}</span></span>
                                            <span>·</span>
                                            <span>Received by <span className="font-semibold text-foreground">{g.receivedBy || "—"}</span></span>
                                            <span>·</span>
                                            <span>{g.receivedAt}</span>
                                        </div>
                                        {(g.courierName || g.trackingNumber) && (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Courier: <span className="font-semibold">{g.courierName}</span>
                                                {g.trackingNumber && <> · {g.trackingNumber}</>}
                                            </p>
                                        )}
                                        {g.notes && (
                                            <div className="mt-3 rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                                                <span className="font-semibold">Note:</span> {g.notes}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right — status + actions */}
                                    <div className="flex shrink-0 flex-col items-end gap-2">
                                        <AutoStatus status={g.status} />
                                        <p className="font-mono text-xs text-muted-foreground">
                                            {g.itemCount} item{g.itemCount !== 1 ? "s" : ""}
                                        </p>
                                        {/* Accept shortcut for pending items */}
                                        {(g.status === "Pending" || g.status === "Pending Inspection") && canEdit && (
                                            <button
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: "Accept this delivery?",
                                                        desc: `Mark GRN ${g.grnNumber} as Accepted? This will update inventory stock for all received items.`,
                                                        onConfirm: () => store.update(g.id, { status: "Accepted" } as UpdateDeliveryPayload),
                                                    })
                                                }
                                                className="inline-flex items-center gap-1 rounded-sm bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
                                            >
                                                <PackageCheck className="h-3 w-3" /> Accept delivery
                                            </button>
                                        )}
                                        <div className="flex gap-1">
                                            {canEdit && (
                                                <button
                                                    onClick={() => openEdit(g)}
                                                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                                >
                                                    <Pencil className="h-3 w-3" /> Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() =>
                                                    setConfirmState({
                                                        title: "Cancel this receipt?",
                                                        desc: `Cancel GRN "${g.grnNumber}"? Inventory will NOT be affected.`,
                                                        onConfirm: () => store.archive(g.id),
                                                    })
                                                }
                                                className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                                            >
                                                <Archive className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {listed.length === 0 && (
                            <div className="rounded-md border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
                                {tab === "all"
                                    ? "No goods receipts recorded yet. Start by recording a receipt against a Purchase Order."
                                    : `No receipts with status "${tab}".`}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* ── CRUD Drawer ── */}
            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Record receipt" : `Edit ${draft.grnNumber || "GRN"}`}
                description={
                    drawer?.mode === "create"
                        ? "Link this receipt to a Purchase Order and record delivery details."
                        : "Update the GRN status, courier details, or inspection notes."
                }
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={canSave}
                saveLabel={saving ? "Saving…" : undefined}
            >
                {drawer?.mode === "create" ? (
                    <>
                        {/* GRN number — auto-generated, read-only */}
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="GRN number" hint="Auto-generated — cannot be changed">
                                <input
                                    className={cn(inputCls, "cursor-not-allowed bg-muted opacity-70")}
                                    value={draft.grnNumber}
                                    disabled
                                    readOnly
                                />
                            </Field>
                            <Field label="Linked Purchase Order">
                                <select
                                    className={selectCls}
                                    value={draft.pOID ?? ""}
                                    onChange={(e) =>
                                        setDraft({ ...draft, pOID: e.target.value ? Number(e.target.value) : null })
                                    }
                                >
                                    <option value="" disabled>— Select a PO —</option>
                                    {poLookup.map((po) => (
                                        <option key={po.id} value={po.id}>{po.label}</option>
                                    ))}
                                </select>
                                {draft.pOID === null && (
                                    <p className="mt-1 text-[10px] text-rose-600">A Purchase Order must be selected.</p>
                                )}
                            </Field>
                        </div>

                        <Field label="Expected delivery date">
                            <input
                                type="date"
                                className={inputCls}
                                value={draft.expectedDate}
                                onChange={(e) => setDraft({ ...draft, expectedDate: e.target.value })}
                            />
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Courier name">
                                <input
                                    className={inputCls}
                                    value={draft.courierName}
                                    placeholder="e.g. J&T Express"
                                    onChange={(e) => setDraft({ ...draft, courierName: e.target.value })}
                                />
                            </Field>
                            <Field label="Tracking number">
                                <input
                                    className={inputCls}
                                    value={draft.trackingNumber}
                                    onChange={(e) => setDraft({ ...draft, trackingNumber: e.target.value })}
                                />
                            </Field>
                        </div>

                        <Field label="Items received">
                            <NumberInput
                                value={draft.itemsReceived}
                                onChange={(val) => setDraft({ ...draft, itemsReceived: val })}
                                placeholder="0"
                            />
                        </Field>

                        <Field label="Delivery address">
                            <input
                                className={inputCls}
                                value={draft.deliveryAddress}
                                onChange={(e) => setDraft({ ...draft, deliveryAddress: e.target.value })}
                            />
                        </Field>

                        <Field label="Inspection notes">
                            <textarea
                                className={textareaCls}
                                value={draft.notes}
                                placeholder="Damage reports, shortages, condition of goods…"
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                            />
                        </Field>
                    </>
                ) : (
                    <>
                        {/* Edit mode — show GRN context, then editable fields */}
                        <div className="rounded-md border border-border bg-muted/50 px-4 py-3 text-xs text-muted-foreground">
                            <p className="font-mono font-semibold text-foreground">{draft.grnNumber}</p>
                            <p className="mt-0.5">Editing status and delivery details below.</p>
                        </div>

                        <Field label="Status">
                            <select
                                className={selectCls}
                                value={draft.status}
                                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                            >
                                {GRN_STATUSES.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            {(draft.status === "Accepted" || draft.status === "Partially Accepted") && (
                                <p className="mt-1 text-[10px] text-emerald-700 font-semibold">
                                    ✓ Saving this status will update inventory stock.
                                </p>
                            )}
                            {draft.status === "Rejected" && (
                                <p className="mt-1 text-[10px] text-rose-600 font-semibold">
                                    ✗ Rejected receipts do not update inventory.
                                </p>
                            )}
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Courier name">
                                <input
                                    className={inputCls}
                                    value={draft.courierName}
                                    onChange={(e) => setDraft({ ...draft, courierName: e.target.value })}
                                />
                            </Field>
                            <Field label="Tracking number">
                                <input
                                    className={inputCls}
                                    value={draft.trackingNumber}
                                    onChange={(e) => setDraft({ ...draft, trackingNumber: e.target.value })}
                                />
                            </Field>
                        </div>

                        <Field label="Inspection notes">
                            <textarea
                                className={textareaCls}
                                value={draft.notes}
                                placeholder="Inspection notes, discrepancies…"
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                            />
                        </Field>
                    </>
                )}
            </CrudDrawer>

            {/* ── Confirmation dialog ── */}
            <AlertDialog open={!!confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmState?.desc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { confirmState?.onConfirm(); setConfirmState(null); }}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}