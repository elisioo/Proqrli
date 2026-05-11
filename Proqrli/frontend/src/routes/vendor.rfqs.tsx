/* eslint-disable prettier/prettier */
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, textareaCls, NumberInput } from "@/components/CrudDrawer";
import { formatCurrency } from "@/lib/mock-data";
import { useVendor } from "@/lib/vendor-context";
import { cn } from "@/lib/utils";
import { Inbox, MessageCircle, Trophy, X, Pencil, Loader2 } from "lucide-react";
import { rfqsApi, type VendorInboxRfqDto } from "@/lib/api";

export const Route = createFileRoute("/vendor/rfqs")({
    component: () => (
        <PermissionGate permission="rfq:view">
            <RFQInboxPage />
        </PermissionGate>
    ),
});

const TABS = ["All", "Pending", "Quoted", "Awarded", "Lost", "Declined"] as const;

type QuoteDraft = {
    total: number;
    remarks: string;
};

function RFQInboxPage() {
    const { hasPermission } = useVendor();
    const router = useRouter();
    const canRespond = hasPermission("rfq:respond");

    const [items, setItems] = React.useState<VendorInboxRfqDto[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [tab, setTab] = React.useState<(typeof TABS)[number]>("All");

    const [quoteFor, setQuoteFor] = React.useState<VendorInboxRfqDto | null>(null);
    const [quoteDraft, setQuoteDraft] = React.useState<QuoteDraft>({
        total: 0,
        remarks: "",
    });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await rfqsApi.getVendorInbox();
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filtered = items.filter((r) =>
        tab === "All" ? true : r.inviteStatus === tab || r.rfqStatus === tab,
    );

    const counts = {
        New: items.filter((r) => r.inviteStatus === "Pending").length,
        Quoted: items.filter((r) => r.inviteStatus === "Quoted").length,
        Awarded: items.filter((r) => r.rfqStatus === "Awarded" && r.myQuote?.status === "Awarded").length,
    };

    const openQuote = (r: VendorInboxRfqDto) => {
        setQuoteDraft({
            total: r.myQuote?.totalAmount ?? 0,
            remarks: r.myQuote?.remarks ?? "",
        });
        setQuoteFor(r);
    };

    const closeQuote = () => setQuoteFor(null);

    const submitQuote = async () => {
        if (!quoteFor) return;
        setIsSubmitting(true);
        try {
            await rfqsApi.respond(quoteFor.rfqId, {
                totalAmount: quoteDraft.total,
                remarks: quoteDraft.remarks,
            });
            await fetchData();
            closeQuote();
        } catch (err) {
            console.error(err);
            alert("Failed to submit quotation.");
        } finally {
            setIsSubmitting(false);
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
                    </button>
                ))}
            </div>

            <div className="overflow-hidden rounded-md border border-border bg-card min-h-[300px]">
                <table className="w-full text-sm">
                    <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">RFQ #</th>
                            <th className="px-4 py-3">Buyer</th>
                            <th className="px-4 py-3">Title</th>
                            <th className="px-4 py-3">Closes</th>
                            <th className="px-4 py-3">Your quote</th>
                            <th className="px-4 py-3">RFQ Status</th>
                            <th className="px-4 py-3">Invite Status</th>
                            <th className="px-4 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {isLoading ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                                    Loading inbox...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                                    <X className="mx-auto mb-2 h-5 w-5 opacity-40" />
                                    No RFQs found in this view.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((r) => (
                                <tr key={r.rfqId} className="hover:bg-muted/40">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 font-mono text-xs font-semibold">
                                            {r.rfqNumber}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{r.buyerName}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{r.title}</div>
                                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.category}</div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">{r.closesAt}</td>
                                    <td className="px-4 py-3">
                                        {r.myQuote ? (
                                            <div>
                                                <div className="font-mono text-sm font-bold">{formatCurrency(r.myQuote.totalAmount)}</div>
                                            </div>
                                        ) : (
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">— pending —</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3"><AutoStatus status={r.rfqStatus} /></td>
                                    <td className="px-4 py-3"><AutoStatus status={r.inviteStatus} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            {canRespond && r.rfqStatus !== "Awarded" && r.rfqStatus !== "Cancelled" && r.inviteStatus !== "Declined" && (
                                                <button
                                                    onClick={() => openQuote(r)}
                                                    className="inline-flex h-7 items-center gap-1 rounded-sm bg-foreground px-2 text-[10px] font-semibold text-background hover:opacity-85"
                                                >
                                                    <Pencil className="h-3 w-3" />
                                                    {r.myQuote ? "Edit quote" : "Quote"}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
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
                saveLabel={isSubmitting ? "Submitting..." : quoteFor?.myQuote ? "Update quote" : "Submit quote"}
                canSave={quoteDraft.total > 0 && !isSubmitting}
            >
                {quoteFor && (
                    <>
                        <div className="rounded-sm border border-border bg-muted/40 p-3 mb-4 text-xs">
                            <div className="font-semibold mb-1">Notes from buyer:</div>
                            <div className="text-muted-foreground whitespace-pre-wrap">{quoteFor.notes || "No additional notes provided."}</div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                            <Field label="Total quoted (USD)">
                                <NumberInput step="0.01" value={quoteDraft.total} placeholder="0.00" onChange={(val) => setQuoteDraft({ ...quoteDraft, total: val })} />
                            </Field>
                            <Field label="Remarks to buyer">
                                <textarea className={textareaCls} value={quoteDraft.remarks}
                                    onChange={(e) => setQuoteDraft({ ...quoteDraft, remarks: e.target.value })}
                                    placeholder="Inclusions, exclusions, payment terms…" />
                            </Field>
                        </div>
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
