/* eslint-disable prettier/prettier */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { useVendor } from "@/lib/vendor-context";
import { ArrowLeft, Send, Calendar, Clock, FileText, ShieldCheck, Trophy, Loader2 } from "lucide-react";
import { NumberInput, Field } from "@/components/CrudDrawer";
import { cn } from "@/lib/utils";
import { rfqsApi, type RfqDetailDto, type RfqMessageDto } from "@/lib/api";
import { formatCurrency } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/rfqs/$rfqId")({
    loader: async ({ params }) => {
        try {
            return await rfqsApi.getDetail(params.rfqId);
        } catch {
            throw notFound();
        }
    },
    component: () => (
        <PermissionGate permission="rfq:view">
            <RFQDetail />
        </PermissionGate>
    ),
    notFoundComponent: () => (
        <div className="mx-auto max-w-3xl p-12 text-center">
            <p className="t-label">RFQ not found</p>
            <Link to="/vendor/rfqs" className="mt-4 inline-block underline">Back to RFQ inbox</Link>
        </div>
    ),
});

function RFQDetail() {
    const detail = Route.useLoaderData() as RfqDetailDto;
    const { rfq, lines, invitations, quotes } = detail;
    const { hasPermission, vendor } = useVendor();
    const canRespond = hasPermission("rfq:respond");

    // Resolve this vendor's own invitation & quote from the detail
    const myInvitation = invitations[0];          // vendor only sees their own invitation
    const myQuote      = quotes[0] ?? null;       // vendor only sees their own quote

    // ── Quote builder ────────────────────────────────────────────────────────
    const [lineQuotes, setLineQuotes] = React.useState(() =>
        lines.map((l) => ({ unitPrice: l.targetPrice ?? 0, qty: l.qty })),
    );
    const [leadTime, setLeadTime]   = React.useState(7);
    const [validity, setValidity]   = React.useState(30);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const total = lineQuotes.reduce((s, l) => s + l.unitPrice * l.qty, 0);

    const submitQuote = async () => {
        if (!canRespond || total <= 0) return;
        setIsSubmitting(true);
        try {
            await rfqsApi.respond(rfq.id, { totalAmount: total, remarks: "" });
            alert("Quotation submitted successfully!");
        } catch (err) {
            alert("Failed to submit quotation: " + err);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Messaging ────────────────────────────────────────────────────────────
    const [thread, setThread]       = React.useState<RfqMessageDto[]>([]);
    const [msgLoading, setMsgLoading] = React.useState(true);
    const [msgError, setMsgError]   = React.useState<string | null>(null);
    const [draft, setDraft]         = React.useState("");
    const [sending, setSending]     = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);

    const appendMessage = React.useCallback((message: RfqMessageDto) => {
        setThread((current) =>
            current.some((m) => m.messageId === message.messageId) ? current : [...current, message],
        );
    }, []);

    const loadMessages = React.useCallback(async (silent = false) => {
        try {
            // Vendor side — backend derives tenantId from session, so we pass 0 and the backend ignores it
            const msgs = await rfqsApi.getMessages(rfq.id);
            setThread(msgs);
            setMsgError(null);
        } catch (err) {
            console.error("Failed to load messages:", err);
            if (!silent) setMsgError(err instanceof Error ? err.message : "Could not load messages.");
        } finally {
            if (!silent) setMsgLoading(false);
        }
    }, [rfq.id]);

    React.useEffect(() => { loadMessages(); }, [loadMessages]);

    React.useEffect(() => {
        return rfqsApi.streamMessages(rfq.id, undefined, appendMessage);
    }, [appendMessage, rfq.id]);

    // Auto-scroll to bottom when new messages arrive
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [thread]);

    const sendMessage = async () => {
        if (!draft.trim() || !canRespond) return;
        setSending(true);
        const optimistic: RfqMessageDto = {
            messageId: `tmp-${Date.now()}`,
            senderType: "vendor",
            body: draft.trim(),
            sentAt: new Date().toLocaleTimeString(),
        };
        setThread((t) => [...t, optimistic]);
        setDraft("");
        try {
            const saved = await rfqsApi.sendMessage(rfq.id, { vendorTenantId: 0, body: optimistic.body });
            setThread((current) => {
                const withoutOptimistic = current.filter((m) => m.messageId !== optimistic.messageId);
                return withoutOptimistic.some((m) => m.messageId === saved.messageId)
                    ? withoutOptimistic
                    : [...withoutOptimistic, saved];
            });
        } catch (err) {
            console.error("Failed to send message:", err);
            // Roll back optimistic message
            setThread((t) => t.filter((m) => m.messageId !== optimistic.messageId));
            setDraft(optimistic.body);
            alert("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const isLocked = rfq.status === "Awarded" || rfq.status === "Cancelled";
    const buyerName = myInvitation?.vendorName ? rfq.title : (rfq.category || "Buyer");
    // We show buyer name from the rfq (notes field carries buyer info from vendor inbox but not here)
    // Fall back gracefully
    const buyerInitials = rfq.rfqNumber?.slice(0, 2).toUpperCase() ?? "B";

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <Link to="/vendor/rfqs" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> RFQ inbox
            </Link>

            <PageHeader
                eyebrow={`${rfq.category} · ${rfq.rfqNumber}`}
                title={rfq.title}
                description={`Closes ${rfq.closesAt}`}
                actions={<AutoStatus status={rfq.status} />}
            />

            {/* Meta strip */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Meta icon={<Calendar className="h-3 w-3" />} label="Closes" value={rfq.closesAt} />
                <Meta icon={<FileText className="h-3 w-3" />} label="Lines" value={`${lines.length}`} />
                <Meta icon={<ShieldCheck className="h-3 w-3" />} label="Competitors" value={`${rfq.invitedVendors} vendors`} />
                <Meta icon={<Clock className="h-3 w-3" />} label="My status" value={myInvitation?.vendorStatus ?? "—"} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
                {/* LEFT — line items + quote builder */}
                <div className="flex flex-col gap-6">
                    <section className="overflow-hidden rounded-md border border-border bg-card">
                        <div className="border-b border-border bg-muted px-5 py-3 t-label">Requested items</div>
                        <table className="w-full text-sm">
                            <thead className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-2">SKU</th>
                                    <th className="px-4 py-2">Description</th>
                                    <th className="px-4 py-2 text-right">Qty</th>
                                    <th className="px-4 py-2">UoM</th>
                                    <th className="px-4 py-2 text-right">Target</th>
                                    <th className="px-4 py-2 text-right">Your unit price</th>
                                    <th className="px-4 py-2 text-right">Line total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {lines.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                            No line items on this RFQ.
                                        </td>
                                    </tr>
                                ) : lines.map((line, i) => {
                                    const lq = lineQuotes[i];
                                    return (
                                        <tr key={line.id}>
                                            <td className="px-4 py-3 font-mono text-xs">{line.sku || "—"}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-medium">{line.description}</div>
                                                {line.notes && <div className="mt-0.5 text-[11px] text-muted-foreground">{line.notes}</div>}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono">{line.qty}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{line.uom}</td>
                                            <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                                                {line.targetPrice ? formatCurrency(line.targetPrice) : "—"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <NumberInput
                                                    value={lq.unitPrice}
                                                    disabled={!canRespond || isLocked}
                                                    onChange={(val) => setLineQuotes((arr) => arr.map((it, idx) => idx === i ? { ...it, unitPrice: val } : it))}
                                                    className="h-8 w-24 rounded-sm border border-border bg-background px-2 text-right font-mono text-xs outline-none focus:border-foreground disabled:opacity-60"
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                                                {formatCurrency(lq.unitPrice * lq.qty)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot>
                                <tr className="bg-muted">
                                    <td colSpan={6} className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest">Quote total</td>
                                    <td className="px-4 py-3 text-right font-display text-lg font-extrabold">{formatCurrency(total)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </section>

                    {/* Quote terms + submit */}
                    <section className="rounded-md border border-border bg-card p-5">
                        <div className="t-label mb-3">Quote terms</div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Field label="Lead time (days)">
                                <NumberInput value={leadTime} disabled={!canRespond || isLocked} onChange={setLeadTime}
                                    className="h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60" />
                            </Field>
                            <Field label="Quote valid (days)">
                                <NumberInput value={validity} disabled={!canRespond || isLocked} onChange={setValidity}
                                    className="h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60" />
                            </Field>
                            <Field label="Payment terms">
                                <select disabled={!canRespond || isLocked} className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground disabled:opacity-60" defaultValue="Net30">
                                    <option>COD</option>
                                    <option>Net15</option>
                                    <option>Net30</option>
                                    <option>Net45</option>
                                </select>
                            </Field>
                        </div>

                        <div className="mt-4 flex flex-col items-end gap-2">
                            {myQuote && (
                                <div className="t-label flex items-center gap-2">
                                    <Trophy className="h-3 w-3" /> Last submitted {myQuote.submittedAt}
                                    {myQuote.rank && <span>· Currently rank #{myQuote.rank}</span>}
                                </div>
                            )}
                            <button
                                onClick={submitQuote}
                                disabled={!canRespond || isLocked || total <= 0 || isSubmitting}
                                className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-5 text-sm font-semibold text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {myQuote ? "Update quotation" : "Submit quotation"} · {formatCurrency(total)}
                            </button>
                            {!canRespond && <p className="text-[11px] text-muted-foreground">Your role can view RFQs but cannot submit quotes.</p>}
                        </div>
                    </section>
                </div>

                {/* RIGHT — private chat with buyer */}
                <aside className="flex flex-col overflow-hidden rounded-md border border-border bg-card" style={{ height: "calc(100vh - 240px)", minHeight: 500 }}>
                    <div className="border-b border-border bg-muted px-4 py-3">
                        <div className="t-label">Private discussion</div>
                        <div className="mt-1 flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">
                                {buyerInitials}
                            </span>
                            <div>
                                <div className="text-sm font-semibold">Buyer</div>
                                <div className="text-[10px] text-muted-foreground">Only you and this buyer can see this thread</div>
                            </div>
                        </div>
                    </div>

                    <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                        {msgLoading ? (
                            <div className="flex justify-center pt-8">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : msgError ? (
                            <div className="flex flex-col items-center gap-2 pt-8 text-center">
                                <span className="rounded-sm bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-[11px]">
                                    ⚠ {msgError}
                                </span>
                                <button onClick={() => loadMessages()} className="text-xs underline text-muted-foreground hover:no-underline">Retry</button>
                            </div>
                        ) : thread.length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground pt-6">No messages yet. Ask the buyer a question below.</p>
                        ) : thread.map((m) => (
                            <div key={m.messageId} className={cn("flex", m.senderType === "vendor" ? "justify-end" : "justify-start")}>
                                <div className={cn("max-w-[85%] rounded-md px-3 py-2 text-sm", m.senderType === "vendor" ? "bg-foreground text-background" : "bg-muted")}>
                                    <div>{m.body}</div>
                                    <div className={cn("mt-1 text-[10px]", m.senderType === "vendor" ? "opacity-60" : "text-muted-foreground")}>{m.sentAt}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 border-t border-border p-3">
                        <input
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                            disabled={!canRespond || sending}
                            className="h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground disabled:opacity-60"
                            placeholder="Ask the buyer for clarification…"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!canRespond || !draft.trim() || sending}
                            className="inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50"
                        >
                            {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                            Send
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function Meta({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-md border border-border bg-card p-3">
            <div className="t-label flex items-center gap-2">{icon} {label}</div>
            <div className="mt-1 font-mono text-sm font-semibold">{value}</div>
        </div>
    );
}
