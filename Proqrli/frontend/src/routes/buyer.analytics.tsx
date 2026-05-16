/* eslint-disable prettier/prettier */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { AutoStatus } from "@/components/StatusPill";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import {
  billsApi,
  inventoryApi,
  purchaseOrdersApi,
  requisitionsApi,
  settingsApi,
  type InventoryItemDto,
  type PurchaseOrder,
  type Requisition,
  type VendorBill,
} from "@/lib/api";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { Calendar, ChartColumn, Download, FileText, Sheet, Wallet } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/buyer/analytics")({
  loader: async () => {
    const [requisitions, purchaseOrders, bills, inventory, settings] = await Promise.all([
      requisitionsApi.getAll().catch(() => []),
      purchaseOrdersApi.getAll().catch(() => []),
      billsApi.getAll().catch(() => []),
      inventoryApi.getAll().catch(() => []),
      settingsApi.getTenantSettings().catch(() => null),
    ]);

    return {
      requisitions: requisitions as Requisition[],
      purchaseOrders: purchaseOrders as PurchaseOrder[],
      bills: bills as VendorBill[],
      inventory: inventory as InventoryItemDto[],
      settings,
    };
  },
  component: () => (
    <BuyerPermissionGate permission="analytics:view">
      <ProcurementAnalyticsPage />
    </BuyerPermissionGate>
  ),
});

type DateRange = { start: string; end: string };

function ProcurementAnalyticsPage() {
  const { tenant } = useBuyer();
  const data = Route.useLoaderData();
  const requisitions = data.requisitions as Requisition[];
  const purchaseOrders = data.purchaseOrders as PurchaseOrder[];
  const bills = data.bills as VendorBill[];
  const inventory = data.inventory as InventoryItemDto[];
  const [draftRange, setDraftRange] = React.useState<DateRange>({
    start: firstDayOfCurrentMonth(),
    end: new Date().toISOString().slice(0, 10),
  });
  const [range, setRange] = React.useState<DateRange>(draftRange);

  const companyName = data.settings?.companyName || tenant.companyName;
  const filtered = React.useMemo(() => {
    return {
      requisitions: requisitions.filter((r) => inRange(r.raisedAt, range)),
      purchaseOrders: purchaseOrders.filter((p) => inRange(p.poDate, range)),
      bills: bills.filter((b) => inRange(b.receivedAt, range)),
      inventory: inventory.filter((i) => !i.archived),
    };
  }, [bills, inventory, purchaseOrders, range, requisitions]);

  const totalPoSpend = sum(filtered.purchaseOrders, (p) => p.total);
  const activePoCount = filtered.purchaseOrders.filter((p) => !["Closed", "Cancelled", "Received"].includes(p.status)).length;
  const pendingApprovals = filtered.requisitions.filter((r) => ["Pending Approval", "Approved"].includes(r.status)).length;
  const billsDue = filtered.bills.filter((b) => ["Pending", "Approved", "Scheduled", "Overdue"].includes(b.status)).reduce((total, b) => total + b.amount, 0);
  const overdueDeliveries = filtered.purchaseOrders.filter((p) => p.expectedDelivery && !["Closed", "Cancelled", "Received"].includes(p.status) && new Date(p.expectedDelivery) < new Date()).length;

  const vendorSpend = React.useMemo(() => {
    const buckets = new Map<string, { name: string; spend: number; orders: number }>();
    filtered.purchaseOrders.forEach((po) => {
      const key = po.vendorName || "Unassigned";
      const bucket = buckets.get(key) ?? { name: key, spend: 0, orders: 0 };
      bucket.spend += po.total || 0;
      bucket.orders += 1;
      buckets.set(key, bucket);
    });
    return Array.from(buckets.values()).sort((a, b) => b.spend - a.spend).slice(0, 8);
  }, [filtered.purchaseOrders]);

  const statusMix = React.useMemo(() => {
    const buckets = new Map<string, number>();
    filtered.purchaseOrders.forEach((po) => buckets.set(po.status, (buckets.get(po.status) ?? 0) + 1));
    return Array.from(buckets, ([status, count]) => ({ status, count }));
  }, [filtered.purchaseOrders]);

  const lowStock = filtered.inventory
    .filter((item) => item.onHand <= item.reorderPoint)
    .sort((a, b) => a.onHand - b.onHand)
    .slice(0, 8);

  const reportRows = buildReportRows(filtered);
  const reportMeta: ReportMeta = {
    companyName,
    industry: data.settings?.industry || "Not specified",
    contactEmail: data.settings?.contactEmail || "Not specified",
    taxId: data.settings?.taxId || "Not specified",
    dateRange: rangeLabel(range),
    generatedAt: new Date().toLocaleString(),
    totalPoSpend,
    activePoCount,
    pendingApprovals,
    billsDue,
    overdueDeliveries,
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader
        eyebrow="5. Procurement Analytics"
        title="Procurement Analytics"
        description="Fetch a date-bound procurement snapshot and download the report as Excel or PDF."
        actions={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => downloadExcel(reportMeta, reportRows, vendorSpend, lowStock)} className="inline-flex h-10 items-center gap-2 rounded-sm border border-border bg-card px-3 text-sm font-semibold hover:border-foreground">
              <Sheet className="h-4 w-4" /> Excel
            </button>
            <button onClick={() => downloadPdf(reportMeta, reportRows, vendorSpend, lowStock)} className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-3 text-sm font-semibold text-background hover:opacity-85">
              <Download className="h-4 w-4" /> PDF
            </button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 rounded-md border border-border bg-card p-4 md:flex-row md:items-end md:justify-between">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] md:w-auto md:grid-cols-[180px_auto_180px]">
          <label className="text-sm font-semibold">
            <span className="mb-1 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground"><Calendar className="h-3 w-3" /> Start date</span>
            <input type="date" value={draftRange.start} onChange={(e) => setDraftRange((prev) => ({ ...prev, start: e.target.value }))} className="h-10 w-full rounded-sm border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground" />
          </label>
          <span className="hidden self-center pt-5 text-xs font-semibold text-muted-foreground sm:block">to</span>
          <label className="text-sm font-semibold">
            <span className="mb-1 block text-xs uppercase tracking-widest text-muted-foreground">End date</span>
            <input type="date" value={draftRange.end} onChange={(e) => setDraftRange((prev) => ({ ...prev, end: e.target.value }))} className="h-10 w-full rounded-sm border border-border bg-transparent px-3 text-sm outline-none focus:border-foreground" />
          </label>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDraftRange({ start: "", end: "" })} className="h-10 rounded-sm border border-border px-3 text-sm font-semibold hover:border-foreground">Clear</button>
          <button onClick={() => setRange(draftRange)} className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">Fetch report</button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="PO spend" value={formatBuyerCurrency(totalPoSpend)} icon={Wallet} tone="ink" />
        <StatCard label="Active POs" value={activePoCount} icon={FileText} />
        <StatCard label="Pending PRs" value={pendingApprovals} icon={ChartColumn} />
        <StatCard label="Bills due" value={formatBuyerCurrency(billsDue)} icon={Wallet} tone="accent" />
        <StatCard label="Overdue deliveries" value={overdueDeliveries} icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-md border border-border bg-card p-5 lg:col-span-2">
          <div className="mb-4">
            <div className="t-label">Spend by vendor</div>
            <div className="mt-1 text-sm text-muted-foreground">{rangeLabel(range)}</div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorSpend} layout="vertical" margin={{ left: 16, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-tone)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--ink-muted)" tickFormatter={(v) => `${Number(v) / 1000}k`} />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }} stroke="var(--ink-muted)" />
                <Tooltip contentStyle={{ borderRadius: 4, fontSize: 12, border: "1px solid var(--border-tone)", background: "var(--card)" }} formatter={(v: number) => formatBuyerCurrency(v)} />
                <Bar dataKey="spend" radius={[0, 2, 2, 0]}>
                  {vendorSpend.map((_, index) => <Cell key={index} fill={index % 2 === 0 ? "var(--accent-solid)" : "var(--foreground)" } />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-5">
          <div className="t-label mb-3">PO status mix</div>
          <div className="space-y-3">
            {statusMix.map((item) => (
              <div key={item.status} className="flex items-center justify-between gap-3">
                <AutoStatus status={item.status} />
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div className="h-2 rounded-full bg-foreground" style={{ width: `${Math.max(8, (item.count / Math.max(1, filtered.purchaseOrders.length)) * 100)}%` }} />
                </div>
                <span className="font-mono text-xs font-bold">{item.count}</span>
              </div>
            ))}
            {statusMix.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No purchase orders in this range.</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReportTable title="Procurement report" rows={reportRows.slice(0, 8)} />
        <LowStockTable items={lowStock} />
      </div>
    </div>
  );
}

function ReportTable({ title, rows }: { title: string; rows: ReportRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border px-5 py-4"><span className="t-label">{title}</span></div>
      <table className="w-full text-sm">
        <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Module</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {rows.map((row) => (
            <tr key={`${row.module}-${row.reference}`}><td className="px-4 py-3 text-muted-foreground">{row.date}</td><td className="px-4 py-3">{row.module}</td><td className="px-4 py-3 font-mono text-xs">{row.reference}</td><td className="px-4 py-3 font-mono font-semibold">{formatBuyerCurrency(row.amount)}</td><td className="px-4 py-3"><AutoStatus status={row.status} /></td></tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">No records in this range.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function LowStockTable({ items }: { items: InventoryItemDto[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-card">
      <div className="border-b border-border px-5 py-4"><span className="t-label">Inventory exceptions</span></div>
      <table className="w-full text-sm">
        <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <tr><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">On hand</th><th className="px-4 py-3">Reorder</th></tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item) => (
            <tr key={item.id}><td className="px-4 py-3 font-mono text-xs">{item.sku}</td><td className="px-4 py-3 font-medium">{item.name}</td><td className="px-4 py-3">{item.onHand} {item.uom}</td><td className="px-4 py-3 font-mono text-xs">{item.reorderPoint}</td></tr>
          ))}
          {items.length === 0 && <tr><td colSpan={4} className="px-4 py-12 text-center text-sm text-muted-foreground">No low-stock exceptions.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

type ReportRow = { date: string; module: string; reference: string; vendor: string; description: string; amount: number; status: string };
type ReportMeta = {
  companyName: string;
  industry: string;
  contactEmail: string;
  taxId: string;
  dateRange: string;
  generatedAt: string;
  totalPoSpend: number;
  activePoCount: number;
  pendingApprovals: number;
  billsDue: number;
  overdueDeliveries: number;
};

function buildReportRows(data: { requisitions: Requisition[]; purchaseOrders: PurchaseOrder[]; bills: VendorBill[] }): ReportRow[] {
  return [
    ...data.requisitions.map((r) => ({ date: r.raisedAt, module: "Requisition", reference: r.prNumber, vendor: "", description: r.title, amount: r.amount, status: r.status })),
    ...data.purchaseOrders.map((p) => ({ date: p.poDate, module: "Purchase Order", reference: p.poNumber, vendor: p.vendorName, description: p.prRef ?? "Direct purchase", amount: p.total, status: p.status })),
    ...data.bills.map((b) => ({ date: b.receivedAt, module: "Bill", reference: b.billNumber, vendor: b.vendorName, description: b.poRef, amount: b.amount, status: b.status })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function inRange(dateValue: string | undefined, range: DateRange) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  if (range.start && date < new Date(range.start)) return false;
  if (range.end) {
    const end = new Date(range.end);
    end.setDate(end.getDate() + 1);
    if (date >= end) return false;
  }
  return true;
}

function sum<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((total, item) => total + (getValue(item) || 0), 0);
}

function firstDayOfCurrentMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

function rangeLabel(range: DateRange) {
  if (range.start && range.end) return `${range.start} to ${range.end}`;
  if (range.start) return `From ${range.start}`;
  if (range.end) return `Through ${range.end}`;
  return "All dates";
}

function formatDateShort(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString().slice(0, 10);
}

function downloadExcel(meta: Record<string, string | number>, rows: ReportRow[], vendorSpend: { name: string; spend: number; orders: number }[], lowStock: InventoryItemDto[]) {
  const html = `
    <html><head><meta charset="utf-8" /></head><body>
      <h1>Procurement Analytics</h1>
      <table border="1">${Object.entries(meta).map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(String(v))}</td></tr>`).join("")}</table>
      <h2>Report Detail</h2>${htmlTable(["Date", "Module", "Reference", "Vendor", "Description", "Amount", "Status"], rows.map((r) => [r.date, r.module, r.reference, r.vendor, r.description, moneyPlain(r.amount), r.status]))}
      <h2>Spend By Vendor</h2>${htmlTable(["Vendor", "Spend", "Orders"], vendorSpend.map((v) => [v.name, moneyPlain(v.spend), String(v.orders)]))}
      <h2>Inventory Exceptions</h2>${htmlTable(["SKU", "Item", "On Hand", "Reorder Point", "Preferred Vendor"], lowStock.map((i) => [i.sku, i.name, `${i.onHand} ${i.uom}`, String(i.reorderPoint), i.preferredVendorName ?? ""]))}
    </body></html>`;
  downloadBlob(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }), `procurement-analytics-${dateStamp()}.xls`);
}

function downloadPdf(meta: ReportMeta, rows: ReportRow[], vendorSpend: { name: string; spend: number; orders: number }[], lowStock: InventoryItemDto[]) {
  downloadBlob(createProcurementPdfBlob(meta, rows, vendorSpend, lowStock), `procurement-analytics-${dateStamp()}.pdf`);
}

function htmlTable(headers: string[], rows: string[][]) {
  return `<table border="1"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}

function createProcurementPdfBlob(meta: ReportMeta, rows: ReportRow[], vendorSpend: { name: string; spend: number; orders: number }[], lowStock: InventoryItemDto[]) {
  const pages: string[] = [];
  const content: string[] = [];

  paintPageChrome(content, meta, "Procurement Analytics");
  drawTenantPanel(content, meta, 42, 638);
  drawMetricCards(content, meta, 42, 535);
  drawSimpleTable(content, "Top vendor spend", ["Vendor", "Spend", "Orders"], vendorSpend.slice(0, 8).map((v) => [v.name, moneyPlain(v.spend), String(v.orders)]), 42, 378, [255, 112, 72]);
  pages.push(content.join("\n"));

  const detailRows = rows.slice(0, 32).map((r) => [formatDateShort(r.date), r.module, r.reference, r.vendor || "-", moneyPlain(r.amount), r.status]);
  const detailPages = chunk(detailRows, 16);
  detailPages.forEach((pageRows, index) => {
    const detailContent: string[] = [];
    paintPageChrome(detailContent, meta, `Report Detail${detailPages.length > 1 ? ` ${index + 1}/${detailPages.length}` : ""}`);
    drawSimpleTable(detailContent, "Procurement report", ["Date", "Module", "Reference", "Vendor", "Amount", "Status"], pageRows, 42, 662, [68, 124, 244]);
    pages.push(detailContent.join("\n"));
  });

  const exceptionRows = lowStock.slice(0, 18).map((i) => [i.sku, i.name, `${i.onHand} ${i.uom}`, String(i.reorderPoint), i.preferredVendorName ?? "-"]);
  const exceptionContent: string[] = [];
  paintPageChrome(exceptionContent, meta, "Inventory Exceptions");
  drawSimpleTable(exceptionContent, "Low-stock items", ["SKU", "Item", "On hand", "Reorder", "Preferred vendor"], exceptionRows, 42, 662, [13, 148, 136]);
  pages.push(exceptionContent.join("\n"));

  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${5 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  pages.forEach((stream, index) => {
    const pageObjectId = 5 + index * 2;
    const contentObjectId = pageObjectId + 1;
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });
  const bodyParts = objects.map((object, index) => `${index + 1} 0 obj\n${object}\nendobj\n`);
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  bodyParts.forEach((part) => {
    offsets.push(pdf.length);
    pdf += part;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: "application/pdf" });
}

function paintPageChrome(ops: string[], meta: ReportMeta, title: string) {
  fillRect(ops, 0, 774, 595, 68, [17, 24, 39]);
  fillRect(ops, 0, 766, 595, 8, [13, 148, 136]);
  text(ops, "PROQRLI", 42, 809, 10, [255, 255, 255], "bold");
  text(ops, title, 42, 789, 20, [255, 255, 255], "bold");
  text(ops, meta.companyName, 553, 809, 10, [255, 255, 255], "bold", "right");
  text(ops, meta.dateRange, 553, 790, 9, [209, 213, 219], "regular", "right");
  line(ops, 42, 62, 553, 62, [229, 231, 235]);
  text(ops, `Generated ${meta.generatedAt}`, 42, 42, 8, [107, 114, 128]);
  text(ops, "Procurement analytics report", 553, 42, 8, [107, 114, 128], "regular", "right");
}

function drawTenantPanel(ops: string[], meta: ReportMeta, x: number, y: number) {
  fillRect(ops, x, y, 511, 92, [249, 250, 251]);
  strokeRect(ops, x, y, 511, 92, [229, 231, 235]);
  text(ops, "TENANT COMPANY DETAILS", x + 18, y + 66, 8, [107, 114, 128], "bold");
  text(ops, meta.companyName, x + 18, y + 43, 17, [17, 24, 39], "bold");
  drawLabelValue(ops, "Industry", meta.industry, x + 292, y + 58);
  drawLabelValue(ops, "Contact email", meta.contactEmail, x + 292, y + 34);
  drawLabelValue(ops, "Tax ID", meta.taxId, x + 292, y + 10);
}

function drawMetricCards(ops: string[], meta: ReportMeta, x: number, y: number) {
  const cards = [
    ["PO spend", moneyPlain(meta.totalPoSpend), [13, 148, 136] as PdfColor],
    ["Active POs", String(meta.activePoCount), [17, 24, 39] as PdfColor],
    ["Pending PRs", String(meta.pendingApprovals), [68, 124, 244] as PdfColor],
    ["Bills due", moneyPlain(meta.billsDue), [255, 112, 72] as PdfColor],
    ["Overdue", String(meta.overdueDeliveries), [126, 34, 206] as PdfColor],
  ];
  const gap = 8;
  const width = (511 - gap * 4) / 5;
  cards.forEach(([label, value, accent], index) => {
    const left = x + index * (width + gap);
    fillRect(ops, left, y, width, 76, [255, 255, 255]);
    strokeRect(ops, left, y, width, 76, [229, 231, 235]);
    fillRect(ops, left, y + 72, width, 4, accent as PdfColor);
    text(ops, label as string, left + 10, y + 49, 7, [107, 114, 128], "bold");
    text(ops, fitText(value as string, 16), left + 10, y + 23, 13, [17, 24, 39], "bold");
  });
}

function drawSimpleTable(ops: string[], title: string, headers: string[], rows: string[][], x: number, y: number, accent: PdfColor) {
  const tableWidth = 511;
  const rowHeight = 24;
  const headerHeight = 26;
  const widths = distributeColumns(headers.length, tableWidth);
  text(ops, title.toUpperCase(), x, y + 36, 9, [107, 114, 128], "bold");
  fillRect(ops, x, y, tableWidth, headerHeight, accent);
  let cursorX = x;
  headers.forEach((header, index) => {
    text(ops, header, cursorX + 8, y + 9, 8, [255, 255, 255], "bold");
    cursorX += widths[index];
  });
  if (!rows.length) {
    strokeRect(ops, x, y - rowHeight, tableWidth, rowHeight, [229, 231, 235]);
    text(ops, "No records available for this section.", x + 8, y - 16, 9, [107, 114, 128]);
    return;
  }
  rows.forEach((row, rowIndex) => {
    const rowY = y - rowHeight * (rowIndex + 1);
    fillRect(ops, x, rowY, tableWidth, rowHeight, rowIndex % 2 === 0 ? [255, 255, 255] : [249, 250, 251]);
    strokeRect(ops, x, rowY, tableWidth, rowHeight, [229, 231, 235]);
    cursorX = x;
    row.forEach((cell, index) => {
      text(ops, fitText(cell, Math.max(8, Math.floor(widths[index] / 5.2))), cursorX + 8, rowY + 8, 8, [31, 41, 55]);
      cursorX += widths[index];
    });
  });
}

function drawLabelValue(ops: string[], label: string, value: string, x: number, y: number) {
  text(ops, label.toUpperCase(), x, y + 10, 6, [107, 114, 128], "bold");
  text(ops, fitText(value, 28), x, y, 9, [31, 41, 55]);
}

type PdfColor = [number, number, number];

function fillRect(ops: string[], x: number, y: number, width: number, height: number, color: PdfColor) {
  ops.push(`q ${rgb(color)} rg ${x} ${y} ${width} ${height} re f Q`);
}

function strokeRect(ops: string[], x: number, y: number, width: number, height: number, color: PdfColor) {
  ops.push(`q ${rgb(color)} RG 0.8 w ${x} ${y} ${width} ${height} re S Q`);
}

function line(ops: string[], x1: number, y1: number, x2: number, y2: number, color: PdfColor) {
  ops.push(`q ${rgb(color)} RG 0.8 w ${x1} ${y1} m ${x2} ${y2} l S Q`);
}

function text(ops: string[], value: string, x: number, y: number, size: number, color: PdfColor, weight: "regular" | "bold" = "regular", align: "left" | "right" = "left") {
  const adjustedX = align === "right" ? x - value.length * size * 0.48 : x;
  ops.push(`BT /${weight === "bold" ? "F2" : "F1"} ${size} Tf ${rgb(color)} rg ${adjustedX} ${y} Td (${escapePdf(value)}) Tj ET`);
}

function rgb([r, g, b]: PdfColor) {
  return `${(r / 255).toFixed(3)} ${(g / 255).toFixed(3)} ${(b / 255).toFixed(3)}`;
}

function distributeColumns(count: number, width: number) {
  if (count === 3) return [width * 0.52, width * 0.28, width * 0.2];
  if (count === 5) return [width * 0.16, width * 0.32, width * 0.16, width * 0.16, width * 0.2];
  if (count === 6) return [width * 0.13, width * 0.18, width * 0.18, width * 0.21, width * 0.16, width * 0.14];
  return Array.from({ length: count }, () => width / count);
}

function fitText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, Math.max(0, maxLength - 1))}.` : normalized;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size));
  return chunks.length ? chunks : [[]];
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function moneyPlain(value: number) {
  return `PHP ${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
}

function escapePdf(value: string) {
  return value.replace(/[\\()]/g, "\\$&").replace(/[^\x20-\x7E]/g, " ");
}
