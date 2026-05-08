/* eslint-disable prettier/prettier */
import * as React from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";
import { rfqsApi, type RfqDto, type RfqDetailDto } from "@/lib/api";
import {
    Award, Search, X, TrendingDown, Users, Clock, BarChart3,
    CheckCircle2, Trophy, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";
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

export const Route = createFileRoute("/buyer/quotations")({
    component: () => (
        <BuyerPermissionGate permission="quotations:view">
            <QuotationsPage />
        </BuyerPermissionGate>
    ),
});

// ─── Types ────────────────────────────────────────────────────────────────────

type QuoteFilter = "all" | "submitted" | "awarded";

// ─── Rank medal colours (Tailwind safe-list friendly) ─────────────────────────

const RANK_STYLES: Record<number, { bg: string; text: string; label: string }> = {
    1: { bg: "bg-amber-200", text: "text-amber-900", label: "Best" },
    2: { bg: "bg-zinc-200", text: "text-zinc-800", label: "2nd" },
    3: { bg: "bg-orange-200", text: "text-orange-900", label: "3rd" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

function QuotationsPage() {
    const { hasPermission } = useBuyer();
    const canAward = hasPermission("quotations:award");
    const router = useRouter();

    // Sidebar state
    const [rfqs, setRfqs] = React.useState<RfqDto[]>([]);
    const [page, setPage] = React.useState(1);
    const [totalItems, setTotalItems] = React.useState(0);
    const [sidebarQuery, setSidebarQuery] = React.useState("");
    const [debouncedQuery, setDebouncedQuery] = React.useState("");
    const [isLoadingSidebar, setIsLoadingSidebar] = React.useState(false);
    const pageSize = 8; // Smaller page size for sidebar

    // Right main state
    const [activeRfqId, setActiveRfqId] = React.useState<string | null>(null);
    const [activeDetail, setActiveDetail] = React.useState<RfqDetailDto | null>(null);
    const [isLoadingDetail, setIsLoadingDetail] = React.useState(false);

    const [quoteFilter, setQuoteFilter] = React.useState<QuoteFilter>("all");
    const [confirmAward, setConfirmAward] = React.useState<{
        rfqId: string; responseId: string; vendorName: string; total: number;
    } | null>(null);
    const [isAwarding, setIsAwarding] = React.useState(false);

    // Debounce search
    React.useEffect(() => {
        const t = setTimeout(() => {
            setDebouncedQuery(sidebarQuery);
            setPage(1); // Reset to page 1 on new search
        }, 300);
        return () => clearTimeout(t);
    }, [sidebarQuery]);

    // Fetch Sidebar RFQs
    const fetchSidebar = React.useCallback(async () => {
        setIsLoadingSidebar(true);
        try {
            // We fetch all RFQs and let the user click them to see quotes
            const res = await rfqsApi.getAll(page, pageSize, debouncedQuery, "All");
            setRfqs(res.data);
            setTotalItems(res.total);

            // Auto-select the first one if nothing is selected and we have results
            if (!activeRfqId && res.data.length > 0) {
                setActiveRfqId(res.data[0].id);
            }
        } catch (err) {
            console.error("Failed to load RFQs for sidebar", err);
        } finally {
            setIsLoadingSidebar(false);
        }
    }, [page, debouncedQuery, activeRfqId]);

    React.useEffect(() => {
        fetchSidebar();
    }, [fetchSidebar]);

    // Fetch Active RFQ Details
    React.useEffect(() => {
        if (!activeRfqId) {
            setActiveDetail(null);
            return;
        }
        let isMounted = true;
        setIsLoadingDetail(true);
        rfqsApi.getDetail(activeRfqId)
            .then(data => {
                if (isMounted) setActiveDetail(data);
            })
            .catch(console.error)
            .finally(() => {
                if (isMounted) setIsLoadingDetail(false);
            });

        return () => { isMounted = false; };
    }, [activeRfqId]);

    // Derived state for the right panel
    const activeRfq = activeDetail?.rfq;
    const allQuotes = activeDetail?.quotes ?? [];

    // Filtered list
    const visibleQuotes = React.useMemo(() => {
        if (quoteFilter === "submitted") return allQuotes.filter((q) => q.status !== "Awarded");
        if (quoteFilter === "awarded") return allQuotes.filter((q) => q.status === "Awarded");
        return allQuotes;
    }, [allQuotes, quoteFilter]);

    // Stats
    const stats = React.useMemo(() => {
        if (!allQuotes.length) return null;
        // Quotes are already sorted by total asc from the backend, but let's be safe
        const sorted = [...allQuotes].sort((a, b) => a.total - b.total);
        const best = sorted[0].total;
        const highest = sorted[sorted.length - 1].total;
        const avg = sorted.reduce((s, q) => s + q.total, 0) / sorted.length;
        const savings = highest - best;
        return { best, highest, avg, savings, bestVendor: sorted[0].vendorName };
    }, [allQuotes]);

    const handleConfirmAward = async () => {
        if (!confirmAward) return;
        setIsAwarding(true);
        try {
            const res = await rfqsApi.awardQuote(confirmAward.rfqId, confirmAward.responseId);
            alert(`Quotation awarded! Purchase Order ${res.poNumber} has been generated.`);
            setConfirmAward(null);

            // Refetch details to show awarded status
            const newDetail = await rfqsApi.getDetail(confirmAward.rfqId);
            setActiveDetail(newDetail);

            // Optionally update sidebar status
            fetchSidebar();

        } catch (err) {
            console.error("Failed to award quote:", err);
            alert("Failed to award quote. Please try again.");
        } finally {
            setIsAwarding(false);
        }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Bid evaluation"
                title="Quotations"
                description="Side-by-side comparison of vendor responses. Award one to auto-create a PO."
            />

            <div className="grid grid-cols-[280px_1fr] overflow-hidden rounded-md border border-border bg-card" style={{ minHeight: 560 }}>
                {/* ══ LEFT SIDEBAR ══ */}
                <aside className="flex flex-col border-r border-border bg-muted/40 h-full">
                    {/* Search */}
                    <div className="border-b border-border p-3 shrink-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={sidebarQuery}
                                onChange={(e) => setSidebarQuery(e.target.value)}
                                placeholder="Search RFQs…"
                                className="h-9 w-full rounded-sm border border-border bg-card pl-8 pr-8 text-xs outline-none focus:border-foreground"
                            />
                            {sidebarQuery && (
                                <button
                                    onClick={() => setSidebarQuery("")}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* RFQ list */}
                    <div className="flex-1 overflow-y-auto">
                        {isLoadingSidebar && rfqs.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : rfqs.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-muted-foreground">
                                {sidebarQuery ? "No RFQs match your search." : "No RFQs available."}
                            </div>
                        ) : (
                            <ul className="divide-y divide-border">
                                {rfqs.map((r) => {
                                    const isActive = r.id === activeRfqId;
                                    return (
                                        <li key={r.id}>
                                            <button
                                                onClick={() => {
                                                    setActiveRfqId(r.id);
                                                    setQuoteFilter("all");
                                                }}
                                                className={cn(
                                                    "w-full border-l-2 px-3 py-3 text-left transition-colors block",
                                                    isActive
                                                        ? "border-foreground bg-card"
                                                        : "border-transparent hover:bg-card/60",
                                                )}
                                            >
                                                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                                    {r.rfqNumber}
                                                </div>
                                                <div className={cn("mt-0.5 text-sm font-semibold leading-snug truncate", isActive ? "text-foreground" : "text-foreground/80")}>
                                                    {r.title}
                                                </div>
                                                <div className="mt-1.5 flex items-center justify-between">
                                                    <AutoStatus status={r.status} />
                                                    <span className={cn("font-mono text-[10px]", r.responsesReceived > 0 ? "text-emerald-600 font-semibold" : "text-muted-foreground")}>
                                                        {r.responsesReceived} quote{r.responsesReceived !== 1 ? "s" : ""}
                                                    </span>
                                                </div>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>

                    {/* Sidebar Pagination */}
                    {totalItems > pageSize && (
                        <div className="border-t border-border p-2 shrink-0 flex items-center justify-between bg-card">
                            <span className="text-[10px] text-muted-foreground font-mono">
                                {page}/{Math.ceil(totalItems / pageSize)}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-1 rounded-sm border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * pageSize >= totalItems}
                                    className="p-1 rounded-sm border border-border hover:bg-muted disabled:opacity-50 disabled:hover:bg-transparent"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </aside>

                {/* ══ RIGHT MAIN ══ */}
                <div className="flex flex-col overflow-hidden h-full">
                    {isLoadingDetail ? (
                        <div className="flex flex-1 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : activeRfq && activeDetail ? (
                        <>
                            {/* Header */}
                            <div className="border-b border-border px-5 py-4 shrink-0">
                                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                    {activeRfq.rfqNumber} · from {activeRfq.prRef}
                                </p>
                                <div className="mt-1 flex items-center gap-3">
                                    <h2 className="text-base font-semibold">{activeRfq.title}</h2>
                                    <AutoStatus status={activeRfq.status} />
                                </div>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    {activeRfq.category} · closes {activeRfq.closesAt}
                                </p>
                            </div>

                            {/* Stats row */}
                            {stats ? (
                                <div className="grid grid-cols-4 gap-px border-b border-border bg-border shrink-0">
                                    <StatTile
                                        icon={<Users className="h-3.5 w-3.5" />}
                                        label="Vendors quoted"
                                        value={String(allQuotes.length)}
                                        sub={`of ${activeRfq.invitedVendors} invited`}
                                    />
                                    <StatTile
                                        icon={<TrendingDown className="h-3.5 w-3.5 text-emerald-600" />}
                                        label="Best quote"
                                        value={formatBuyerCurrency(stats.best)}
                                        sub={stats.bestVendor.split(" ")[0]}
                                        valueClass="text-emerald-700"
                                    />
                                    <StatTile
                                        icon={<BarChart3 className="h-3.5 w-3.5" />}
                                        label="Average quote"
                                        value={formatBuyerCurrency(stats.avg)}
                                        sub="across all vendors"
                                    />
                                    <StatTile
                                        icon={<Trophy className="h-3.5 w-3.5 text-amber-500" />}
                                        label="Max savings"
                                        value={formatBuyerCurrency(stats.savings)}
                                        sub="best vs highest"
                                        valueClass="text-emerald-700"
                                    />
                                </div>
                            ) : (
                                <div className="px-5 py-6 text-sm text-muted-foreground text-center shrink-0 border-b border-border">
                                    Waiting for vendors to submit quotations.
                                </div>
                            )}

                            {/* Filter pills */}
                            <div className="flex items-center gap-2 border-b border-border px-5 py-2.5 shrink-0 bg-muted/20">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-1">Show:</span>
                                {(["all", "submitted", "awarded"] as QuoteFilter[]).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setQuoteFilter(f)}
                                        className={cn(
                                            "rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors capitalize",
                                            quoteFilter === f
                                                ? "border-foreground bg-foreground text-background"
                                                : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                                        )}
                                    >
                                        {f}
                                    </button>
                                ))}
                                <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                                    Sorted by price · lowest first
                                </span>
                            </div>

                            {/* Quotations table */}
                            <div className="flex-1 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3 w-12">Rank</th>
                                            <th className="px-4 py-3">Vendor</th>
                                            <th className="px-4 py-3 w-48">Total quote</th>
                                            <th className="px-4 py-3 w-32">Submitted</th>
                                            <th className="px-4 py-3 w-28">Status</th>
                                            <th className="px-4 py-3 w-24" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {visibleQuotes.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                                    No quotes match this filter.
                                                </td>
                                            </tr>
                                        ) : (
                                            visibleQuotes.map((q) => {
                                                const isAwarded = q.status === "Awarded";
                                                const rankStyle = RANK_STYLES[q.rank];
                                                const diffPct = q.rank === 1
                                                    ? null
                                                    : Math.round(((q.total - (stats?.best ?? 0)) / (stats?.best ?? 1)) * 100);
                                                const barPct = stats && stats.highest > 0
                                                    ? Math.round((q.total / stats.highest) * 100)
                                                    : 100;
                                                const barColor =
                                                    q.rank === 1 ? "bg-emerald-500"
                                                        : q.rank === 2 ? "bg-amber-400"
                                                            : "bg-rose-400";

                                                return (
                                                    <tr
                                                        key={q.id}
                                                        className={cn(
                                                            "hover:bg-muted/40 transition-colors",
                                                            isAwarded && "bg-emerald-50/60 dark:bg-emerald-950/20",
                                                        )}
                                                    >
                                                        {/* Rank */}
                                                        <td className="px-4 py-3">
                                                            <span className={cn(
                                                                "inline-flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold",
                                                                rankStyle
                                                                    ? `${rankStyle.bg} ${rankStyle.text}`
                                                                    : "border border-border text-muted-foreground",
                                                            )}>
                                                                {q.rank}
                                                            </span>
                                                        </td>

                                                        {/* Vendor */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted font-mono text-[10px] font-bold">
                                                                    {q.vendorName.split(" ").slice(0, 2).map((w: string) => w[0]).join("")}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold">{q.vendorName}</p>
                                                                    {isAwarded && (
                                                                        <p className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold mt-0.5">
                                                                            <CheckCircle2 className="h-3 w-3" /> Awarded
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Total + price bar */}
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="font-mono text-sm font-bold">
                                                                    {formatBuyerCurrency(q.total)}
                                                                </span>
                                                                {diffPct !== null ? (
                                                                    <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-amber-800">
                                                                        +{diffPct}%
                                                                    </span>
                                                                ) : (
                                                                    <span className="rounded-sm bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-800">
                                                                        Best
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {/* Price bar */}
                                                            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
                                                                <div
                                                                    className={cn("h-full rounded-full transition-all", barColor)}
                                                                    style={{ width: `${barPct}%` }}
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* Submitted at */}
                                                        <td className="px-4 py-3 text-muted-foreground text-xs font-mono">
                                                            {q.submittedAt}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-4 py-3">
                                                            <AutoStatus status={q.status} />
                                                        </td>

                                                        {/* Award action */}
                                                        <td className="px-4 py-3 text-right">
                                                            {!isAwarded && canAward && activeRfq.status !== "Awarded" && activeRfq.status !== "Cancelled" && (
                                                                <button
                                                                    onClick={() => setConfirmAward({
                                                                        rfqId: activeRfq.id,
                                                                        responseId: q.id,
                                                                        vendorName: q.vendorName,
                                                                        total: q.total,
                                                                    })}
                                                                    className="inline-flex items-center gap-1 rounded-sm bg-foreground px-3 py-1.5 text-[10px] font-semibold text-background hover:opacity-85"
                                                                >
                                                                    <Award className="h-3 w-3" /> Award
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                            Select an RFQ from the sidebar to view quotes.
                        </div>
                    )}
                </div>
            </div>

            {/* ── Award confirmation dialog ── */}
            <AlertDialog open={!!confirmAward} onOpenChange={(o) => { if (!o) setConfirmAward(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Award this quotation?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are awarding <span className="font-semibold text-foreground">{confirmAward?.vendorName}</span> for{" "}
                            <span className="font-semibold text-foreground">
                                {confirmAward ? formatBuyerCurrency(confirmAward.total) : ""}
                            </span>.
                            {" "}A Purchase Order will be auto-created from this award. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isAwarding}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmAward} disabled={isAwarding}>
                            {isAwarding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Confirm award
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
    icon, label, value, sub, valueClass,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub: string;
    valueClass?: string;
}) {
    return (
        <div className="flex flex-col gap-1 bg-card px-4 py-3 h-full justify-center">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {icon} {label}
            </div>
            <p className={cn("font-mono text-sm font-bold", valueClass)}>{value}</p>
            <p className="text-[10px] text-muted-foreground">{sub}</p>
        </div>
    );
}