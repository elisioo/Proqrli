/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Archive, RotateCcw, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { requisitionsApi, type Requisition, type CreateRequisitionPayload, type UpdateRequisitionPayload } from "@/lib/api";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/requisitions")({
    component: () => (
        <BuyerPermissionGate permission="requisitions:view">
            <RequisitionsPage />
        </BuyerPermissionGate>
    ),
});

const DEPTS = ["Maintenance", "Production", "EHS", "Engineering", "Facilities", "IT"];

const EMPTY = {
    prNumber: "",
    title: "",
    requestedBy: "",
    department: DEPTS[0],
    amount: 0,
    itemCount: 1,
    status: "Draft" as const,
    neededBy: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
};

function RequisitionsPage() {
    const { hasPermission, user } = useBuyer();
    const canCreate = hasPermission("requisitions:create");
    const canApprove = hasPermission("requisitions:approve");

    const store = useApiCollection<Requisition, CreateRequisitionPayload, UpdateRequisitionPayload>(requisitionsApi);
    const [view, setView] = React.useState<"active" | "cancelled">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);

    const active = store.items.filter((r) => r.status !== "Cancelled");
    const cancelled = store.items.filter((r) => r.status === "Cancelled");
    const list = view === "active" ? active : cancelled;

    const openCreate = () => {
        setDraft({ ...EMPTY, requestedBy: user.name });
        setDrawer({ mode: "create" });
    };
    const openEdit = (r: Requisition) => {
        setDraft({
            prNumber: r.prNumber,
            title: r.title,
            requestedBy: r.requestedBy,
            department: r.department,
            amount: r.amount,
            itemCount: r.itemCount,
            status: r.status as typeof EMPTY.status,
            neededBy: r.neededBy,
        });
        setDrawer({ mode: "edit", id: r.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    title: draft.title,
                    requestedBy: draft.requestedBy,
                    department: draft.department,
                    amount: draft.amount,
                    itemCount: draft.itemCount,
                    neededBy: draft.neededBy,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    title: draft.title,
                    department: draft.department,
                    amount: draft.amount,
                    itemCount: draft.itemCount,
                    status: draft.status,
                    neededBy: draft.neededBy,
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
        if (drawer?.id) {
            await store.archive(drawer.id);
            closeDrawer();
        }
    };

    const handleApprove = async (id: string) => {
        await store.update(id, { status: "Approved" });
    };

    const handleReject = async (id: string) => {
        await store.update(id, { status: "Rejected" });
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Demand intake"
                title="Purchase requisitions"
                description="Internal requests from departments. Approve, then convert into an RFQ or PO."
                actions={
                    canCreate && (
                        <button
                            onClick={openCreate}
                            className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85"
                        >
                            + New requisition
                        </button>
                    )
                }
            />

            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading requisitions…
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
                    <div className="flex gap-1 border-b border-border">
                        {(["active", "cancelled"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={cn(
                                    "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                    view === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {v} ({v === "active" ? active.length : cancelled.length})
                            </button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-md border border-border bg-card">
                        <table className="w-full text-sm">
                            <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">PR #</th>
                                    <th className="px-4 py-3">Title</th>
                                    <th className="px-4 py-3">Requested by</th>
                                    <th className="px-4 py-3">Dept</th>
                                    <th className="px-4 py-3">Items</th>
                                    <th className="px-4 py-3">Amount</th>
                                    <th className="px-4 py-3">Needed by</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {list.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/40">
                                        <td className="px-4 py-3 font-mono text-xs">{r.prNumber}</td>
                                        <td className="px-4 py-3 font-medium">{r.title}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{r.requestedBy}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{r.department}</td>
                                        <td className="px-4 py-3">{r.itemCount}</td>
                                        <td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(r.amount)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{r.neededBy}</td>
                                        <td className="px-4 py-3"><AutoStatus status={r.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {r.status === "Cancelled" ? (
                                                    <span className="text-xs text-muted-foreground">Cancelled</span>
                                                ) : (
                                                    <>
                                                        {r.status === "Pending Approval" && canApprove && (
                                                            <>
                                                                <button
                                                                    onClick={() => handleApprove(r.id)}
                                                                    className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background"
                                                                >
                                                                    Approve
                                                                </button>
                                                                <button
                                                                    onClick={() => handleReject(r.id)}
                                                                    className="rounded-sm border border-border px-2 py-1 text-[10px] font-semibold"
                                                                >
                                                                    Reject
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => openEdit(r)}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                                        >
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => store.archive(r.id)}
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
                                        <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                            No requisitions in this view.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "New requisition" : draft.title || "Edit requisition"}
                description="Submit a request for goods or services for your department."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={draft.title.trim() !== "" && draft.requestedBy.trim() !== "" && !saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                <div className="grid grid-cols-2 gap-3">
                    <Field label="PR number" hint="Auto-generated if left blank">
                        <input className={inputCls} value={draft.prNumber} placeholder="Auto"
                            onChange={(e) => setDraft({ ...draft, prNumber: e.target.value })} />
                    </Field>
                    <Field label="Status">
                        <select className={selectCls} value={draft.status}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value as typeof draft.status })}>
                            <option>Draft</option>
                            <option>Pending Approval</option>
                            <option>Approved</option>
                            <option>Rejected</option>
                            <option>Converted to RFQ</option>
                            <option>Converted to PO</option>
                        </select>
                    </Field>
                </div>
                <Field label="Title">
                    <input className={inputCls} value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        placeholder="e.g. Q3 bearings restock — Bay 4" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Requested by">
                        <input className={inputCls} value={draft.requestedBy}
                            onChange={(e) => setDraft({ ...draft, requestedBy: e.target.value })} />
                    </Field>
                    <Field label="Department">
                        <select className={selectCls} value={draft.department}
                            onChange={(e) => setDraft({ ...draft, department: e.target.value })}>
                            {DEPTS.map((d) => <option key={d}>{d}</option>)}
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Items">
                        <input type="number" className={inputCls} value={draft.itemCount}
                            onChange={(e) => setDraft({ ...draft, itemCount: Number(e.target.value) })} />
                    </Field>
                    <Field label="Amount">
                        <input type="number" step="0.01" className={inputCls} value={draft.amount}
                            onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })} />
                    </Field>
                    <Field label="Needed by">
                        <input type="date" className={inputCls} value={draft.neededBy}
                            onChange={(e) => setDraft({ ...draft, neededBy: e.target.value })} />
                    </Field>
                </div>
                <Field label="Justification">
                    <textarea className={textareaCls} placeholder="Why this is needed and any vendor preferences." />
                </Field>
            </CrudDrawer>
        </div>
    );
}
