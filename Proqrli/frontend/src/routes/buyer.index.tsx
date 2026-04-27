import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import {
  ArrowUpRight,
  Wallet,
  ClipboardList,
  FileText,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  BUYER_PURCHASE_ORDERS,
  BUYER_VENDORS,
  INVENTORY,
  REQUISITIONS,
  RISK_ALERTS,
  SPEND_BY_CATEGORY,
  SPEND_SERIES,
  VENDOR_BILLS,
  formatBuyerCurrency,
  getStockState,
} from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/buyer/")({
  component: () => (
    <BuyerPermissionGate permission="dashboard:view">
      <BuyerDashboard />
    </BuyerPermissionGate>
  ),
});

function BuyerDashboard() {
  const { user, tenant } = useBuyer();
  const openPRs = REQUISITIONS.filter((r) => r.status === "Pending Approval").length;
  const openPOs = BUYER_PURCHASE_ORDERS.filter((p) => !["Closed", "Cancelled", "Received"].includes(p.status)).length;
  const billsDue = VENDOR_BILLS.filter((b) => ["Pending", "Approved", "Scheduled", "Overdue"].includes(b.status))
    .reduce((s, b) => s + b.amount, 0);
  const openRisks = RISK_ALERTS.filter((r) => r.level !== "Low").length;
  const highRiskVendors = BUYER_VENDORS.filter((v) => v.riskClass === "High" && v.status !== "Blocked");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow={`Welcome back, ${user.name.split(" ")[0]}`}
        title={tenant.companyName}
        description="A daily snapshot of requisitions, vendors, and cash. Drill in for detail."
        actions={
          <Link to="/buyer/marketplace" className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
            Browse marketplace <ArrowUpRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Open requisitions" value={openPRs} icon={ClipboardList} delta="+1 vs last week" tone="default" />
        <StatCard label="Active POs" value={openPOs} icon={FileText} delta="3 awaiting GRN" />
        <StatCard label="Bills due" value={formatBuyerCurrency(billsDue)} icon={Wallet} delta="2 within 7 days" tone="ink" />
        <StatCard label="Risk alerts" value={openRisks} icon={ShieldAlert} delta="1 high · 2 medium" tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-end justify-between">
            <div>
              <div className="t-label">Spend trend · last 6 months</div>
              <div className="mt-1 font-display text-2xl font-extrabold">
                {formatBuyerCurrency(SPEND_SERIES.reduce((s, m) => s + m.spend, 0))}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-sm border border-emerald-200 bg-emerald-50 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-emerald-800">
              <TrendingUp className="h-3 w-3" /> +17.6%
            </span>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SPEND_SERIES}>
                <defs>
                  <linearGradient id="sp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-solid)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--accent-solid)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-tone)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--ink-muted)" />
                <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--ink-muted)" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border-tone)", background: "var(--card)" }} formatter={(v: number) => formatBuyerCurrency(v)} />
                <Area dataKey="spend" stroke="var(--accent-solid)" strokeWidth={2} fill="url(#sp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <div className="t-label mb-2">Top categories</div>
          <div className="font-display text-2xl font-extrabold">By spend</div>
          <div className="mt-4 h-[230px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPEND_BY_CATEGORY} layout="vertical" margin={{ left: 8 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }} stroke="var(--ink-muted)" width={88} />
                <Tooltip contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border-tone)", background: "var(--card)" }} formatter={(v: number) => formatBuyerCurrency(v)} />
                <Bar dataKey="spend" fill="var(--accent-solid)" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="t-label">Pending requisitions</span>
            <Link to="/buyer/requisitions" className="text-xs font-semibold underline-offset-4 hover:underline">View all →</Link>
          </div>
          <ul className="divide-y divide-border">
            {REQUISITIONS.filter((r) => r.status === "Pending Approval" || r.status === "Approved").slice(0, 4).map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{r.title}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{r.prNumber} · {r.requestedBy}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold">{formatBuyerCurrency(r.amount)}</span>
                  <AutoStatus status={r.status} />
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="t-label">Risk alerts</span>
            <Link to="/buyer/risk" className="text-xs font-semibold underline-offset-4 hover:underline">Open monitor →</Link>
          </div>
          <ul className="divide-y divide-border">
            {RISK_ALERTS.slice(0, 4).map((a) => (
              <li key={a.id} className="px-5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{a.vendorName}</span>
                      <AutoStatus status={a.level} />
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{a.signal}</div>
                  </div>
                  <TrendingDown className="h-4 w-4 flex-shrink-0 text-rose-500" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <LowStockSuggestions />

      {highRiskVendors.length > 0 && (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-5">
          <div className="flex items-center gap-2 t-label text-rose-800">
            <ShieldAlert className="h-3 w-3" /> High-risk vendors active in your supply chain
          </div>
          <p className="mt-2 text-sm text-rose-900">
            {highRiskVendors.length} vendor(s) flagged High risk by ML scoring. Review their POs and consider secondary sources.
          </p>
        </div>
      )}
    </div>
  );
}

function LowStockSuggestions() {
  const items = INVENTORY
    .map((i) => ({ ...i, state: getStockState(i) }))
    .filter((i) => i.state !== "In stock")
    .sort((a, b) => a.onHand - b.onHand)
    .slice(0, 4);
  if (items.length === 0) return null;
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50/60 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 t-label text-amber-900">
          <ShieldAlert className="h-3 w-3" /> Low / out of stock — auto-reorder suggestions
        </div>
        <Link to="/buyer/inventory" className="text-xs font-semibold underline-offset-4 hover:underline">Open inventory →</Link>
      </div>
      <ul className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {items.map((i) => (
          <li key={i.id} className="flex items-center justify-between rounded-sm border border-border bg-card px-3 py-2">
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{i.name}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{i.sku} · on hand {i.onHand} {i.uom}</div>
            </div>
            <Link to="/buyer/inventory" className="ml-3 inline-flex h-8 items-center gap-1 rounded-sm bg-foreground px-3 text-[10px] font-semibold uppercase tracking-widest text-background hover:opacity-85">
              Reorder
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
