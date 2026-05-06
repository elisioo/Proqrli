/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, Loader2, AlertCircle, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { StatCard } from "@/components/StatCard";
import { CrudDrawer, Field, inputCls, selectCls, NumberInput } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { billsApi, type VendorBill, type CreateVendorBillPayload, type UpdateVendorBillPayload } from "@/lib/api";
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
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/bills")({
    component: () => (
        <BuyerPermissionGate permission="bills:view">
            <BillsPage />
        </BuyerPermissionGate>
    ),
});

const BILL_STATUSES = ["Pending", "Approved", "Scheduled", "Paid", "Disputed", "Overdue", "Cancelled"] as const;

const EMPTY = {
    billNumber: "",
    pOID: 0,
    subTotal: 0,
    taxAmount: 0,
    dueAt: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    status: "Pending" as string,
    amount: 0,
};

function BillsPage() {
    const { hasPermission } = useBuyer();
    const canApprove = hasPermission("bills:approve");

    const store = useApiCollection<VendorBill, CreateVendorBillPayload, UpdateVendorBillPayload>(billsApi);
    const [view, setView] = React.useState<"active" | "archived">("active");
    const [confirmState, setConfirmState] = React.useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string | null>(null);
    const [poLookup, setPoLookup] = React.useState<{ id: number; label: string; vendorName: string }[]>([]);
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});

    // Tax API Integration
    const [taxRate, setTaxRate] = React.useState<number | null>(null);
    const [taxLoading, setTaxLoading] = React.useState(false);
    const [detectedCountry, setDetectedCountry] = React.useState<string | null>(null);

    const fetchTaxRate = React.useCallback(async () => {
        if (taxRate !== null) return;
        setTaxLoading(true);
        try {
            const ipRes = await fetch("https://ipapi.co/json/");
            const ipData = await ipRes.json();
            const code = ipData.country_code;
            setDetectedCountry(ipData.country_name);

            const taxRes = await fetch(`https://api.apilayer.com/tax_data/tax_rates?country=${code}`, {
                headers: { "apikey": "X73vLSYJgGQIfL6UKaLnsG3jAk7MprV8" }
            });
            const taxData = await taxRes.json();
            if (taxData.success && taxData.standard_rate) {
                const fetchedRate = taxData.standard_rate.rate;
                setTaxRate(fetchedRate);

                // Recalculate tax if subtotal already exists
                setDraft((currentDraft) => {
                     if (currentDraft.subTotal > 0) {
                         return { ...currentDraft, taxAmount: Number((currentDraft.subTotal * fetchedRate).toFixed(2)) };
                     }
                     return currentDraft;
                });
            }
        } catch (err) {
            console.error("Tax API Error:", err);
        } finally {
            setTaxLoading(false);
        }
    }, [taxRate]);

    React.useEffect(() => {
        billsApi.getPOLookup().then(setPoLookup).catch(console.error);
    }, []);

    const activeItems = store.items.filter((b) => b.status !== "Cancelled");
    const archivedItems = store.items.filter((b) => b.status === "Cancelled");
    const list = view === "active" ? activeItems : archivedItems;

    const pending = activeItems.filter((b) => b.status === "Pending");
    const overdue = activeItems.filter((b) => b.status === "Overdue");
    const dueSoon = activeItems.filter((b) => ["Approved", "Scheduled"].includes(b.status));

    const openCreate = () => {
        const generatedBillNum = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        setSubmitError(null);
        setTouched({});
        setDraft({ ...EMPTY, billNumber: generatedBillNum }); 
        setDrawer({ mode: "create" }); 
        fetchTaxRate();
    };
    const openEdit = (b: VendorBill) => {
        setDraft({
            billNumber: b.billNumber,
            pOID: 0,
            subTotal: b.amount,
            taxAmount: 0,
            dueAt: b.dueAt,
            status: b.status,
            amount: b.amount,
        });
        setSubmitError(null);
        setTouched({});
        setDrawer({ mode: "edit", id: b.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSubmitError(null);
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    billNumber: draft.billNumber || undefined,
                    pOID: draft.pOID,
                    subTotal: draft.subTotal,
                    taxAmount: draft.taxAmount,
                    dueAt: draft.dueAt,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    status: draft.status,
                    amount: draft.amount,
                    dueAt: draft.dueAt,
                });
            }
            closeDrawer();
        } catch (err: any) {
            console.error("Save failed:", err);
            setSubmitError(err?.message || "An error occurred while saving.");
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
                eyebrow="Accounts payable"
                title="Bills (vendor invoices)"
                description="Inbox of invoices from your vendors. Approve to schedule payment."
                actions={
                    <button onClick={openCreate} className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
                        + Record bill
                    </button>
                }
            />

            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading bills…
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
                            {(["active", "archived"] as const).map((v) => (
                                <button key={v} onClick={() => setView(v)}
                                    className={cn(
                                        "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                        view === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                    )}>
                                    {v} ({v === "active" ? activeItems.length : archivedItems.length})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <StatCard label="Pending approval" value={pending.length} icon={Clock} delta={formatBuyerCurrency(pending.reduce((s, b) => s + b.amount, 0))} />
                        <StatCard label="Due soon" value={dueSoon.length} icon={CheckCircle2} delta={formatBuyerCurrency(dueSoon.reduce((s, b) => s + b.amount, 0))} tone="ink" />
                        <StatCard label="Overdue" value={overdue.length} icon={AlertCircle} delta={formatBuyerCurrency(overdue.reduce((s, b) => s + b.amount, 0))} tone="accent" />
                    </div>

                    <div className="overflow-hidden rounded-md border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Bill #</th>
                                    <th className="px-4 py-3">Vendor</th>
                                    <th className="px-4 py-3">PO Ref</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Received</th>
                                    <th className="px-4 py-3">Due</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {list.map((b) => (
                                    <tr key={b.id} className="hover:bg-muted/40">
                                        <td className="px-4 py-3 font-mono text-xs">{b.billNumber}</td>
                                        <td className="px-4 py-3 font-medium">{b.vendorName}</td>
                                        <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{b.poRef}</td>
                                        <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(b.amount)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{b.receivedAt}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{b.dueAt}</td>
                                        <td className="px-4 py-3"><AutoStatus status={b.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {view === "archived" ? (
                                                    <button onClick={() => setConfirmState({
                                                        title: "Restore bill?",
                                                        desc: `Are you sure you want to restore bill ${b.billNumber} to active?`,
                                                        onConfirm: async () => {
                                                            await store.update(b.id, { status: "Pending" });
                                                            await store.reload();
                                                        }
                                                    })}
                                                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                                    >
                                                        <RotateCcw className="h-3 w-3" /> Restore
                                                    </button>
                                                ) : (
                                                    <>
                                                        {b.status === "Pending" && canApprove && (
                                                            <button
                                                                onClick={() => store.update(b.id, { status: "Approved" })}
                                                                className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background">
                                                                Approve
                                                            </button>
                                                        )}
                                                        <button onClick={() => openEdit(b)}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground">
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button onClick={() => setConfirmState({
                                                            title: "Archive bill?",
                                                            desc: `Are you sure you want to archive bill ${b.billNumber}?`,
                                                            onConfirm: () => store.archive(b.id)
                                                        })}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 text-[10px] font-semibold text-amber-700 hover:bg-amber-100">
                                                            <Archive className="h-3 w-3" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {list.length === 0 && (
                                    <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No bills in this view.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Record Bill" : `Edit ${draft.billNumber || "Bill"}`}
                description="Record a vendor invoice against a purchase order."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={draft.subTotal > 0 && draft.pOID > 0 && !saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                {submitError && (
                    <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                        {submitError}
                    </div>
                )}
                {drawer?.mode === "create" ? (
                    <>
                        <Field label="Bill Number">
                            <input className={cn(inputCls, "cursor-not-allowed bg-muted opacity-70")} disabled value={draft.billNumber}
                                onChange={(e) => setDraft({ ...draft, billNumber: e.target.value })} />
                        </Field>
                        <Field label="PO (linked purchase order)">
                            <select className={cn(selectCls, touched.pOID && !draft.pOID && "border-rose-500 focus:border-rose-500")} value={draft.pOID || ""}
                                onBlur={() => setTouched(prev => ({ ...prev, pOID: true }))}
                                onChange={(e) => {
                                    setTouched(prev => ({ ...prev, pOID: true }));
                                    setDraft({ ...draft, pOID: Number(e.target.value) });
                                }}>
                                <option value="" disabled>Select a Purchase Order...</option>
                                {poLookup.map((po) => (
                                    <option key={po.id} value={po.id}>{po.label}</option>
                                ))}
                            </select>
                            {touched.pOID && !draft.pOID && <p className="mt-1 text-xs text-rose-500">Purchase Order is required</p>}
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Sub-total">
                                <NumberInput
                                    step="0.01"
                                    className={cn(touched.subTotal && draft.subTotal <= 0 && "border-rose-500 focus:border-rose-500")}
                                    value={draft.subTotal}
                                    placeholder="0.00"
                                    onChange={(val) => {
                                        setTouched(prev => ({ ...prev, subTotal: true }));
                                        const updates: any = { subTotal: val };
                                        if (taxRate !== null && val > 0) {
                                            updates.taxAmount = Number((val * taxRate).toFixed(2));
                                        }
                                        setDraft({ ...draft, ...updates });
                                    }} />
                                {touched.subTotal && draft.subTotal <= 0 && <p className="mt-1 text-xs text-rose-500">Sub-total must be greater than 0</p>}
                            </Field>
                            <Field label={
                                <div className="flex items-center justify-between">
                                    <span>Tax Amount</span>
                                    {taxLoading ? (
                                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Loader2 className="h-2 w-2 animate-spin" /> Detecting...</span>
                                    ) : taxRate !== null && (
                                        <span className="text-[10px] text-sky-600 font-medium">Auto-applied {taxRate * 100}% ({detectedCountry})</span>
                                    )}
                                </div>
                            }>
                                <NumberInput step="0.01" value={draft.taxAmount} placeholder="0.00" onChange={(val) => setDraft({ ...draft, taxAmount: val })} />
                            </Field>
                        </div>
                        <Field label="Due date">
                            <input type="date" className={inputCls} value={draft.dueAt}
                                onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} />
                        </Field>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Status">
                                <select className={selectCls} value={draft.status}
                                    onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                                    {BILL_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field label="Amount">
                                <NumberInput
                                    step="0.01"
                                    className={cn(touched.amount && draft.amount <= 0 && "border-rose-500 focus:border-rose-500")}
                                    value={draft.amount}
                                    placeholder="0.00"
                                    onChange={(val) => {
                                        setTouched(prev => ({ ...prev, amount: true }));
                                        setDraft({ ...draft, amount: val });
                                    }}
                                />
                                {touched.amount && draft.amount <= 0 && <p className="mt-1 text-xs text-rose-500">Amount must be greater than 0</p>}
                            </Field>
                        </div>
                        <Field label="Due date">
                            <input type="date" className={inputCls} value={draft.dueAt}
                                onChange={(e) => setDraft({ ...draft, dueAt: e.target.value })} />
                        </Field>
                    </>
                )}
            </CrudDrawer>

            <AlertDialog open={confirmState !== null} onOpenChange={(open) => { if (!open) setConfirmState(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmState?.desc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { confirmState?.onConfirm(); setConfirmState(null); }}>Continue</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
