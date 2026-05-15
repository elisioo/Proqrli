import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { useMemo, useState } from "react";
import {
  ShoppingCart,
  Package,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  Truck,
  Star,
  AlertCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import { useVendor } from "@/lib/vendor-context";
import {
  MARKETPLACE_ORDERS,
  REVENUE_SERIES,
  REVIEWS,
  formatCurrency,
} from "@/lib/mock-data";
import { purchaseOrdersApi, billsApi, deliveriesApi, PurchaseOrder, VendorBill, DeliveryRecord } from "@/lib/api";

export const Route = createFileRoute("/vendor/")({
  loader: async () => {
    const [realPOs, realBills, realDeliveries] = await Promise.all([
      purchaseOrdersApi.getAll().catch(() => []),
      billsApi.getAll().catch(() => []),
      deliveriesApi.getAll().catch(() => []),
    ]);
    return {
      realPOs: realPOs as PurchaseOrder[],
      realBills: realBills as VendorBill[],
      realDeliveries: realDeliveries as DeliveryRecord[],
    };
  },
  component: DashboardPage,
});

function DashboardPage() {
  const { user, tenant } = useVendor();
  const rawData = Route.useLoaderData();
  
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  
  const filterByDate = (dateStr?: string | null) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    const endPlusOne = dateRange.end ? new Date(dateRange.end) : null;
    if (endPlusOne) endPlusOne.setDate(endPlusOne.getDate() + 1);

    if (dateRange.start && d < new Date(dateRange.start)) return false;
    if (endPlusOne && d >= endPlusOne) return false;
    return true;
  };

  const realPOs = useMemo(() => rawData.realPOs.filter((x: any) => filterByDate(x.poDate || x.createdAt)), [rawData.realPOs, dateRange]);
  const realBills = useMemo(() => rawData.realBills.filter((x: any) => filterByDate(x.invoiceDate || x.createdAt)), [rawData.realBills, dateRange]);
  const realDeliveries = useMemo(() => rawData.realDeliveries.filter((x: any) => filterByDate(x.expectedDate || x.actualDate || x.createdAt)), [rawData.realDeliveries, dateRange]);

  const recentOrders = MARKETPLACE_ORDERS.slice(0, 5); // We can leave placeholder for marketplace feature or update later
  const recentPOs = realPOs.slice(0, 4);

  const revenueSeries = useMemo(() => {
    const series = Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (13 - i));
      return { 
        day: d.toLocaleString('default', { month: 'short', day: 'numeric' }), 
        revenue: 0, 
        orders: 0 
      };
    });

    realPOs.forEach(po => {
      if (["Cancelled", "Draft"].includes(po.status)) return;
      const d = po.poDate ? new Date(po.poDate) : new Date();
      const mStr = d.toLocaleString('default', { month: 'short', day: 'numeric' });
      const bucket = series.find(s => s.day === mStr);
      if (bucket) {
        bucket.revenue += (po.total || 0);
        bucket.orders += 1;
      }
    });
    return series;
  }, [realPOs]);

  const totalRevenue = revenueSeries.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = revenueSeries.reduce((s, d) => s + d.orders, 0);

  const pendingPayouts = realBills
    .filter(b => ["Pending", "Approved", "Scheduled"].includes(b.status))
    .reduce((s, b) => s + (b.amount || 0), 0);

  const transitDeliveries = realDeliveries.filter(d => ["Pending", "Pending Inspection", "Dispatched"].includes(d.status));
  const transitCount = transitDeliveries.length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow={`Welcome back, ${user.name.split(" ")[0]}`}
        title={tenant.companyName}
        description="Here's what's happening across your storefront and procurement orders today."
        actions={
          <Link to="/vendor/products">
            <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
              <Package className="h-4 w-4" /> Add product
            </button>
          </Link>
        }
      />

      {/* Date Range Filter */}
      <div className="flex items-center gap-4 rounded-md border border-border bg-card p-4">
        <span className="text-sm font-semibold">Filter dashboard:</span>
        <input 
          type="date" 
          value={dateRange.start}
          onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
          className="h-9 rounded-sm border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <input 
          type="date" 
          value={dateRange.end}
          onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
          className="h-9 rounded-sm border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground"
        />
        {(dateRange.start || dateRange.end) && (
          <button 
            onClick={() => setDateRange({ start: "", end: "" })}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Link to="/vendor/purchase-orders" className="block transition-transform hover:scale-[1.02]">
          <StatCard label="Revenue (14d)" value={formatCurrency(totalRevenue)} delta="Based on POs" icon={TrendingUp} />
        </Link>
        <Link to="/vendor/purchase-orders" className="block transition-transform hover:scale-[1.02]">
          <StatCard label="Orders (14d)" value={totalOrders} delta="Assigned to you" icon={ShoppingCart} />
        </Link>
        <Link to="/vendor/invoices" className="block transition-transform hover:scale-[1.02]">
          <StatCard label="Pending payouts" value={formatCurrency(pendingPayouts)} delta="From unpaid bills" icon={Wallet} />
        </Link>
        <Link to="/vendor/compliance" className="block transition-transform hover:scale-[1.02]">
          <StatCard
            label="ML Risk score"
            value={tenant.riskClass}
            delta={`${(tenant.riskScore * 100).toFixed(0)}% probability`}
            icon={AlertCircle}
            tone="ink"
          />
        </Link>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="t-label">Revenue</div>
              <h3 className="font-display text-xl font-extrabold">Last 14 days</h3>
            </div>
            <span className="rounded-sm bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-emerald-800">
              +12.4%
            </span>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <AreaChart data={revenueSeries} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent-solid)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--accent-solid)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--accent-solid)" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <div className="mb-4">
            <div className="t-label">Orders</div>
            <h3 className="font-display text-xl font-extrabold">Daily volume</h3>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer>
              <BarChart data={revenueSeries} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--color-border)" vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "var(--color-ink-muted)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-ink-muted)" }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="orders" fill="var(--accent-solid)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent orders + POs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <div className="t-label">Marketplace</div>
              <h3 className="font-display text-lg font-extrabold">Recent orders</h3>
            </div>
            <Link to="/vendor/orders" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{o.orderNumber}</div>
                  <div className="truncate text-sm font-medium">{o.buyerName}</div>
                </div>
                <div className="flex items-center gap-3">
                  <AutoStatus status={o.status} />
                  <span className="font-mono text-sm font-semibold">{formatCurrency(o.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <div className="t-label">Procurement</div>
              <h3 className="font-display text-lg font-extrabold">Incoming purchase orders</h3>
            </div>
            <Link to="/vendor/purchase-orders" className="inline-flex items-center gap-1 text-sm font-medium hover:underline">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {recentPOs.map((p: any) => (
              <div key={p.poid || p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <div className="font-mono text-xs text-muted-foreground">{p.poNumber}</div>
                  <div className="truncate text-sm font-medium">{p.tenant?.companyName || p.buyerName || "Buyer Company"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <AutoStatus status={p.status} />
                  <span className="font-mono text-sm font-semibold">{formatCurrency(p.totalAmount || p.total || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews + delivery */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center gap-3">
            <Star className="h-5 w-5 text-amber-500" />
            <div>
              <div className="t-label">Latest feedback</div>
              <h3 className="font-display text-lg font-extrabold">Buyer reviews</h3>
            </div>
          </div>
          <div className="space-y-4">
            {REVIEWS.slice(0, 2).map((r) => (
              <div key={r.id} className="flex gap-3 border-l-2 border-foreground pl-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {r.buyerName}
                    </span>
                    <span className="font-mono text-xs text-amber-600">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-1 text-sm">{r.text}</p>
                  <div className="mt-1 text-[11px] text-muted-foreground">
                    on {r.productName} · {r.at}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-foreground p-5 text-background">
          <div className="mb-3 flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest opacity-70">
              Live status
            </span>
          </div>
          <h3 className="font-display text-2xl font-extrabold leading-tight">
            {transitCount} deliveries in transit
          </h3>
          <p className="mt-2 text-sm opacity-70">
            {transitCount > 0 ? `Track your dispatched orders to the buyer's site.` : "No active deliveries in transit right now."}
          </p>
          <Link to="/vendor/deliveries">
            <button className="mt-5 inline-flex h-10 items-center gap-2 rounded-sm bg-background px-4 text-sm font-medium text-foreground hover:opacity-85">
              Track deliveries <ArrowUpRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
