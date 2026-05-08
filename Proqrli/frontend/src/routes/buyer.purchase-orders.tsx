/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, Loader2, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, NumberInput } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { purchaseOrdersApi, type PurchaseOrder, type CreatePurchaseOrderPayload, type UpdatePurchaseOrderPayload } from "@/lib/api";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";
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

export const Route = createFileRoute("/buyer/purchase-orders")({
    component: () => (
        <BuyerPermissionGate permission="po:view">
            <BuyerPOPage />
        </BuyerPermissionGate>
    ),
});

const PO_STATUSES = ["Draft", "Pending Approval", "Issued", "Acknowledged", "Partially Received", "Received", "Closed", "Cancelled"] as const;
const PAYMENT_TERMS = ["COD", "Net15", "Net30", "Net45", "Net60"];

const EMPTY = {
    poNumber: "",
    vendorTenantID: 0,
    pRID: 0,
    total: 0,
    expectedDelivery: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    paymentTerms: "Net30",
    status: "Draft" as string,
};

function BuyerPOPage() {
    const { hasPermission } = useBuyer();
    const canCreate = hasPermission("po:create");
    const canApprove = hasPermission("po:approve");

    const store = useApiCollection<PurchaseOrder, CreatePurchaseOrderPayload, UpdatePurchaseOrderPayload>(purchaseOrdersApi);
    const [view, setView] = React.useState<"active" | "cancelled" | "archived">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [confirmState, setConfirmState] = React.useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);
    const [saving, setSaving] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [vendorLookup, setVendorLookup] = React.useState<{ id: number; label: string }[]>([]);
    const [prLookup, setPrLookup] = React.useState<{ id: number; label: string }[]>([]);
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});

    React.useEffect(() => {
        purchaseOrdersApi.getVendorLookup().then(setVendorLookup).catch(console.error);
        purchaseOrdersApi.getPRLookup().then(setPrLookup).catch(console.error);
    }, []);

    const active = store.items.filter((p) => p.status !== "Cancelled" && !p.archived);
    const cancelled = store.items.filter((p) => p.status === "Cancelled");
    const archived = store.items.filter((p) => p.archived);
    const list = view === "active" ? active : view === "cancelled" ? cancelled : archived;

    const openCreate = () => {
        const generatedPoNum = `PO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setDraft({ ...EMPTY, poNumber: generatedPoNum });
        setSubmitError(null);
        setTouched({});
        setDrawer({ mode: "create" });
    };
    const openEdit = (po: PurchaseOrder) => {
        setDraft({
            poNumber: po.poNumber,
            vendorTenantID: Number(po.vendorId) || 0,
            pRID: 0,
            total: po.total,
            expectedDelivery: po.expectedDelivery,
            paymentTerms: po.paymentTerms,
            status: po.status,
        });
        setSubmitError(null);
        setTouched({});
        setDrawer({ mode: "edit", id: po.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSubmitError(null);
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    poNumber: draft.poNumber || undefined,
                    pRID: draft.pRID ? draft.pRID : 0,
                    vendorTenantID: draft.vendorTenantID,
                    total: draft.total,
                    expectedDelivery: draft.expectedDelivery,
                    paymentTerms: draft.paymentTerms,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    status: draft.status,
                    total: draft.total,
                    expectedDelivery: draft.expectedDelivery,
                    paymentTerms: draft.paymentTerms,
                });
            }
            closeDrawer();
        } catch (err: unknown) {
            console.error("Save failed:", err);
            const msg = err instanceof Error ? err.message : "An error occurred while saving.";
            setSubmitError(msg);
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
                eyebrow="Procurement"
                title="Purchase orders"
                description="Formal POs issued to vendors. Track from approval through delivery and closure."
                actions={
                    canCreate && (
                        <button onClick={openCreate} className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
                            + Issue PO
                        </button>
                    )
                }
            />

            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading purchase orders…
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
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
                        <div className="flex gap-1 border-b border-border w-full">
                            {(["active", "cancelled", "archived"] as const).map((v) => (
                                <button key={v} onClick={() => setView(v)}
                                    className={cn(
                                        "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                        view === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                    )}>
                                    {v} ({v === "active" ? active.length : v === "cancelled" ? cancelled.length : archived.length})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-md border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">PO #</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">From PR</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Total</th>
                                    <th className="px-4 py-3">Terms</th>
                                    <th className="px-4 py-3">Expected</th>
                                    <th className="px-4 py-3">Raised by</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {list.map((p) => (
                                    <tr key={p.id} className="hover:bg-muted/40">
                                        <td className="px-4 py-3 font-mono text-xs">{p.poNumber}</td>
                                        <td className="px-4 py-3 font-medium">{p.vendorName}</td>
                                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{p.prRef ?? "—"}</td>
                                        <td className="px-4 py-3">{p.itemCount}</td>
                                        <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(p.total)}</td>
                                        <td className="px-4 py-3"><span className="rounded-sm bg-muted px-2 py-[2px] font-mono text-[10px] uppercase tracking-widest">{p.paymentTerms}</span></td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.expectedDelivery}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{p.raisedBy}</td>
                                        <td className="px-4 py-3"><AutoStatus status={p.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {p.archived ? (
                                                    <button onClick={() => setConfirmState({
                                                        title: "Restore purchase order?",
                                                        desc: `Are you sure you want to restore PO ${p.poNumber} to active?`,
                                                        onConfirm: async () => {
                                                            await store.update(p.id, { status: "Issued" });
                                                            await store.reload();
                                                        }
                                                    })}
                                                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                                    >
                                                        <RotateCcw className="h-3 w-3" /> Restore
                                                    </button>
                                                ) : (
                                                    <>
                                                        {p.status === "Pending Approval" && canApprove && (
                                                            <button
                                                                onClick={() => store.update(p.id, { status: "Issued" })}
                                                                className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background">
                                                                Approve
                                                            </button>
                                                        )}
                                                        {p.status !== "Cancelled" && (
                                                            <>
                                                                <button onClick={() => openEdit(p)}
                                                                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground">
                                                                    <Pencil className="h-3 w-3" />
                                                                </button>
                                                                <button onClick={() => setConfirmState({
                                                                    title: "Archive purchase order?",
                                                                    desc: `Are you sure you want to archive PO ${p.poNumber}?`,
                                                                    onConfirm: () => store.archive(p.id)
                                                                })}
                                                                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                                                                    <Archive className="h-3 w-3" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {list.length === 0 && (
                                    <tr><td colSpan={10} className="px-4 py-12 text-center text-sm text-muted-foreground">No purchase orders in this view.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Issue Purchase Order" : `Edit ${draft.poNumber || "PO"}`}
                description="Create or update a formal purchase order to a vendor."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={draft.total > 0 && draft.vendorTenantID > 0 && !saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                {submitError && (
                    <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        {submitError}
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="PO Number">
                        <input className={cn(inputCls, "cursor-not-allowed bg-muted opacity-70")} disabled value={draft.poNumber}
                            onChange={(e) => setDraft({ ...draft, poNumber: e.target.value })} />
                    </Field>
                    <Field label="Status">
                        <select className={selectCls} value={draft.status}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                            {PO_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Vendor">
                        <select className={cn(selectCls, touched.vendor && !draft.vendorTenantID && "border-rose-500 focus:border-rose-500")} value={draft.vendorTenantID || ""}
                            onBlur={() => setTouched(prev => ({ ...prev, vendor: true }))}
                            onChange={(e) => {
                                setTouched(prev => ({ ...prev, vendor: true }));
                                setDraft({ ...draft, vendorTenantID: Number(e.target.value) });
                            }}>
                            <option value="" disabled>Select a Vendor...</option>
                            {vendorLookup.map((v) => (
                                <option key={v.id} value={v.id}>{v.label}</option>
                            ))}
                        </select>
                        {touched.vendor && !draft.vendorTenantID && <p className="mt-1 text-xs text-rose-500">Vendor is required</p>}
                    </Field>
                    <Field label="Source PR (optional)">
                        <select className={selectCls} value={draft.pRID || ""}
                            onChange={(e) => setDraft({ ...draft, pRID: Number(e.target.value) })}>
                            <option value="">None (Direct PO)</option>
                            {prLookup.map((pr) => (
                                <option key={pr.id} value={pr.id}>{pr.label}</option>
                            ))}
                        </select>
                    </Field>
                </div>

                {/* Option 3 Direct Purchase Warning */}
                {!draft.pRID && (
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                        <div className="flex items-start">
                            <div className="text-amber-800 font-semibold text-sm">
                                No Purchase Requisition linked. This will be recorded as a Direct Purchase.
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-amber-700">
                            PRs ensure internal approval, budget checking, and traceability. Direct POs should only be used for pre-approved emergency requests.

                        </div>
                    </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                    <Field label="Total amount">
                        <NumberInput
                            step="0.01"
                            className={cn(touched.total && draft.total <= 0 && "border-rose-500 focus:border-rose-500")}
                            value={draft.total}
                            placeholder="0.00"
                            onChange={(val) => {
                                setTouched(prev => ({ ...prev, total: true }));
                                setDraft({ ...draft, total: val });
                            }}
                        />
                        {touched.total && draft.total <= 0 && <p className="mt-1 text-xs text-rose-500">Total must be greater than 0</p>}
                    </Field>
                    <Field label="Payment terms">
                        <select className={selectCls} value={draft.paymentTerms}
                            onChange={(e) => setDraft({ ...draft, paymentTerms: e.target.value })}>
                            {PAYMENT_TERMS.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </Field>
                    <Field label="Expected delivery">
                        <input type="date" className={inputCls} value={draft.expectedDelivery}
                            onChange={(e) => setDraft({ ...draft, expectedDelivery: e.target.value })} />
                    </Field>
                </div>
            </CrudDrawer>
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
