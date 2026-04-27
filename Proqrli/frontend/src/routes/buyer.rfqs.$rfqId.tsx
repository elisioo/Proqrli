/* eslint-disable prettier/prettier */
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import {
    RFQS,
    RFQ_LINES,
    RFQ_INVITATIONS,
    RFQ_THREADS,
    QUOTATIONS,
    formatBuyerCurrency,
    type RFQ,
} from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { ArrowLeft, Send, Award, Calendar, Clock, FileText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/rfqs/$rfqId")({
    loader: ({ params }) => {
        const rfq = RFQS.find((r) => r.id === params.rfqId);
        if (!rfq) throw notFound();
        return rfq;
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
    const rfq = Route.useLoaderData() as RFQ;
    const { hasPermission } = useBuyer();
    const canChat = hasPermission("messages:send");

    const lines = RFQ_LINES.filter((l) => l.rfqRef === rfq.rfqNumber);
    const invitations = RFQ_INVITATIONS.filter((i) => i.rfqRef === rfq.rfqNumber);
    const quotes = QUOTATIONS.filter((q) => q.rfqRef === rfq.rfqNumber);

    const [activeVendorId, setActiveVendorId] = React.useState<string>(invitations[0]?.vendorId);

    const activeThread = RFQ_THREADS.find((t) => t.rfqRef === rfq.rfqNumber && t.vendorId === activeVendorId);
    const activeInvite = invitations.find((i) => i.vendorId === activeVendorId);
    const activeQuote = quotes.find((q) => q.vendorId === activeVendorId);

    const [draft, setDraft] = React.useState("");
    const [messages, setMessages] = React.useState(activeThread?.messages ?? []);

    React.useEffect(() => {
        setMessages(activeThread?.messages ?? []);
    }, [activeVendorId, activeThread]);

    const send = () => {
        if (!draft.trim()) return;
        setMessages((m) => [...m, { from: "buyer", text: draft, at: "Now" }]);
        setDraft("");
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
                <Meta icon={<Calendar className="h-3 w-3" />} label="Created" value={rfq.createdAt} />
                <Meta icon={<Clock className="h-3 w-3" />} label="Closes" value={rfq.closesAt} />
                <Meta icon={<Users className="h-3 w-3" />} label="Invited" value={`${rfq.invitedVendors}`} />
                <Meta icon={<FileText className="h-3 w-3" />} label="Responses" value={`${rfq.responsesReceived} / ${rfq.invitedVendors}`} />
            </div>

            {/* Line items */}
            <section className="overflow-hidden rounded-md border border-border bg-card">
                <div className="border-b border-border bg-muted px-5 py-3 t-label">Requested items</div>
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
                        {lines.map((l) => (
                            <tr key={l.id}>
                                <td className="px-4 py-3 font-mono text-xs">{l.sku ?? "—"}</td>
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
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Invited vendors + chat */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
                <aside className="overflow-hidden rounded-md border border-border bg-card">
                    <div className="border-b border-border bg-muted px-4 py-3 t-label">Invited vendors</div>
                    <ul className="divide-y divide-border">
                        {invitations.map((inv) => {
                            const q = quotes.find((qq) => qq.vendorId === inv.vendorId);
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
                </aside>

                <section className="flex flex-col overflow-hidden rounded-md border border-border bg-card" style={{ height: "calc(100vh - 240px)", minHeight: 500 }}>
                    {activeInvite ? (
                        <>
                            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                                        {activeInvite.vendorName.split(" ").slice(0, 2).map((w) => w[0]).join("")}
                                    </span>
                                    <div>
                                        <div className="font-semibold">{activeInvite.vendorName}</div>
                                        <div className="text-[11px] text-muted-foreground">Private thread · only you and this vendor</div>
                                    </div>
                                </div>
                                {activeQuote && hasPermission("quotations:award") && activeQuote.status !== "Awarded" && (
                                    <button className="inline-flex h-9 items-center gap-1 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85">
                                        <Award className="h-3 w-3" /> Award · {formatBuyerCurrency(activeQuote.total)}
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 space-y-3 overflow-y-auto p-5">
                                {messages.length === 0 && (
                                    <p className="text-center text-xs text-muted-foreground">No messages yet. Start the conversation below.</p>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i} className={cn("flex", m.from === "buyer" ? "justify-end" : "justify-start")}>
                                        <div className={cn("max-w-[75%] rounded-md px-3 py-2 text-sm", m.from === "buyer" ? "bg-foreground text-background" : "bg-muted")}>
                                            <div>{m.text}</div>
                                            <div className={cn("mt-1 text-[10px]", m.from === "buyer" ? "opacity-60" : "text-muted-foreground")}>{m.at}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 border-t border-border p-3">
                                <input
                                    value={draft}
                                    onChange={(e) => setDraft(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && send()}
                                    disabled={!canChat}
                                    className="h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground disabled:opacity-60"
                                    placeholder={`Ask ${activeInvite.vendorName.split(" ")[0]} a clarification…`}
                                />
                                <button onClick={send} disabled={!canChat} className="inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-50">
                                    <Send className="h-3 w-3" /> Send
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">Select a vendor to start a discussion.</div>
                    )}
                </section>
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
