/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Star, Pencil, Archive, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { vendorsApi, type VendorRecord, type CreateVendorPayload, type UpdateVendorPayload } from "@/lib/api";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/vendors")({
    component: () => (
        <BuyerPermissionGate permission="vendors:view">
            <VendorsPage />
        </BuyerPermissionGate>
    ),
});

const CATEGORIES = ["Industrial Equipment", "Hydraulics", "Chemicals", "Fasteners", "Electrical", "Safety", "Raw Materials", "MRO"];
const VENDOR_STATUSES = ["Pending", "Accredited", "Blocked"] as const;

const EMPTY = {
    companyName: "",
    category: CATEGORIES[0],
    status: "Pending" as string,
};

function deriveInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("") || "??";
}

function VendorsPage() {
    const { hasPermission } = useBuyer();
    const canManage = hasPermission("vendors:manage");
    const store = useApiCollection<VendorRecord, CreateVendorPayload, UpdateVendorPayload>(vendorsApi);

    const [view, setView] = React.useState<"active" | "blocked">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);

    const activeVendors = store.items.filter((v) => v.status !== "Blocked");
    const blockedVendors = store.items.filter((v) => v.status === "Blocked");
    const list = view === "active" ? activeVendors : blockedVendors;

    const openCreate = () => { setDraft({ ...EMPTY }); setDrawer({ mode: "create" }); };
    const openEdit = (v: VendorRecord) => {
        setDraft({
            companyName: v.companyName,
            category: v.category || CATEGORIES[0],
            status: v.status,
        });
        setDrawer({ mode: "edit", id: v.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") {
                await store.create({
                    companyName: draft.companyName,
                    category: draft.category,
                    status: draft.status,
                });
            } else if (drawer.id) {
                await store.update(drawer.id, {
                    companyName: draft.companyName,
                    category: draft.category,
                    status: draft.status,
                });
            }
            closeDrawer();
        } catch (err) {
            console.error("Save failed:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async () => {
        if (drawer?.id) { await store.archive(drawer.id); closeDrawer(); }
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Accredited supply base"
                title="Vendors"
                description="Manage approved vendors, view their risk score, and onboard new ones."
                actions={
                    canManage && (
                        <button onClick={openCreate}
                            className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
                            + Invite vendor
                        </button>
                    )
                }
            />

            {store.state === "loading" && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading vendors…
                </div>
            )}

            {store.state === "error" && (
                <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    Failed to load: {store.error}
                    <button onClick={store.reload} className="ml-2 font-semibold underline">Retry</button>
                </div>
            )}

            {store.state === "idle" && (
                <>
                    <div className="flex gap-1 border-b border-border">
                        {(["active", "blocked"] as const).map((v) => (
                            <button key={v} onClick={() => setView(v)}
                                className={cn(
                                    "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                    view === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                )}>
                                {v} ({v === "active" ? activeVendors.length : blockedVendors.length})
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((v) => (
                            <div key={v.id} className="rounded-md border border-border bg-card p-5">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-foreground font-mono text-sm font-bold text-background">
                                            {v.initials || deriveInitials(v.companyName)}
                                        </span>
                                        <div>
                                            <div className="font-display text-base font-extrabold">{v.companyName}</div>
                                            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{v.category}</div>
                                        </div>
                                    </div>
                                    <AutoStatus status={v.status} />
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <div className="t-label">Risk</div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <AutoStatus status={v.riskClass || "Low"} />
                                            <span className="font-mono text-[10px] text-muted-foreground">{((v.riskScore || 0) * 100).toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="t-label">Rating</div>
                                        <div className="mt-1 inline-flex items-center gap-1 font-semibold">
                                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                            {v.rating > 0 ? v.rating.toFixed(1) : "—"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="t-label">Lifetime spend</div>
                                        <div className="mt-1 font-mono text-sm font-semibold">{formatBuyerCurrency(v.totalSpend || 0)}</div>
                                    </div>
                                    <div>
                                        <div className="t-label">On-time</div>
                                        <div className="mt-1 font-mono text-sm font-semibold">{v.onTimeRate || 0}%</div>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-2">
                                    {canManage && (
                                        <button onClick={() => openEdit(v)}
                                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-border bg-card py-2 text-xs font-semibold hover:border-foreground">
                                            <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                    )}
                                    <button
                                        className="flex-1 rounded-sm bg-foreground py-2 text-xs font-semibold text-background hover:opacity-85"
                                        disabled={v.status !== "Accredited"}>
                                        Invite to RFQ
                                    </button>
                                    {canManage && v.status !== "Blocked" && (
                                        <button onClick={() => store.archive(v.id)}
                                            className="inline-flex items-center justify-center rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            title="Block">
                                            <Archive className="h-3 w-3" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {list.length === 0 && (
                            <div className="col-span-full rounded-md border border-dashed border-border bg-card/50 p-12 text-center text-sm text-muted-foreground">
                                No vendors in this view.
                            </div>
                        )}
                    </div>
                </>
            )}

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Invite vendor" : draft.companyName || "Edit vendor"}
                description="Onboard a new vendor or update an existing accreditation."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={draft.companyName.trim() !== "" && !saving}
                saveLabel={saving ? "Saving…" : undefined}
            >
                <Field label="Company name">
                    <input className={inputCls} value={draft.companyName}
                        onChange={(e) => setDraft({ ...draft, companyName: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field label="Category">
                        <select className={selectCls} value={draft.category}
                            onChange={(e) => setDraft({ ...draft, category: e.target.value })}>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </Field>
                    <Field label="Status">
                        <select className={selectCls} value={draft.status}
                            onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                            {VENDOR_STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                    </Field>
                </div>
                <Field label="Notes">
                    <textarea className={textareaCls} placeholder="Accreditation notes, contacts, payment terms…" />
                </Field>
            </CrudDrawer>
        </div>
    );
}
