/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls } from "@/components/CrudDrawer";
import { complianceApi, type RiskAlert, type VendorRisk, type ComplianceDoc, type CreateComplianceDocPayload, type UpdateComplianceDocPayload } from "@/lib/api";
import { ShieldAlert, ShieldCheck, FileText, Pencil, Archive, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/risk")({
    component: () => (
        <BuyerPermissionGate permission="risk:view">
            <RiskPage />
        </BuyerPermissionGate>
    ),
});

function RiskPage() {
    const [alerts, setAlerts] = React.useState<RiskAlert[]>([]);
    const [vendors, setVendors] = React.useState<VendorRisk[]>([]);
    const [docs, setDocs] = React.useState<ComplianceDoc[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    const [tab, setTab] = React.useState<"alerts" | "documents">("alerts");

    // CRUD drawer state for documents
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState({
        title: "",
        documentNumber: "",
        categoryID: 0,
        issuedDate: "",
        expiryDate: "",
        status: "Active",
    });
    const [saving, setSaving] = React.useState(false);

    const loadData = React.useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [a, v, d] = await Promise.all([
                complianceApi.getAlerts(),
                complianceApi.getRiskScores(),
                complianceApi.getDocuments(),
            ]);
            setAlerts(a);
            setVendors(v);
            setDocs(d);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, []);

    React.useEffect(() => { loadData(); }, [loadData]);

    const openCreateDoc = () => {
        setDraft({ title: "", documentNumber: "", categoryID: 0, issuedDate: "", expiryDate: "", status: "Active" });
        setDrawer({ mode: "create" });
    };
    const openEditDoc = (d: ComplianceDoc) => {
        setDraft({
            title: d.title,
            documentNumber: d.documentNumber,
            categoryID: 0,
            issuedDate: d.issuedDate ?? "",
            expiryDate: d.expiryDate ?? "",
            status: d.status,
        });
        setDrawer({ mode: "edit", id: d.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                const created = await complianceApi.createDocument({
                    title: draft.title,
                    documentNumber: draft.documentNumber || undefined,
                    categoryID: draft.categoryID,
                    issuedDate: draft.issuedDate || undefined,
                    expiryDate: draft.expiryDate || undefined,
                });
                setDocs((prev) => [created, ...prev]);
            } else if (drawer.id) {
                const updated = await complianceApi.updateDocument(drawer.id, {
                    title: draft.title,
                    status: draft.status,
                    expiryDate: draft.expiryDate || undefined,
                });
                setDocs((prev) => prev.map((d) => d.id === drawer.id ? { ...d, ...updated } : d));
            }
            closeDrawer();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleArchiveDoc = async () => {
        if (drawer?.id) {
            await complianceApi.archiveDocument(drawer.id);
            setDocs((prev) => prev.filter((d) => d.id !== drawer.id));
            closeDrawer();
        }
    };

    const activeDocs = docs.filter((d) => d.status !== "Archived");

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="ML risk monitoring"
                title="Risk & Compliance"
                description="Random Forest scoring across delivery performance, quality, financials, and compliance."
            />

            {loading && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading risk data…
                </div>
            )}

            {error && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Failed to load: {error}
                    <button onClick={loadData} className="ml-2 font-semibold underline">Retry</button>
                </div>
            )}

            {!loading && !error && (
                <>
                    {/* Tab bar */}
                    <div className="flex gap-1 border-b border-border">
                        {(["alerts", "documents"] as const).map((t) => (
                            <button key={t} onClick={() => setTab(t)}
                                className={cn(
                                    "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                    tab === t ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                )}>
                                {t === "alerts" ? `Alerts (${alerts.length})` : `Documents (${activeDocs.length})`}
                            </button>
                        ))}
                    </div>

                    {tab === "alerts" && (
                        <>
                            {/* Active alerts */}
                            <div className="rounded-md border border-border bg-card">
                                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                    <span className="t-label">Active alerts</span>
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{alerts.length} signals</span>
                                </div>
                                {alerts.length === 0 ? (
                                    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                                        No active risk alerts. All vendors look healthy.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {alerts.map((a) => (
                                            <li key={a.id} className="px-5 py-4">
                                                <div className="flex items-start gap-3">
                                                    <span className={a.level === "High" ? "text-rose-600" : "text-amber-600"}>
                                                        <ShieldAlert className="h-5 w-5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-display text-base font-extrabold">{a.vendorName}</span>
                                                            <AutoStatus status={a.level} />
                                                            <span className="font-mono text-[10px] text-muted-foreground">{a.raisedAt}</span>
                                                        </div>
                                                        <div className="mt-1 text-sm font-medium">{a.signal}</div>
                                                        <div className="mt-1 text-xs text-muted-foreground">{a.detail}</div>
                                                    </div>
                                                    <button className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold hover:border-foreground">Investigate</button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Risk leaderboard */}
                            <div className="rounded-md border border-border bg-card">
                                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                                    <span className="t-label">Vendor risk leaderboard</span>
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                        <ShieldCheck className="h-3 w-3" /> ML model · v2.4
                                    </span>
                                </div>
                                {vendors.length === 0 ? (
                                    <div className="px-5 py-12 text-center text-sm text-muted-foreground">
                                        No vendor risk scores yet. Scores are generated when vendors have PO history.
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-border">
                                        {vendors.map((v) => {
                                            const pct = Math.round(Number(v.mlRiskScore) * 100);
                                            return (
                                                <li key={v.id} className="grid grid-cols-12 items-center gap-3 px-5 py-3 hover:bg-muted/40">
                                                    <div className="col-span-4 flex items-center gap-3">
                                                        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-foreground font-mono text-[11px] font-bold text-background">{v.initials}</span>
                                                        <span className="text-sm font-semibold">{v.vendorName}</span>
                                                    </div>
                                                    <div className="col-span-2 font-mono text-xs text-muted-foreground">{v.category}</div>
                                                    <div className="col-span-4">
                                                        <div className="h-2 w-full rounded-full bg-paper-mid">
                                                            <div
                                                                className={
                                                                    v.riskClassification === "High" ? "h-2 rounded-full bg-rose-500" :
                                                                    v.riskClassification === "Medium" ? "h-2 rounded-full bg-amber-500" :
                                                                    "h-2 rounded-full bg-emerald-500"
                                                                }
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-span-1 font-mono text-xs">{pct}%</div>
                                                    <div className="col-span-1"><AutoStatus status={v.riskClassification} /></div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        </>
                    )}

                    {tab === "documents" && (
                        <>
                            <div className="flex justify-end">
                                <button onClick={openCreateDoc}
                                    className="inline-flex h-10 items-center gap-1 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
                                    <Plus className="h-4 w-4" /> Upload document
                                </button>
                            </div>
                            <div className="overflow-hidden rounded-md border border-border bg-card">
                                <table className="w-full text-sm">
                                    <thead className="bg-muted text-left font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                                        <tr>
                                            <th className="px-4 py-3">Title</th>
                                            <th className="px-4 py-3">Doc #</th>
                                            <th className="px-4 py-3">Category</th>
                                            <th className="px-4 py-3">Issued</th>
                                            <th className="px-4 py-3">Expires</th>
                                            <th className="px-4 py-3">Uploaded by</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3" />
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {activeDocs.map((d) => (
                                            <tr key={d.id} className="hover:bg-muted/40">
                                                <td className="px-4 py-3 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        {d.title}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs">{d.documentNumber || "—"}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{d.category}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{d.issuedDate || "—"}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{d.expiryDate || "—"}</td>
                                                <td className="px-4 py-3 text-muted-foreground">{d.uploadedBy}</td>
                                                <td className="px-4 py-3"><AutoStatus status={d.status} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-end gap-1">
                                                        <button onClick={() => openEditDoc(d)}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground">
                                                            <Pencil className="h-3 w-3" />
                                                        </button>
                                                        <button onClick={async () => {
                                                            await complianceApi.archiveDocument(d.id);
                                                            setDocs((prev) => prev.filter((x) => x.id !== d.id));
                                                        }}
                                                            className="inline-flex h-7 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                                                            <Archive className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {activeDocs.length === 0 && (
                                            <tr><td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">No compliance documents yet.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Upload Document" : `Edit ${draft.title || "Document"}`}
                description="Upload or update a compliance document (licenses, certifications, insurance)."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchiveDoc : undefined}
                canSave={draft.title.trim() !== "" && !saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                <Field label="Document title">
                    <input className={inputCls} value={draft.title} placeholder="e.g. ISO 9001:2015 Certificate"
                        onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Document number">
                        <input className={inputCls} value={draft.documentNumber}
                            onChange={(e) => setDraft({ ...draft, documentNumber: e.target.value })} />
                    </Field>
                    <Field label="Status">
                        <select className={selectCls} value={draft.status}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                            <option>Active</option>
                            <option>Expired</option>
                            <option>Pending</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Issued date">
                        <input type="date" className={inputCls} value={draft.issuedDate}
                            onChange={(e) => setDraft({ ...draft, issuedDate: e.target.value })} />
                    </Field>
                    <Field label="Expiry date">
                        <input type="date" className={inputCls} value={draft.expiryDate}
                            onChange={(e) => setDraft({ ...draft, expiryDate: e.target.value })} />
                    </Field>
                </div>
            </CrudDrawer>
        </div>
    );
}
