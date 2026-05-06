/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, textareaCls, NumberInput } from "@/components/CrudDrawer";
import { useCollection } from "@/lib/use-collection";
import { INCOMING_RFQS, formatCurrency, type IncomingRFQ } from "@/lib/mock-data";
import { useVendor } from "@/lib/vendor-context";
import { cn } from "@/lib/utils";
import { Inbox, MessageCircle, Trophy, X, Archive, RotateCcw, Pencil } from "lucide-react";

export const Route = createFileRoute("/vendor/rfqs")({
    component: () => (
        <PermissionGate permission="rfq:view">
            <RFQInboxPage />
        </PermissionGate>
    ),
});

const TABS = ["All", "New", "Viewed", "Quoted", "Awarded", "Lost", "Declined", "Archived"] as const;

type RfqRow = IncomingRFQ & { archived?: boolean };

type QuoteDraft = {
    total: number;
    leadTimeDays: number;
    validUntil: string;
    notes: string;
};

function RFQInboxPage() {
    const { hasPermission } = useVendor();
    const canRespond = hasPermission("rfq:respond");

    const store = useCollection<RfqRow>(INCOMING_RFQS as RfqRow[], "irfq");
    const [tab, setTab] = React.useState<(typeof TABS)[number]>("All");

    const [quoteFor, setQuoteFor] = React.useState<RfqRow | null>(null);
    const [quoteDraft, setQuoteDraft] = React.useState<QuoteDraft>({
        total: 0,
        leadTimeDays: 7,
        validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        notes: "",
    });

    const baseList = tab === "Archived" ? store.archived : store.items;
    const filtered = baseList.filter((r) =>
        tab === "All" || tab === "Archived" ? true : r.status === tab,
    );

    const counts = {
        New: store.items.filter((r) => r.status === "New").length,
        Quoted: store.items.filter((r) => r.status === "Quoted").length,
        Awarded: store.items.filter((r) => r.status === "Awarded").length,
    };

    const openQuote = (r: RfqRow) => {
        setQuoteDraft({
            total: r.myQuote?.total ?? r.estTotal,
            leadTimeDays: r.myQuote?.leadTimeDays ?? 7,
            validUntil: r.myQuote?.validUntil ?? new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
            notes: "",
        });
        setQuoteFor(r);
    };

    const closeQuote = () => setQuoteFor(null);

    const submitQuote = () => {
        if (!quoteFor) return;
        store.update(quoteFor.id, {
            status: "Quoted",
            myQuote: {
                total: quoteDraft.total,
                leadTimeDays: quoteDraft.leadTimeDays,
                validUntil: quoteDraft.validUntil,
                submittedAt: new Date().toISOString().slice(0, 10),
                rank: quoteFor.myQuote?.rank,
            },
        });
        closeQuote();
    };

    const archiveCurrent = () => {
        if (quoteFor) {
            store.archive(quoteFor.id);
            closeQuote();
        }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Incoming opportunities"
                title="RFQ inbox"
                description="Buyers send RFQs to invited vendors. Open one to review specs, chat privately with the buyer, and submit your quote."
            />

            <div className="grid grid-cols-3 gap-3">
                <SummaryCard label="New invitations" value={counts.New} icon={<Inbox className="h-4 w-4" />} tone="blue" />
                <SummaryCard label="Quotes submitted" value={counts.Quoted} icon={<MessageCircle className="h-4 w-4" />} />
                <SummaryCard label="Awarded YTD" value={counts.Awarded} icon={<Trophy className="h-4 w-4" />} tone="green" />
            </div>

            <div className="flex flex-wrap gap-1 border-b border-border">
                {TABS.map((t) => (
                    <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={cn(
                            "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest transition-colors",
                            tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {t}
                        {t === "Archived" && store.archived.length > 0 && (
                            <span className="ml-1.5 rounded-full bg-muted px-1.5 text-[9px]">{store.archived.length}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-card">
                <table className="w-full text-sm">
                    <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">RFQ #</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Lines</th>
                            <th className="px-4 py-3">Closes</th>
                            <th className="px-4 py-3">Competition</th>
                            <th className="px-4 py-3">Your quote</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filtered.map((r) => (
                            <tr key={r.id} className="hover:bg-muted/40">
                                <td className="px-4 py-3">
                                    <Link
                                        to="/vendor/rfqs/$rfqId"
                                        params={{ rfqId: r.id }}
                                        className="flex items-center gap-2 font-mono text-xs font-semibold underline-offset-4 hover:underline"
                                    >
                                        {r.rfqNumber}
                                        {r.unread > 0 && (
                                            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9px] font-bold text-background">
                                                {r.unread}
                                            </span>
                                        )}
                                    </Link>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">
                                            {r.buyerInitials}
                                        </span>
                                        <span className="text-sm font-medium">{r.buyerName}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="font-medium">{r.title}</div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.category}</div>
                                </td>
                                <td className="px-4 py-3 font-mono text-xs">{r.lines.length}</td>
                                <td className="px-4 py-3 text-muted-foreground">{r.closesAt}</td>
                                <td className="px-4 py-3">
                                    <span className="font-mono text-xs">{r.competingVendors} vendors</span>
                                </td>
                                <td className="px-4 py-3">
                                    {r.myQuote ? (
                                        <div>
                                            <div className="font-mono text-sm font-bold">{formatCurrency(r.myQuote.total)}</div>
                                            {r.myQuote.rank && (
                                                <div className={cn("font-mono text-[10px]", r.myQuote.rank === 1 ? "text-emerald-700" : "text-muted-foreground")}>
                                                    Rank #{r.myQuote.rank}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">— pending —</span>
                                    )}
                                </td>
                                <td className="px-4 py-3"><AutoStatus status={r.archived ? "Archived" : r.status} /></td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-1">
                                        {r.archived ? (
                                            <button
                                                onClick={() => store.restore(r.id)}
                                                className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                            >
                                                <RotateCcw className="h-3 w-3" /> Restore
                                            </button>
                                        ) : (
                                            <>
                                                {canRespond && r.status !== "Awarded" && r.status !== "Lost" && (
                                                    <button
                                                        onClick={() => openQuote(r)}
                                                        className="inline-flex h-7 items-center gap-1 rounded-sm bg-foreground px-2 text-[10px] font-semibold text-background hover:opacity-85"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        {r.myQuote ? "Edit quote" : "Quote"}
                                                    </button>
                                                )}
                                                {canRespond && r.status === "New" && (
                                                    <button
                                                        onClick={() => store.update(r.id, { status: "Declined" })}
                                                        className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground"
                                                    >
                                                        Decline
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => store.archive(r.id)}
                                                    className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100"
                                                    title="Archive"
                                                >
                                                    <Archive className="h-3 w-3" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    <X className="mx-auto mb-2 h-5 w-5 opacity-40" />
                                    No RFQs in this state.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CrudDrawer
                open={quoteFor !== null}
                mode="edit"
                title={quoteFor ? `Quote for ${quoteFor.rfqNumber}` : "Quote"}
                description={quoteFor?.title}
                onClose={closeQuote}
                onSave={submitQuote}
                onArchive={archiveCurrent}
                saveLabel={quoteFor?.myQuote ? "Update quote" : "Submit quote"}
                canSave={quoteDraft.total > 0}
            >
                {quoteFor && (
                    <>
                        <div className="rounded-sm border border-border bg-muted/40 p-3">
                            <div className="t-label">Buyer specs</div>
                            <ul className="mt-2 space-y-1 text-xs">
                                {quoteFor.lines.map((l, idx) => (
                                    <li key={idx} className="flex justify-between gap-2">
                                        <span className="truncate">
                                            {l.sku && <span className="font-mono text-muted-foreground">{l.sku}</span>} {l.description}
                                        </span>
                                        <span className="font-mono text-muted-foreground">
                                            {l.qty} {l.uom}
                                            {l.targetPrice ? ` · target ${formatCurrency(l.targetPrice)}` : ""}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Total quoted (USD)">
                                <NumberInput step="0.01" value={quoteDraft.total} placeholder="0.00" onChange={(val) => setQuoteDraft({ ...quoteDraft, total: val })} />
                            </Field>
                            <Field label="Lead time (days)">
                                <NumberInput value={quoteDraft.leadTimeDays} placeholder="0" onChange={(val) => setQuoteDraft({ ...quoteDraft, leadTimeDays: val })} />
                            </Field>
                        </div>
                        <Field label="Valid until">
                            <input type="date" className={inputCls} value={quoteDraft.validUntil}
                                onChange={(e) => setQuoteDraft({ ...quoteDraft, validUntil: e.target.value })} />
                        </Field>
                        <Field label="Notes to buyer">
                            <textarea className={textareaCls} value={quoteDraft.notes}
                                onChange={(e) => setQuoteDraft({ ...quoteDraft, notes: e.target.value })}
                                placeholder="Inclusions, exclusions, payment terms…" />
                        </Field>
                    </>
                )}
            </CrudDrawer>
        </div>
    );
}

function SummaryCard({ label, value, icon, tone = "default" }: { label: string; value: number; icon: React.ReactNode; tone?: "default" | "blue" | "green" }) {
    return (
        <div className={cn(
            "rounded-md border border-border bg-card p-4",
            tone === "blue" && "border-sky-200 bg-sky-50/50",
            tone === "green" && "border-emerald-200 bg-emerald-50/50",
        )}>
            <div className="t-label flex items-center gap-2">{icon} {label}</div>
            <div className="mt-2 font-display text-3xl font-extrabold">{value}</div>
        </div>
    );
}
