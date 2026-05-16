import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { ArrowLeft, Send, Award, Calendar, Clock, FileText, Users, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { rfqsApi, type SuggestedVendorDto, type RfqMessageDto } from "@/lib/api";
import { toast } from "sonner";
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

export const Route = createFileRoute("/buyer/rfqs/$rfqId")({
    loader: async ({ params }) => {
        try {
            return await rfqsApi.getDetail(params.rfqId);
        } catch {
            throw notFound();
        }
    },
    component: () => (
        <BuyerPermissionGate permission="rfq:view">
            <BuyerRFQDetail />
        </BuyerPermissionGate>
    ),
    notFoundComponent: () => (
        <div className="mx-auto max-w-3xl p-12 text-center">
            <p className="t-label">RFQ not found</p>
            <Link to="/buyer/rfqs" className="mt-4 inline-block underline">Back to RFQs</Link>
        </div>
    ),
});

function BuyerRFQDetail() {
    const detail = Route.useLoaderData();
    const router = useRouter();
    const { rfq, lines, invitations, quotes } = detail;
    const { hasPermission } = useBuyer();
    const canChat = hasPermission("messages:send");

    const [activeVendorId, setActiveVendorId] = React.useState<string>(invitations[0]?.vendorId ?? "");

    const activeInvite = invitations.find((i: import("@/lib/api").RfqInvitationDto) => i.vendorId === activeVendorId);
    const activeQuote = quotes.find((q: import("@/lib/api").RfqQuoteDto) => q.vendorId === activeVendorId);

    const [draft, setDraft] = React.useState("");
    const [messages, setMessages] = React.useState<RfqMessageDto[]>([]);
    const [msgLoading, setMsgLoading] = React.useState(false);
    const [msgError, setMsgError] = React.useState<string | null>(null);
    const [sending, setSending] = React.useState(false);
    const scrollRef = React.useRef<HTMLDivElement>(null);
    const appendMessage = React.useCallback((message: RfqMessageDto) => {
        setMessages((current) =>
            current.some((m) => m.messageId === message.messageId) ? current : [...current, message],
        );
    }, []);

    // Load thread whenever the active vendor changes
    const loadMessages = React.useCallback(async (silent = false) => {
        if (!activeVendorId) return;
        const vendorTenantId = Number(activeVendorId);
        if (!vendorTenantId) return;
        if (!silent) setMsgLoading(true);
        try {
            const msgs = await rfqsApi.getMessages(rfq.id, vendorTenantId);
            setMessages(msgs);
            setMsgError(null);
        } catch (err) {
            console.error("Failed to load messages:", err);
            // Only show the error on the first (non-silent) load so polling
            // failures don't flash an error after messages were already shown.
            if (!silent) setMsgError(err instanceof Error ? err.message : "Could not load messages.");
        } finally {
            if (!silent) setMsgLoading(false);
        }
    }, [rfq.id, activeVendorId]);

    // Initial load whenever active vendor changes
    React.useEffect(() => { loadMessages(); }, [loadMessages]);

    // Poll every 6 s for new messages — silent so the UI doesn't flicker
    React.useEffect(() => {
        if (!activeVendorId) return;
        const vendorTenantId = Number(activeVendorId);
        if (!vendorTenantId) return;
        return rfqsApi.streamMessages(rfq.id, vendorTenantId, appendMessage);
    }, [activeVendorId, appendMessage, rfq.id]);

    // Auto-scroll to bottom
    React.useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const [inviteModalOpen, setInviteModalOpen] = React.useState(false);
    const [isInviting, setIsInviting] = React.useState(false);
    const [isAwarding, setIsAwarding] = React.useState(false);
    const [confirmState, setConfirmState] = React.useState<{
        title: string;
        desc: string;
        onConfirm: () => void;
    } | null>(null);

    // Suggested vendors state
    const [suggestedVendors, setSuggestedVendors] = React.useState<SuggestedVendorDto[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = React.useState(false);
    
    // Set of selected vendor IDs to invite
    const [selectedVendors, setSelectedVendors] = React.useState<Set<number>>(new Set());

    React.useEffect(() => {
        if (inviteModalOpen) {
            setIsLoadingSuggestions(true);
            rfqsApi.getSuggestedVendors(rfq.id)
                .then(res => setSuggestedVendors(res))
                .catch(console.error)
                .finally(() => setIsLoadingSuggestions(false));
        }
    }, [inviteModalOpen, rfq.id]);

    const send = async () => {
        if (!draft.trim() || sending) return;
        const vendorTenantId = Number(activeVendorId);
        if (!vendorTenantId) return;
        setSending(true);
        const optimistic: RfqMessageDto = {
            messageId: `tmp-${Date.now()}`,
            senderType: "buyer",
            body: draft.trim(),
            sentAt: new Date().toLocaleTimeString(),
        };
        setMessages((m) => [...m, optimistic]);
        setDraft("");
        try {
            const saved = await rfqsApi.sendMessage(rfq.id, { vendorTenantId, body: optimistic.body });
            setMessages((current) => {
                const withoutOptimistic = current.filter((msg) => msg.messageId !== optimistic.messageId);
                return withoutOptimistic.some((msg) => msg.messageId === saved.messageId)
                    ? withoutOptimistic
                    : [...withoutOptimistic, saved];
            });
        } catch (err) {
            console.error("Failed to send message:", err);
            setMessages((m) => m.filter((msg) => msg.messageId !== optimistic.messageId));
            setDraft(optimistic.body);
            alert("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const handleInvite = async () => {
        if (selectedVendors.size === 0) return;
        setIsInviting(true);
        try {
            await rfqsApi.inviteVendors(rfq.id, Array.from(selectedVendors));
            setInviteModalOpen(false);
            setSelectedVendors(new Set());
            router.invalidate(); // Refetch loader to get fresh data!
        } catch (err) {
            console.error(err);
        } finally {
            setIsInviting(false);
        }
    };

    const handleAward = async () => {
        if (!activeQuote) return;

        setConfirmState({
            title: "Award RFQ",
            desc: `Are you sure you want to award this RFQ to ${activeQuote.vendorName} for ${formatBuyerCurrency(activeQuote.total)}? This will generate a Purchase Order.`,
            onConfirm: async () => {
                setIsAwarding(true);
                try {
                    const res = await rfqsApi.awardQuote(rfq.id, activeQuote.id);
                    toast.success(`RFQ awarded! Purchase Order ${res.poNumber} has been generated.`);
                    router.navigate({ to: "/buyer/purchase-orders" }); // Or to the specific PO if we have a detail page
                } catch (err) {
                    console.error(err);
                    toast.error("Failed to award RFQ: " + err);
                } finally {
                    setIsAwarding(false);
                }
            }
        });
    };

    const toggleVendor = (id: number) => {
        const newSet = new Set(selectedVendors);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedVendors(newSet);
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <Link to="/buyer/rfqs" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3 w-3" /> All RFQs
            </Link>

            <PageHeader
                eyebrow={`Sourcing · ${rfq.category}`}
                title={rfq.title}
                description={`${rfq.rfqNumber} · derived from ${rfq.prRef}`}
                actions={<AutoStatus status={rfq.status} />}
            />

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Meta icon={<Calendar className="h-3 w-3" />} label="Created" value="Today" />
                <Meta icon={<Clock className="h-3 w-3" />} label="Closes" value={rfq.closesAt} />
                <Meta icon={<Users className="h-3 w-3" />} label="Invited" value={`${rfq.invitedVendors}`} />
                <Meta icon={<FileText className="h-3 w-3" />} label="Responses" value={`${rfq.responsesReceived} / ${rfq.invitedVendors}`} />
            </div>

            {/* Line items */}
            <section className="overflow-hidden rounded-md border border-border bg-card">
                <div className="border-b border-border bg-muted px-5 py-3 t-label flex items-center justify-between">
                    <span>Requested items</span>
                    <span className="font-mono text-xs">{lines.length} items</span>
                </div>
                <table className="w-full text-sm">
                    <thead className="text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        <tr>
                            <th className="px-4 py-2">SKU</th>
                            <th className="px-4 py-2">Description</th>
                            <th className="px-4 py-2 text-right">Qty</th>
                            <th className="px-4 py-2">UoM</th>
                            <th className="px-4 py-2 text-right">Target unit</th>
                            <th className="px-4 py-2 text-right">Target total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {lines.length > 0 ? lines.map((l: import("@/lib/api").RfqLineDto) => (
                            <tr key={l.id}>
                                <td className="px-4 py-3 font-mono text-xs">{l.sku || "—"}</td>
                                <td className="px-4 py-3">
                                    <div className="font-medium">{l.description}</div>
                                    {l.notes && <div className="mt-0.5 text-[11px] text-muted-foreground">{l.notes}</div>}
                                </td>
                                <td className="px-4 py-3 text-right font-mono">{l.qty}</td>
                                <td className="px-4 py-3 text-muted-foreground">{l.uom}</td>
                                <td className="px-4 py-3 text-right font-mono text-xs">{l.targetPrice ? formatBuyerCurrency(l.targetPrice) : "—"}</td>
                                <td className="px-4 py-3 text-right font-mono text-sm font-bold">
                                    {l.targetPrice ? formatBuyerCurrency(l.targetPrice * l.qty) : "—"}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No items linked from the Purchase Requisition.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </section>

            {/* Invited vendors + chat */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
                <aside className="overflow-hidden rounded-md border border-border bg-card">
                    <div className="border-b border-border bg-muted px-4 py-3 t-label flex items-center justify-between">
                        <span>Invited vendors</span>
                        {rfq.status !== "Cancelled" && rfq.status !== "Awarded" && (
                            <button 
                                onClick={() => setInviteModalOpen(true)}
                                className="text-foreground hover:underline font-semibold"
                            >
                                Manage
                            </button>
                        )}
                    </div>
                    {invitations.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No vendors invited yet.
                        </div>
                    ) : (
                        <ul className="divide-y divide-border">
                            {invitations.map((inv: import("@/lib/api").RfqInvitationDto) => {
                                const q = quotes.find((qq: import("@/lib/api").RfqQuoteDto) => qq.vendorId === inv.vendorId);
                                const isActive = inv.vendorId === activeVendorId;
                                return (
                                    <li key={inv.id}>
                                        <button
                                            onClick={() => setActiveVendorId(inv.vendorId)}
                                            className={cn("w-full px-4 py-3 text-left transition-colors hover:bg-muted/60", isActive && "bg-muted")}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <div className="truncate text-sm font-semibold">{inv.vendorName}</div>
                                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                                        Invited {inv.invitedAt}
                                                    </div>
                                                </div>
                                                <AutoStatus status={inv.vendorStatus} />
                                            </div>
                                            {q && (
                                                <div className="mt-2 flex items-center justify-between">
                                                    <div className="font-mono text-sm font-bold">{formatBuyerCurrency(q.total)}</div>
                                                    <span className={cn(
                                                        "inline-flex h-5 items-center rounded-full px-2 font-mono text-[10px] font-bold",
                                                        q.rank === 1 ? "bg-foreground text-background" : "border border-border",
                                                    )}>
                                                        Rank #{q.rank}
                                                    </span>
                                                </div>
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </aside>

                <section className="flex flex-col overflow-hidden rounded-md border border-border bg-card" style={{ height: "calc(100vh - 240px)", minHeight: 500 }}>
                    {activeInvite ? (
                        <>
                            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                                        {activeInvite.vendorName.split(" ").slice(0, 2).map((w: string) => w[0]).join("")}
                                    </span>
                                    <div>
                                        <div className="font-semibold">{activeInvite.vendorName}</div>
                                        <div className="text-[11px] text-muted-foreground">Private thread · only you and this vendor</div>
                                    </div>
                                </div>
                                {activeQuote && hasPermission("quotations:award") && rfq.status !== "Awarded" && rfq.status !== "Cancelled" && (
                                    <button 
                                        onClick={handleAward}
                                        disabled={isAwarding}
                                        className="inline-flex h-9 items-center gap-1 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50"
                                    >
                                        {isAwarding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Award className="h-3 w-3" />}
                                        Award · {formatBuyerCurrency(activeQuote.total)}
                                    </button>
                                )}
                            </div>
                            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                                {msgLoading ? (
                                    <div className="flex justify-center pt-8">
                                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                                    </div>
                                ) : msgError ? (
                                    <div className="flex flex-col items-center gap-2 pt-8 text-center text-xs text-muted-foreground">
                                        <span className="rounded-sm bg-red-50 border border-red-200 px-3 py-2 text-red-700 text-[11px]">
                                            ⚠ {msgError}
                                        </span>
                                        <button onClick={() => loadMessages()} className="underline hover:no-underline">Retry</button>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <p className="text-center text-xs text-muted-foreground">No messages yet. Start the conversation below.</p>
                                ) : messages.map((m) => (
                                    <div key={m.messageId} className={cn("flex", m.senderType === "buyer" ? "justify-end" : "justify-start")}>
                                        <div className={cn("max-w-[75%] rounded-md px-3 py-2 text-sm", m.senderType === "buyer" ? "bg-foreground text-background" : "bg-muted")}>
                                            <div>{m.body}</div>
                                            <div className={cn("mt-1 text-[10px]", m.senderType === "buyer" ? "opacity-60" : "text-muted-foreground")}>{m.sentAt}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 border-t border-border p-3">
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                                    disabled={!canChat || sending}
                                    className="h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground disabled:opacity-60"
                                    placeholder={`Ask ${activeInvite.vendorName.split(" ")[0]} a clarification…`}
                                />
                                <button onClick={send} disabled={!canChat || !draft.trim() || sending} className="inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-50">
                                    {sending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />} Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select a vendor to start a discussion.</div>
                    )}
                </section>
            </div>

            {/* Invite Modal */}
            {inviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-md border border-border bg-card p-6 shadow-xl flex flex-col max-h-[85vh]">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold">Invite Vendors</h2>
                            <button onClick={() => setInviteModalOpen(false)} className="rounded-sm p-1 hover:bg-muted">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                            Select vendors to invite to this Request for Quotation.
                        </p>

                        <div className="flex-1 overflow-y-auto min-h-0 border rounded-md divide-y divide-border mb-4 bg-muted/20">
                            {isLoadingSuggestions ? (
                                <div className="p-12 flex flex-col items-center justify-center text-sm text-muted-foreground">
                                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                                    Finding matching suppliers...
                                </div>
                            ) : suggestedVendors.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No vendors available.
                                </div>
                            ) : (
                                suggestedVendors.map(vendor => {
                                    const isSelected = selectedVendors.has(vendor.vendorTenantId);

                                    return (
                                        <div key={vendor.vendorTenantId} 
                                            className={cn("flex items-center gap-3 p-3 transition-colors", 
                                                vendor.alreadyInvited ? "opacity-50 bg-muted/50" : 
                                                vendor.isMatch ? "hover:bg-emerald-50/50 cursor-pointer" : "hover:bg-muted/30 cursor-pointer"
                                            )}
                                            onClick={() => !vendor.alreadyInvited && toggleVendor(vendor.vendorTenantId)}
                                        >
                                            <input 
                                                type="checkbox" 
                                                className="h-4 w-4 rounded-sm border-border text-foreground focus:ring-foreground cursor-pointer"
                                                checked={isSelected || vendor.alreadyInvited}
                                                disabled={vendor.alreadyInvited}
                                                readOnly
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-sm truncate flex items-center gap-2">
                                                    {vendor.companyName}
                                                    {vendor.alreadyInvited && <span className="text-[10px] font-mono bg-border px-1.5 py-0.5 rounded-sm">INVITED</span>}
                                                    {vendor.isMatch && !vendor.alreadyInvited && <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-sm">RECOMMENDED</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate">{vendor.industry}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-auto pt-2">
                            <button
                                onClick={() => setInviteModalOpen(false)}
                                className="rounded-sm px-4 py-2 text-sm font-semibold border border-border hover:bg-muted"
                                disabled={isInviting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleInvite}
                                disabled={selectedVendors.size === 0 || isInviting}
                                className="rounded-sm bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isInviting ? <><Loader2 className="h-4 w-4 animate-spin" /> Inviting...</> : `Send Invites (${selectedVendors.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <AlertDialog open={!!confirmState} onOpenChange={(o) => { if (!o) setConfirmState(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{confirmState?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{confirmState?.desc}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { confirmState?.onConfirm(); setConfirmState(null); }}>
                            Confirm
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
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
