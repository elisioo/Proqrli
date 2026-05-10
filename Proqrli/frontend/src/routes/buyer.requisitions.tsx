/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Pencil, Ban, Loader2, Archive, RotateCcw, X as XIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import {
    CrudDrawer,
    Field,
    inputCls,
    selectCls,
    textareaCls,
    NumberInput,
    SelectOrCustom,
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
    requisitionsApi,
    type Requisition,
    type CreateRequisitionPayload,
    type UpdateRequisitionPayload,
} from "@/lib/api";
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

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_DEPTS = [
    "Maintenance",
    "Production",
    "EHS",
    "Engineering",
    "Facilities",
    "IT",
];

// Auto-generates a PR number in the format PR-YYYYMMDD-XXXX (like inventory SKU).
function generatePRNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `PR-${datePart}-${rand}`;
}

const EMPTY = {
    prNumber: "",
    title: "",
    justification: "",
    requestedBy: "",
    department: DEFAULT_DEPTS[0],
    amount: 0,
    itemCount: 1,
    status: "Draft" as const,
    neededBy: new Date().toISOString().slice(0, 10),
    isArchived: false,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function RequisitionsPage() {
    const { hasPermission, user } = useBuyer();
    const canCreate = hasPermission("requisitions:create");
    const canApprove = hasPermission("requisitions:approve");

    const store = useApiCollection<Requisition, CreateRequisitionPayload, UpdateRequisitionPayload>(requisitionsApi);

    const [view, setView] = React.useState<"active" | "cancelled" | "archived">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);

    // Confirmation modal state (archive, approve, reject, etc.)
    const [confirmState, setConfirmState] = React.useState<{
        title: string;
        desc: string;
        onConfirm: () => void;
    } | null>(null);

    // Collect all departments seen in existing records so they appear in the dropdown.
    const allDepts = React.useMemo(() =>
        Array.from(new Set([
            ...DEFAULT_DEPTS,
            ...store.items.map((r) => r.department).filter(Boolean),
        ])),
        [store.items],
    );

    const active = store.items.filter((r) => !r.isArchived && r.status !== "Cancelled");
    const cancelled = store.items.filter((r) => !r.isArchived && r.status === "Cancelled");
    const archived = store.items.filter((r) => r.isArchived);
    const list = view === "active" ? active : view === "cancelled" ? cancelled : archived;

    // ── Drawer open / close ────────────────────────────────────────────────

    const openCreate = () => {
        setDraft({
            ...EMPTY,
            prNumber: generatePRNumber(),   // auto-generate
            requestedBy: user.name,
        });
        setDrawer({ mode: "create" });
    };

    const openEdit = (r: Requisition) => {
        setDraft({
            prNumber: r.prNumber,
            title: r.title,
            justification: r.justification ?? "",
            requestedBy: r.requestedBy,
            department: r.department,
            amount: r.amount,
            itemCount: r.itemCount,
            status: r.status as typeof EMPTY.status,
            neededBy: r.neededBy,
            isArchived: r.isArchived,
        });
        setDrawer({ mode: "edit", id: r.id });
    };

    const closeDrawer = () => setDrawer(null);

    // ── Save ──────────────────────────────────────────────────────────────

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    title: draft.title,
                    justification: draft.justification,
                    requestedBy: draft.requestedBy,
                    department: draft.department,
                    amount: draft.amount,
                    itemCount: draft.itemCount,
                    neededBy: draft.neededBy,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    title: draft.title,
                    justification: draft.justification,
                    department: draft.department,
                    amount: draft.amount,
                    itemCount: draft.itemCount,
                    status: draft.status,
                    neededBy: draft.neededBy,
                    isArchived: draft.isArchived,
                });
            }
            closeDrawer();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = () => {
        if (!drawer?.id) return;
        const target = store.items.find((r) => r.id === drawer.id);
        setConfirmState({
            title: "Archive requisition?",
            desc: `Are you sure you want to archive "${target?.title ?? "this requisition"}"? It will be moved to the archive tab.`,
            onConfirm: async () => {
                await store.archive(drawer.id!);
                closeDrawer();
            },
        });
    };

    const handleCancel = (r: Requisition) => {
        setConfirmState({
            title: "Cancel requisition?",
            desc: `Are you sure you want to cancel "${r.title}"?`,
            onConfirm: () => store.update(r.id, { status: "Cancelled" }),
        });
    };

    const handleRestore = (r: Requisition) => {
        setConfirmState({
            title: "Restore requisition?",
            desc: `Restore "${r.title}" to active status?`,
            onConfirm: () => store.update(r.id, { isArchived: false }),
        });
    };

    // ── Row-level approve / reject (with confirmation) ────────────────────

    const handleApprove = (r: Requisition) => {
        setConfirmState({
            title: "Approve requisition?",
            desc: `Approve "${r.title}" (${r.prNumber})? This will mark it ready for PO or RFQ conversion.`,
            onConfirm: () => store.update(r.id, { status: "Approved" }),
        });
    };

    const handleReject = (r: Requisition) => {
        setConfirmState({
            title: "Reject requisition?",
            desc: `Reject "${r.title}" (${r.prNumber})? The requester will need to submit a new PR.`,
            onConfirm: () => store.update(r.id, { status: "Rejected" }),
        });
    };

    // ─────────────────────────────────────────────────────────────────────────

    // Requestors cannot edit once approved/rejected/converted
    const isLocked = !canApprove && ["Approved", "Rejected", "Converted to RFQ", "Converted to PO"].includes(draft.status);

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

            {/* ── Loading ── */}
            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading requisitions…
                </div>
            )}

            {/* ── Error ── */}
            {store.state === "error" && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Failed to load: {store.error}
                    <button onClick={store.reload} className="ml-2 font-semibold underline">Retry</button>
                </div>
            )}

            {/* ── Table ── */}
            {store.state === "idle" && (
                <>
                    {/* View tabs */}
                    <div className="flex gap-1 border-b border-border">
                        {(canApprove ? ["active", "cancelled", "archived"] : ["active", "cancelled"]).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v as any)}
                                className={cn(
                                    "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                    view === v
                                        ? "border-foreground text-foreground"
                                        : "border-transparent text-muted-foreground hover:text-foreground",
                                )}
                            >
                                {v} ({v === "active" ? active.length : v === "cancelled" ? cancelled.length : archived.length})
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
                                        <td className="px-4 py-3 font-mono font-semibold">
                                            {formatBuyerCurrency(r.amount)}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{r.neededBy}</td>
                                        <td className="px-4 py-3"><AutoStatus status={r.status} /></td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                {r.isArchived ? (
                                                    canApprove && (
                                                        <button
                                                            onClick={() => handleRestore(r)}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-emerald-200 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100"
                                                            title="Restore"
                                                        >
                                                            <RotateCcw className="h-3 w-3" /> Restore
                                                        </button>
                                                    )
                                                ) : (
                                                    <>
                                                        {r.status === "Cancelled" ? (
                                                            <span className="text-xs text-muted-foreground">Cancelled</span>
                                                        ) : (
                                                            <>
                                                                {r.status === "Pending Approval" && canApprove && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => handleApprove(r)}
                                                                            className="rounded-sm bg-foreground px-2 py-1 text-[10px] font-semibold text-background"
                                                                        >
                                                                            Approve
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleReject(r)}
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
                                                                {/* Anyone can cancel their draft/pending request */}
                                                                {["Draft", "Pending Approval"].includes(r.status) && (
                                                                    <button
                                                                        onClick={() => handleCancel(r)}
                                                                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                                                                        title="Cancel request"
                                                                    >
                                                                        <XIcon className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                                {/* Only Admin/Approver can Archive */}
                                                                {canApprove && (
                                                                    <button
                                                                        onClick={() =>
                                                                            setConfirmState({
                                                                                title: "Archive requisition?",
                                                                                desc: `Archive "${r.title}"? It will be hidden from the active list.`,
                                                                                onConfirm: () => store.archive(r.id),
                                                                            })
                                                                        }
                                                                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 text-[10px] font-semibold text-amber-700 hover:bg-amber-100"
                                                                        title="Archive"
                                                                    >
                                                                        <Archive className="h-3 w-3" />
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
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

            {/* ── Drawer ── */}
            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "New requisition" : draft.title || "Edit requisition"}
                description="Submit a request for goods or services for your department."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" && canApprove ? handleArchive : undefined}
                archiveLabel="Archive record"
                canSave={!isLocked && draft.title.trim() !== "" && draft.requestedBy.trim() !== "" && !saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                {/* PR Number — read-only, auto-generated */}
                <div className="grid grid-cols-2 gap-3">
                    <Field label="PR number" hint="Auto-generated — cannot be changed">
                        <input
                            className={cn(inputCls, "cursor-not-allowed bg-muted opacity-70")}
                            value={draft.prNumber}
                            disabled
                            readOnly
                        />
                    </Field>
                    <Field label="Status" hint={!canApprove ? "Only Approvers can authorize requests" : undefined}>
                        <select
                            className={cn(selectCls, (!canApprove && !["Draft", "Pending Approval"].includes(draft.status)) && "cursor-not-allowed bg-muted opacity-70")}
                            value={draft.status}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value as typeof draft.status })}
                            disabled={!canApprove && !["Draft", "Pending Approval"].includes(draft.status)}
                        >
                            <option value="Draft">Draft</option>
                            <option value="Pending Approval">Pending Approval</option>
                            {(canApprove || draft.status === "Approved") && <option value="Approved" disabled={!canApprove}>Approved</option>}
                            {(canApprove || draft.status === "Rejected") && <option value="Rejected" disabled={!canApprove}>Rejected</option>}
                            {(canApprove || draft.status === "Converted to RFQ") && <option value="Converted to RFQ" disabled={!canApprove}>Converted to RFQ</option>}
                            {(canApprove || draft.status === "Converted to PO") && <option value="Converted to PO" disabled={!canApprove}>Converted to PO</option>}
                        </select>
                    </Field>
                </div>

                <Field label="Title">
                    <input
                        className={inputCls}
                        value={draft.title}
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                        disabled={isLocked}
                        placeholder="Enter the title"
                    />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                    <Field label="Requested by">
                        <input
                            className={inputCls}
                            value={draft.requestedBy}
                            disabled={isLocked}
                            onChange={(e) => setDraft({ ...draft, requestedBy: e.target.value })}
                        />
                    </Field>
                    {/* Department — supports "Other" free-text entry */}
                    <Field label="Department">
                        <SelectOrCustom
                            value={draft.department}
                            options={allDepts}
                            disabled={isLocked}
                            onChange={(val) => setDraft({ ...draft, department: val })}
                            addLabel="+ Other department…"
                            placeholder="Type department name…"
                        />
                    </Field>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    <Field label="Items">
                        <NumberInput
                            value={draft.itemCount}
                            disabled={isLocked}
                            onChange={(val) => setDraft({ ...draft, itemCount: val })}
                            placeholder="0"
                        />
                    </Field>
                    <Field label="Amount">
                        <NumberInput
                            value={draft.amount}
                            disabled={isLocked}
                            onChange={(val) => setDraft({ ...draft, amount: val })}
                            placeholder="0.00"
                            step={0.01}
                        />
                    </Field>
                    <Field label="Needed by">
                        <input
                            type="date"
                            className={inputCls}
                            value={draft.neededBy}
                            disabled={isLocked}
                            onChange={(e) => setDraft({ ...draft, neededBy: e.target.value })}
                        />
                    </Field>
                </div>

                <Field label="Justification">
                    <textarea
                        className={textareaCls}
                        value={draft.justification}
                        disabled={isLocked}
                        onChange={(e) => setDraft({ ...draft, justification: e.target.value })}
                        placeholder="Why this is needed and any vendor preferences."
                    />
                </Field>
            </CrudDrawer>

            {/* ── Confirmation AlertDialog ── */}
            <AlertDialog
                open={!!confirmState}
                onOpenChange={(o) => { if (!o) setConfirmState(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmState?.desc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                confirmState?.onConfirm();
                                setConfirmState(null);
                            }}
                        >
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}