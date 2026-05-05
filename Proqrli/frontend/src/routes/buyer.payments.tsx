/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { paymentsApi, type BuyerPayment, type CreatePaymentPayload, type UpdatePaymentPayload } from "@/lib/api";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/payments")({
    component: () => (
        <BuyerPermissionGate permission="payments:view">
            <PaymentsPage />
        </BuyerPermissionGate>
    ),
});

const PAY_STATUSES = ["Pending", "Scheduled", "Processing", "Paid", "Failed"] as const;
const PAY_METHODS = ["Bank transfer", "PayMongo", "GCash", "Check", "COD"];

const EMPTY = {
    invoiceID: 0,
    amount: 0,
    method: "Bank transfer",
    scheduledFor: new Date().toISOString().slice(0, 10),
    status: "Pending" as string,
    reference: "",
};

function PaymentsPage() {
    const { hasPermission } = useBuyer();
    const canSchedule = hasPermission("payments:schedule");

    const store = useApiCollection<BuyerPayment, CreatePaymentPayload, UpdatePaymentPayload>(paymentsApi);
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);
    const [invoiceLookup, setInvoiceLookup] = React.useState<{ id: number; label: string }[]>([]);

    React.useEffect(() => {
        paymentsApi.getInvoiceLookup().then(setInvoiceLookup).catch(console.error);
    }, []);

    const openCreate = () => { setDraft({ ...EMPTY }); setDrawer({ mode: "create" }); };
    const openEdit = (p: BuyerPayment) => {
        setDraft({
            invoiceID: 0,
            amount: p.amount,
            method: p.method,
            scheduledFor: p.scheduledFor,
            status: p.status,
            reference: p.reference,
        });
        setDrawer({ mode: "edit", id: p.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    invoiceID: draft.invoiceID,
                    amount: draft.amount,
                    method: draft.method,
                    scheduledFor: draft.scheduledFor,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    status: draft.status,
                    scheduledFor: draft.scheduledFor,
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
                eyebrow="Disbursements"
                title="Payments"
                description="Scheduled and historical payments to vendors. Powered by PayMongo & bank rails."
                actions={
                    canSchedule && (
                        <button onClick={openCreate} className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
                            + Schedule payment
                        </button>
                    )
                }
            />

            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading payments…
                </div>
            )}

            {store.state === "error" && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Failed to load: {store.error}
                    <button onClick={store.reload} className="ml-2 font-semibold underline">Retry</button>
                </div>
            )}

            {store.state === "idle" && (
                <div className="overflow-hidden rounded-md border border-border bg-card">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">Reference</th>
                                <th className="px-4 py-3">Vendor</th>
                                <th className="px-4 py-3">Bill</th>
                                <th className="px-4 py-3">Amount</th>
                                <th className="px-4 py-3">Method</th>
                                <th className="px-4 py-3">Scheduled</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {store.items.map((p) => (
                                <tr key={p.id} className="hover:bg-muted/40">
                                    <td className="px-4 py-3 font-mono text-xs">{p.reference}</td>
                                    <td className="px-4 py-3 font-medium">{p.vendorName}</td>
                                    <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{p.billRef}</td>
                                    <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(p.amount)}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{p.scheduledFor}</td>
                                    <td className="px-4 py-3"><AutoStatus status={p.status} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            {p.status !== "Paid" && p.status !== "Failed" && (
                                                <>
                                                    <button onClick={() => openEdit(p)}
                                                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground">
                                                        <Pencil className="h-3 w-3" />
                                                    </button>
                                                    {p.status === "Pending" && (
                                                        <button onClick={() => store.archive(p.id)}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                                                            <Archive className="h-3 w-3" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {store.items.length === 0 && (
                                <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No payments found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Schedule Payment" : `Edit ${draft.reference || "Payment"}`}
                description="Schedule or update a payment to a vendor."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={!saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                {drawer?.mode === "create" ? (
                    <>
                        <Field label="Invoice (linked bill)">
                            <select className={selectCls} value={draft.invoiceID || ""}
                                onChange={(e) => setDraft({ ...draft, invoiceID: Number(e.target.value) })}>
                                <option value="" disabled>Select an Invoice...</option>
                                {invoiceLookup.map((inv) => (
                                    <option key={inv.id} value={inv.id}>{inv.label}</option>
                                ))}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Amount">
                                <input type="number" step="0.01" className={inputCls} value={draft.amount}
                                    onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                            </Field>
                            <Field label="Method">
                                <select className={selectCls} value={draft.method}
                                    onChange={(e) => setDraft({ ...draft, method: e.target.value })}>
                                    {PAY_METHODS.map((m) => <option key={m}>{m}</option>)}
                                </select>
                            </Field>
                        </div>
                        <Field label="Scheduled for">
                            <input type="date" className={inputCls} value={draft.scheduledFor}
                                onChange={(e) => setDraft({ ...draft, scheduledFor: e.target.value })} />
                        </Field>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Status">
                                <select className={selectCls} value={draft.status}
                                    onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                                    {PAY_STATUSES.map((s) => <option key={s}>{s}</option>)}
                                </select>
                            </Field>
                            <Field label="Scheduled for">
                                <input type="date" className={inputCls} value={draft.scheduledFor}
                                    onChange={(e) => setDraft({ ...draft, scheduledFor: e.target.value })} />
                            </Field>
                        </div>
                    </>
                )}
            </CrudDrawer>
        </div>
    );
}
