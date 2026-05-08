/* eslint-disable prettier/prettier */
// TanStack Router will serve this as the /buyer/rfqs index page,
// while rfqs.tsx becomes the layout wrapper with <Outlet />.

import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls } from "@/components/CrudDrawer";
import {
    formatBuyerCurrency,
} from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { ChevronRight, FileText, Info, Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Pull approved requisitions from the API
import { requisitionsApi, rfqsApi, type RfqDto } from "@/lib/api";
import { useApiCollection } from "@/lib/use-api-collection";

export const Route = createFileRoute("/buyer/rfqs/")({
    component: () => (
        <BuyerPermissionGate permission="rfq:view">
            <RfqPage />
        </BuyerPermissionGate>
    ),
});


const CATEGORIES = [
    "Industrial Equipment", "Hydraulics", "Chemicals",
    "Fasteners", "Electrical", "Safety", "Raw Materials", "MRO",
];

const RFQ_STATUSES = ["All", "Draft", "Open", "Closed", "Awarded", "Cancelled"];

const EMPTY_DRAFT = {
    title: "",
    category: CATEGORIES[0],
    closesAt: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    notes: "",
    linkedPrId: "",   // PR selected by the buyer
    sourcingRoute: "rfq" as "rfq" | "direct-po",
};



function RfqPage() {
    const { hasPermission } = useBuyer();
    const canCreate = hasPermission("rfq:create");

    
    const prStore = useApiCollection(requisitionsApi);
    const approvedPRs = prStore.items.filter((r) => r.status === "Approved");

    const [drawer, setDrawer] = React.useState(false);
    const [draft, setDraft] = React.useState(EMPTY_DRAFT);
    const [saving, setSaving] = React.useState(false);
    
    // Pagination & Search state
    const [rfqList, setRfqList] = React.useState<RfqDto[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [totalItems, setTotalItems] = React.useState(0);
    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedQuery, setDebouncedQuery] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("All");
    const pageSize = 10;

    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const loadRfqs = React.useCallback(() => {
        setIsLoading(true);
        rfqsApi.getAll(page, pageSize, debouncedQuery, statusFilter)
            .then(res => {
                setRfqList(res.data);
                setTotalItems(res.total);
            })
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, [page, debouncedQuery, statusFilter]);

    React.useEffect(() => {
        loadRfqs();
    }, [loadRfqs]);

    const selectedPR = approvedPRs.find((p) => p.id === draft.linkedPrId);

    const openDrawer = () => {
        setDraft({ ...EMPTY_DRAFT });
        setDrawer(true);
    };

    const handleSave = async () => {
        if (!draft.title.trim() || !draft.linkedPrId) return;
        setSaving(true);
        try {
            await rfqsApi.create(draft);
            setDrawer(false);
            setPage(1); // reset to first page to see the new item
            loadRfqs(); // reload the list
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Sourcing"
                title="Requests for Quotation"
                description="Invite vendors to bid on approved purchase requisitions. Compare quotes, then award the winner."
                actions={
                    canCreate && (
                        <button
                            onClick={openDrawer}
                            className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85"
                        >
                            + New RFQ
                        </button>
                    )
                }
            />

            {/* Workflow hint banner */}
            <div className="flex items-start gap-3 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
                <div>
                    <span className="font-semibold">Workflow: </span>
                    Approved Requisitions → Create RFQ (invite vendors to quote) → Award winner → Purchase Order is generated.
                    Only <span className="font-semibold">Approved</span> PRs can be converted into an RFQ.
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by RFQ number or title…"
                        className="h-11 w-full rounded-sm border border-border bg-card pl-9 pr-9 text-sm outline-none focus:border-foreground"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-11 w-48 shrink-0 rounded-sm border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-foreground appearance-none cursor-pointer pr-8"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                    {RFQ_STATUSES.map((status) => (
                        <option key={status} value={status}>{status === "All" ? "All Statuses" : status}</option>
                    ))}
                </select>
            </div>

            {/* RFQ table */}
            <div className="overflow-hidden rounded-md border border-border bg-card">
                <table className="w-full text-sm">
                    <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">RFQ #</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">From PR</th>
                            <th className="px-4 py-3">Vendors</th>
                            <th className="px-4 py-3">Closes</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    <div className="flex items-center justify-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading RFQs...
                                    </div>
                                </td>
                            </tr>
                        ) : rfqList.length > 0 ? (
                            rfqList.map((r) => (
                                <tr key={r.id} className="hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <Link
                                            to="/buyer/rfqs/$rfqId"
                                            params={{ rfqId: r.id }}
                                            className="font-mono text-xs font-semibold underline-offset-4 hover:underline"
                                        >
                                            {r.rfqNumber}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3 font-medium">{r.title}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{r.category}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                                            <FileText className="h-3 w-3" /> {r.prRef}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs">
                                            <span className="font-semibold">{r.responsesReceived}</span>
                                            <span className="text-muted-foreground"> / {r.invitedVendors}</span>
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{r.closesAt}</td>
                                    <td className="px-4 py-3"><AutoStatus status={r.status} /></td>
                                    <td className="px-4 py-3">
                                        <Link
                                            to="/buyer/rfqs/$rfqId"
                                            params={{ rfqId: r.id }}
                                            className="inline-flex items-center gap-1 text-xs font-semibold underline-offset-4 hover:underline"
                                        >
                                            Open <ChevronRight className="h-3 w-3" />
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    No RFQs found. {searchQuery ? "Try adjusting your search terms." : "Start by approving a requisition and creating an RFQ from it."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Pagination */}
                {totalItems > pageSize && (
                    <div className="flex items-center justify-between border-t border-border bg-card px-4 py-3">
                        <p className="text-xs text-muted-foreground">
                            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 hover:bg-muted"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => p + 1)}
                                disabled={page * pageSize >= totalItems}
                                className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50 hover:bg-muted"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Create RFQ Drawer ── */}
            <CrudDrawer
                open={drawer}
                mode="create"
                title="New Request for Quotation"
                description="Link an approved Purchase Requisition, then invite vendors to submit quotes."
                onClose={() => setDrawer(false)}
                onSave={handleSave}
                canSave={draft.title.trim() !== "" && draft.linkedPrId !== "" && !saving}
                saveLabel={saving ? "Creating…" : "Create RFQ"}
            >
                {/* Step 1 — Link approved PR */}
                <div className="rounded-md border border-border bg-muted/50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">1</span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">Link a Purchase Requisition</span>
                    </div>

                    {approvedPRs.length === 0 ? (
                        <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            No approved requisitions found. A PR must be <strong>Approved</strong> before it can be converted into an RFQ.{" "}
                            <Link to="/buyer/requisitions" className="font-semibold underline">
                                Go to Requisitions →
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Field label="Select approved PR">
                                <select
                                    className={selectCls}
                                    value={draft.linkedPrId}
                                    onChange={(e) => {
                                        const pr = approvedPRs.find((p) => p.id === e.target.value);
                                        setDraft({
                                            ...draft,
                                            linkedPrId: e.target.value,
                                            // Auto-fill title from PR if title is blank
                                            title: draft.title || pr?.title || "",
                                        });
                                    }}
                                >
                                    <option value="">— Choose a PR —</option>
                                    {approvedPRs.map((pr) => (
                                        <option key={pr.id} value={pr.id}>
                                            {pr.prNumber} · {pr.title} ({pr.department})
                                        </option>
                                    ))}
                                </select>
                            </Field>

                            {/* PR preview card */}
                            {selectedPR && (
                                <div className="mt-2 rounded-sm border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                                    <div className="font-semibold">{selectedPR.prNumber} — {selectedPR.title}</div>
                                    <div className="mt-0.5 text-emerald-700">
                                        {selectedPR.department} · {selectedPR.itemCount} item(s) ·{" "}
                                        Est. {formatBuyerCurrency(selectedPR.amount)} · Needed by {selectedPR.neededBy}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Step 2 — RFQ details */}
                <div className="rounded-md border border-border bg-muted/50 p-4">
                    <div className="mb-3 flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">2</span>
                        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground font-mono">RFQ Details</span>
                    </div>

                    <div className="space-y-3">
                        <Field label="RFQ Title">
                            <input
                                className={inputCls}
                                value={draft.title}
                                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                                placeholder="e.g. Q3 Bearings & Seals Sourcing"
                            />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Category">
                                <select className={selectCls} value={draft.category}
                                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field label="Closes on">
                                <input
                                    type="date"
                                    className={inputCls}
                                    value={draft.closesAt}
                                    onChange={(e) => setDraft({ ...draft, closesAt: e.target.value })}
                                />
                            </Field>
                        </div>
                        <Field label="Sourcing route">
                            <div className="grid grid-cols-2 gap-2">
                                {([
                                    { key: "rfq", label: "Open RFQ", sub: "Invite multiple vendors to quote" },
                                    { key: "direct-po", label: "Direct PO", sub: "Known vendor, skip bidding" },
                                ] as const).map((opt) => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setDraft({ ...draft, sourcingRoute: opt.key })}
                                        className={cn(
                                            "rounded-sm border px-3 py-2.5 text-left text-xs transition-colors",
                                            draft.sourcingRoute === opt.key
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border hover:border-foreground",
                                        )}
                                    >
                                        <div className="font-semibold">{opt.label}</div>
                                        <div className={cn("mt-0.5 text-[10px]", draft.sourcingRoute === opt.key ? "opacity-70" : "text-muted-foreground")}>
                                            {opt.sub}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Field>
                        <Field label="Notes / scope of supply">
                            <textarea
                                className={textareaCls}
                                placeholder="Delivery terms, quality requirements, special conditions…"
                                value={draft.notes}
                                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                            />
                        </Field>
                    </div>
                </div>
            </CrudDrawer>
        </div>
    );
}
