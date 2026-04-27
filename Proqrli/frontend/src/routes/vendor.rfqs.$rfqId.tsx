import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { INCOMING_RFQS, formatCurrency, type IncomingRFQ } from "@/lib/mock-data";
import { useVendor } from "@/lib/vendor-context";
import { ArrowLeft, Send, Calendar, Clock, FileText, ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor/rfqs/$rfqId")({
  loader: ({ params }) => {
    const rfq = INCOMING_RFQS.find((r) => r.id === params.rfqId);
    if (!rfq) throw notFound();
    return rfq;
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
  const rfq = Route.useLoaderData() as IncomingRFQ;
  const { hasPermission } = useVendor();
  const canRespond = hasPermission("rfq:respond");

  // Local UI state for quote builder & chat
  const [lineQuotes, setLineQuotes] = React.useState(() =>
    rfq.lines.map((l) => ({ unitPrice: l.targetPrice ?? 0, qty: l.qty })),
  );
  const [leadTime, setLeadTime] = React.useState(rfq.myQuote?.leadTimeDays ?? 7);
  const [validity, setValidity] = React.useState(30);

  const total = lineQuotes.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  const [draft, setDraft] = React.useState("");
  const [thread, setThread] = React.useState(rfq.thread);

  const sendMessage = () => {
    if (!draft.trim()) return;
    setThread((t) => [...t, { from: "vendor", text: draft, at: "Now" }]);
    setDraft("");
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <Link to="/vendor/rfqs" className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> RFQ inbox
      </Link>

      <PageHeader
        eyebrow={`From ${rfq.buyerName}`}
        title={rfq.title}
        description={`RFQ ${rfq.rfqNumber} · ${rfq.category}`}
        actions={<AutoStatus status={rfq.status} />}
      />

      {/* Meta strip */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Meta icon={<Calendar className="h-3 w-3" />} label="Received" value={rfq.receivedAt} />
        <Meta icon={<Clock className="h-3 w-3" />} label="Closes" value={rfq.closesAt} />
        <Meta icon={<FileText className="h-3 w-3" />} label="Lines" value={`${rfq.lines.length}`} />
        <Meta icon={<ShieldCheck className="h-3 w-3" />} label="Competitors" value={`${rfq.competingVendors} vendors`} />
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
                {rfq.lines.map((line, i) => {
                  const lq = lineQuotes[i];
                  return (
                    <tr key={i}>
                      <td className="px-4 py-3 font-mono text-xs">{line.sku ?? "—"}</td>
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
                        <input
                          type="number"
                          value={lq.unitPrice}
                          disabled={!canRespond || rfq.status === "Awarded" || rfq.status === "Lost"}
                          onChange={(e) => setLineQuotes((arr) => arr.map((it, idx) => idx === i ? { ...it, unitPrice: Number(e.target.value) } : it))}
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
                <input type="number" value={leadTime} disabled={!canRespond} onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60" />
              </Field>
              <Field label="Quote valid (days)">
                <input type="number" value={validity} disabled={!canRespond} onChange={(e) => setValidity(Number(e.target.value))}
                  className="h-10 w-full rounded-sm border border-border bg-background px-3 font-mono text-sm outline-none focus:border-foreground disabled:opacity-60" />
              </Field>
              <Field label="Payment terms">
                <select disabled={!canRespond} className="h-10 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground disabled:opacity-60" defaultValue="Net30">
                  <option>COD</option>
                  <option>Net15</option>
                  <option>Net30</option>
                  <option>Net45</option>
                </select>
              </Field>
            </div>

            <div className="mt-4 flex flex-col items-end gap-2">
              {rfq.myQuote && (
                <div className="t-label flex items-center gap-2">
                  <Trophy className="h-3 w-3" /> Last submitted {rfq.myQuote.submittedAt}
                  {rfq.myQuote.rank && <span>· Currently rank #{rfq.myQuote.rank}</span>}
                </div>
              )}
              <button
                disabled={!canRespond || rfq.status === "Awarded" || rfq.status === "Lost"}
                className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-5 text-sm font-semibold text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {rfq.myQuote ? "Update quotation" : "Submit quotation"} · {formatCurrency(total)}
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
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">{rfq.buyerInitials}</span>
              <div>
                <div className="text-sm font-semibold">{rfq.buyerName}</div>
                <div className="text-[10px] text-muted-foreground">Only you and this buyer can see this thread</div>
              </div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {thread.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "vendor" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-md px-3 py-2 text-sm", m.from === "vendor" ? "bg-foreground text-background" : "bg-muted")}>
                  <div>{m.text}</div>
                  <div className={cn("mt-1 text-[10px]", m.from === "vendor" ? "opacity-60" : "text-muted-foreground")}>{m.at}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={!canRespond}
              className="h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground disabled:opacity-60"
              placeholder="Ask the buyer for clarification…"
            />
            <button onClick={sendMessage} disabled={!canRespond} className="inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50">
              <Send className="h-3 w-3" /> Send
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="t-label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
