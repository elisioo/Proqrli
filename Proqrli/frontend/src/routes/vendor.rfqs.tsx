/* eslint-disable prettier/prettier */
import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, textareaCls, NumberInput } from "@/components/CrudDrawer";
import { formatCurrency } from "@/lib/mock-data";
import { useVendor } from "@/lib/vendor-context";
import { cn } from "@/lib/utils";
import { Inbox, MessageCircle, Trophy, X, Pencil, Loader2, Send, ArrowLeft } from "lucide-react";
import { rfqsApi, type VendorInboxRfqDto, type RfqMessageDto } from "@/lib/api";

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

// ── Messaging panel ──────────────────────────────────────────────────────────

type MessagePanelProps = {
    rfq: VendorInboxRfqDto;
    canRespond: boolean;
    onClose: () => void;
};

function MessagePanel({ rfq, canRespond, onClose }: MessagePanelProps) {
    const [thread, setThread] = React.useState<RfqMessageDto[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [draft, setDraft] = React.useState("");
    const [sending, setSending] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const loadMessages = React.useCallback(async () => {
        try {
            const msgs = await rfqsApi.getMessages(rfq.rfqId);
            setThread(msgs);
        } catch (err) {
            console.error("Failed to load messages:", err);
        } finally {
            setLoading(false);
        }
    }, [rfq.rfqId]);

    React.useEffect(() => { loadMessages(); }, [loadMessages]);

    // Auto-scroll to bottom whenever thread updates
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [thread]);

    const sendMessage = async () => {
        if (!draft.trim() || sending || !canRespond) return;
        setSending(true);
        const optimistic: RfqMessageDto = {
            messageId: `tmp-${Date.now()}`,
            senderType: "vendor",
            body: draft.trim(),
            sentAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setThread((t) => [...t, optimistic]);
        setDraft("");
        try {
            // vendorTenantId = 0 → backend resolves from session on vendor side
            await rfqsApi.sendMessage(rfq.rfqId, { vendorTenantId: 0, body: optimistic.body });
            await loadMessages();
        } catch (err) {
            console.error("Failed to send message:", err);
            setThread((t) => t.filter((m) => m.messageId !== optimistic.messageId));
            setDraft(optimistic.body);
            alert("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const buyerInitials = (rfq.buyerName ?? rfq.rfqNumber ?? "B").slice(0, 2).toUpperCase();

    return (
        // Overlay backdrop
        <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
            {/* Dim backdrop */}
            <div className="absolute inset-0 bg-black/30" />

            {/* Panel — stop click propagation so inner clicks don't close */}
            <aside
                className="relative z-50 flex flex-col border-l border-border bg-card shadow-2xl"
                style={{ width: "min(420px, 100vw)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 border-b border-border bg-muted px-4 py-3">
                    <button
                        onClick={onClose}
                        className="mr-1 rounded-sm p-1 hover:bg-border transition-colors"
                        aria-label="Close"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">
                        {buyerInitials}
                    </span>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold">{rfq.buyerName ?? "Buyer"}</div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            {rfq.rfqNumber} · Private thread
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-sm p-1 hover:bg-border transition-colors"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* RFQ context strip */}
                <div className="border-b border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
                    <span className="font-medium text-foreground">{rfq.title}</span>
                    <span className="mx-2">·</span>Closes {rfq.closesAt}
                    <span className="mx-2">·</span>
                    <AutoStatus status={rfq.rfqStatus} />
                </div>

                {/* Thread */}
                <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center pt-10">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : thread.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 pt-10 text-center text-xs text-muted-foreground">
                            <MessageCircle className="h-8 w-8 opacity-30" />
                            <p>No messages yet.<br />Ask the buyer a question below.</p>
                        </div>
                    ) : (
                        thread.map((m) => (
                            <div
                                key={m.messageId}
                                className={cn("flex", m.senderType === "vendor" ? "justify-end" : "justify-start")}
                            >
                                {/* Buyer avatar on left-side messages */}
                                {m.senderType !== "vendor" && (
                                    <span className="mr-2 mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted-foreground/20 font-mono text-[9px] font-bold">
                                        {buyerInitials}
                                    </span>
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed",
                                        m.senderType === "vendor"
                                            ? "rounded-br-sm bg-foreground text-background"
                                            : "rounded-bl-sm bg-muted",
                                    )}
                                >
                                    <div>{m.body}</div>
                                    <div
                                        className={cn(
                                            "mt-1 text-[10px]",
                                            m.senderType === "vendor" ? "text-right opacity-50" : "text-muted-foreground",
                                        )}
                                    >
                                        {m.sentAt}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Compose */}
                <div className="flex items-center gap-2 border-t border-border p-3">
                    <input
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        disabled={!canRespond || sending}
                        placeholder={
                            canRespond
                                ? "Ask the buyer for clarification… (Enter to send)"
                                : "You don't have permission to send messages."
                        }
                        className="h-10 flex-1 rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground disabled:opacity-50"
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!canRespond || !draft.trim() || sending}
                        className="inline-flex h-10 items-center gap-1.5 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-40"
                    >
                        {sending ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                            <Send className="h-3 w-3" />
                        )}
                        Send
                    </button>
                </div>
            </aside>
        </div>
    );
}

// ── Main inbox page ──────────────────────────────────────────────────────────

function RFQInboxPage() {
    const { hasPermission } = useVendor();
    const router = useRouter();
    const canRespond = hasPermission("rfq:respond");
    const canMessage = hasPermission("messages:send");

    const [items, setItems] = React.useState<VendorInboxRfqDto[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [tab, setTab] = React.useState<(typeof TABS)[number]>("All");

    // Quote drawer state
    const [quoteFor, setQuoteFor] = React.useState<VendorInboxRfqDto | null>(null);
    const [quoteDraft, setQuoteDraft] = React.useState<QuoteDraft>({ total: 0, remarks: "" });
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    // Message panel state
    const [messageFor, setMessageFor] = React.useState<VendorInboxRfqDto | null>(null);

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

    React.useEffect(() => { fetchData(); }, [fetchData]);

    const filtered = items.filter((r) =>
        tab === "All" ? true : r.inviteStatus === tab || r.rfqStatus === tab,
    );

    const counts = {
        New: items.filter((r) => r.inviteStatus === "Pending").length,
        Quoted: items.filter((r) => r.inviteStatus === "Quoted").length,
        Awarded: items.filter((r) => r.rfqStatus === "Awarded" && r.myQuote?.status === "Awarded").length,
    };

    const openQuote = (r: VendorInboxRfqDto) => {
        setQuoteDraft({ total: r.myQuote?.totalAmount ?? 0, remarks: r.myQuote?.remarks ?? "" });
        setQuoteFor(r);
    };

    const submitQuote = async () => {
        if (!quoteFor) return;
        setIsSubmitting(true);
        try {
            await rfqsApi.respond(quoteFor.rfqId, {
                totalAmount: quoteDraft.total,
                remarks: quoteDraft.remarks,
            });
            await fetchData();
            setQuoteFor(null);
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
                            tab === t
                                ? "border-foreground text-foreground"
                                : "border-transparent text-muted-foreground hover:text-foreground",
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
                            {/* Actions column — wider to fit both buttons */}
                            <th className="px-4 py-3 text-right">Actions</th>
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
                            filtered.map((r) => {
                                const isLocked = r.rfqStatus === "Awarded" || r.rfqStatus === "Cancelled";
                                const isDeclined = r.inviteStatus === "Declined";
                                const hasUnread = false; // extend with real unread count if API supports it

                                return (
                                    <tr key={r.rfqId} className="hover:bg-muted/40">
                                        <td className="px-4 py-3">
                                            <div className="font-mono text-xs font-semibold">{r.rfqNumber}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{r.buyerName}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{r.title}</div>
                                            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                                {r.category}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{r.closesAt}</td>
                                        <td className="px-4 py-3">
                                            {r.myQuote ? (
                                                <div className="font-mono text-sm font-bold">
                                                    {formatCurrency(r.myQuote.totalAmount)}
                                                </div>
                                            ) : (
                                                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                                    — pending —
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3"><AutoStatus status={r.rfqStatus} /></td>
                                        <td className="px-4 py-3"><AutoStatus status={r.inviteStatus} /></td>

                                        {/* Actions */}
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* Message button — always visible when not declined */}
                                                {!isDeclined && (
                                                    <button
                                                        onClick={() => setMessageFor(r)}
                                                        title="Chat with buyer"
                                                        className={cn(
                                                            "relative inline-flex h-7 items-center gap-1 rounded-sm border px-2 text-[10px] font-semibold transition-colors",
                                                            messageFor?.rfqId === r.rfqId
                                                                ? "border-foreground bg-foreground text-background"
                                                                : "border-border bg-background text-foreground hover:bg-muted",
                                                        )}
                                                    >
                                                        <MessageCircle className="h-3 w-3" />
                                                        Chat
                                                        {/* Unread dot — wire up when API returns unread count */}
                                                        {hasUnread && (
                                                            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-sky-500" />
                                                        )}
                                                    </button>
                                                )}

                                                {/* Quote button */}
                                                {canRespond && !isLocked && !isDeclined && (
                                                    <button
                                                        onClick={() => openQuote(r)}
                                                        className="inline-flex h-7 items-center gap-1 rounded-sm bg-foreground px-2 text-[10px] font-semibold text-background hover:opacity-85"
                                                    >
                                                        <Pencil className="h-3 w-3" />
                                                        {r.myQuote ? "Edit" : "Quote"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Quote drawer ───────────────────────────────────────────── */}
            <CrudDrawer
                open={quoteFor !== null}
                mode="edit"
                title={quoteFor ? `Quote for ${quoteFor.rfqNumber}` : "Quote"}
                description={quoteFor?.title}
                onClose={() => setQuoteFor(null)}
                onSave={submitQuote}
                saveLabel={isSubmitting ? "Submitting..." : quoteFor?.myQuote ? "Update quote" : "Submit quote"}
                canSave={quoteDraft.total > 0 && !isSubmitting}
            >
                {quoteFor && (
                    <>
                        <div className="mb-4 rounded-sm border border-border bg-muted/40 p-3 text-xs">
                            <div className="mb-1 font-semibold">Notes from buyer:</div>
                            <div className="whitespace-pre-wrap text-muted-foreground">
                                {quoteFor.notes || "No additional notes provided."}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <Field label="Total quoted (USD)">
                                <NumberInput
                                    step="0.01"
                                    value={quoteDraft.total}
                                    placeholder="0.00"
                                    onChange={(val) => setQuoteDraft({ ...quoteDraft, total: val })}
                                />
                            </Field>
                            <Field label="Remarks to buyer">
                                <textarea
                                    className={textareaCls}
                                    value={quoteDraft.remarks}
                                    onChange={(e) => setQuoteDraft({ ...quoteDraft, remarks: e.target.value })}
                                    placeholder="Inclusions, exclusions, payment terms…"
                                />
                            </Field>
                        </div>
                    </>
                )}
            </CrudDrawer>

            {/* ── Messaging panel (slide-in overlay) ────────────────────── */}
            {messageFor && (
                <MessagePanel
                    rfq={messageFor}
                    canRespond={canRespond || canMessage}
                    onClose={() => setMessageFor(null)}
                />
            )}
        </div>
    );
}

// ── Supporting components ────────────────────────────────────────────────────

function SummaryCard({
    label,
    value,
    icon,
    tone = "default",
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    tone?: "default" | "blue" | "green";
}) {
    return (
        <div
            className={cn(
                "rounded-md border border-border bg-card p-4",
                tone === "blue" && "border-sky-200 bg-sky-50/50",
                tone === "green" && "border-emerald-200 bg-emerald-50/50",
            )}
        >
            <div className="t-label flex items-center gap-2">
                {icon} {label}
            </div>
            <div className="mt-2 font-display text-3xl font-extrabold">{value}</div>
        </div>
    );
}