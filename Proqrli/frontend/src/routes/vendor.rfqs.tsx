import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { INCOMING_RFQS, formatCurrency } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Inbox, MessageCircle, Trophy, X } from "lucide-react";

export const Route = createFileRoute("/vendor/rfqs")({
  component: () => (
    <PermissionGate permission="rfq:view">
      <RFQInboxPage />
    </PermissionGate>
  ),
});

const TABS = ["All", "New", "Viewed", "Quoted", "Awarded", "Lost"] as const;

function RFQInboxPage() {
  const [tab, setTab] = React.useState<(typeof TABS)[number]>("All");
  const filtered = INCOMING_RFQS.filter((r) => tab === "All" || r.status === tab);

  const counts = {
    New: INCOMING_RFQS.filter((r) => r.status === "New").length,
    Quoted: INCOMING_RFQS.filter((r) => r.status === "Quoted").length,
    Awarded: INCOMING_RFQS.filter((r) => r.status === "Awarded").length,
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
                <td className="px-4 py-3"><AutoStatus status={r.status} /></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  <X className="mx-auto mb-2 h-5 w-5 opacity-40" />
                  No RFQs in this state.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
