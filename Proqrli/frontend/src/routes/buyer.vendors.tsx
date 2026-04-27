/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Star, Pencil, Archive, RotateCcw } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls } from "@/components/CrudDrawer";
import { useCollection } from "@/lib/use-collection";
import {
    BUYER_VENDORS,
    formatBuyerCurrency,
    type BuyerVendor,
} from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/buyer/vendors")({
    component: () => (
        <BuyerPermissionGate permission="vendors:view">
            <VendorsPage />
        </BuyerPermissionGate>
    ),
});

type VendorRow = BuyerVendor & { archived?: boolean };

const CATEGORIES = ["Industrial Equipment", "Hydraulics", "Chemicals", "Fasteners", "Electrical", "Safety", "Raw Materials", "MRO"];

const EMPTY: Omit<VendorRow, "id"> = {
    companyName: "",
    category: CATEGORIES[0],
    status: "Pending",
    riskClass: "Low",
    riskScore: 0.2,
    rating: 0,
    totalSpend: 0,
    orders: 0,
    onTimeRate: 0,
    initials: "??",
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
    const store = useCollection<VendorRow>(BUYER_VENDORS as VendorRow[], "v");

    const [view, setView] = React.useState<"active" | "archived">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState<Omit<VendorRow, "id">>(EMPTY);

    const list = view === "active" ? store.items : store.archived;

    const openCreate = () => { setDraft({ ...EMPTY }); setDrawer({ mode: "create" }); };
    const openEdit = (v: VendorRow) => {
        const { id, ...rest } = v; void id;
        setDraft(rest); setDrawer({ mode: "edit", id: v.id });
    };
    const closeDrawer = () => setDrawer(null);
    const handleSave = () => {
        if (!drawer) return;
        const final = { ...draft, initials: draft.initials || deriveInitials(draft.companyName) };
        if (drawer.mode === "create") store.create(final);
        else if (drawer.id) store.update(drawer.id, final);
        closeDrawer();
    };
    const handleArchive = () => { if (drawer?.id) { store.archive(drawer.id); closeDrawer(); } };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Accredited supply base"
                title="Vendors"
                description="Manage approved vendors, view their ML risk score, and onboard new ones."
                actions={
                    canManage && (
                        <button
                            onClick={openCreate}
                            className="h-10 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85"
                        >
                            + Invite vendor
                        </button>
                    )
                }
            />

            <div className="flex gap-1 border-b border-border">
                {(["active", "archived"] as const).map((v) => (
                    <button key={v} onClick={() => setView(v)}
                        className={cn(
                            "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                            view === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {v} ({v === "active" ? store.items.length : store.archived.length})
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((v) => (
                    <div key={v.id} className="rounded-md border border-border bg-card p-5">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-foreground font-mono text-sm font-bold text-background">
                                    {v.initials}
                                </span>
                                <div>
                                    <div className="font-display text-base font-extrabold">{v.companyName}</div>
                                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{v.category}</div>
                                </div>
                            </div>
                            <AutoStatus status={v.archived ? "Archived" : v.status} />
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="t-label">Risk</div>
                                <div className="mt-1 flex items-center gap-2">
                                    <AutoStatus status={v.riskClass} />
                                    <span className="font-mono text-[10px] text-muted-foreground">{(v.riskScore * 100).toFixed(0)}%</span>
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
                                <div className="mt-1 font-mono text-sm font-semibold">{formatBuyerCurrency(v.totalSpend)}</div>
                            </div>
                            <div>
                                <div className="t-label">On-time</div>
                                <div className="mt-1 font-mono text-sm font-semibold">{v.onTimeRate}%</div>
                            </div>
                        </div>

                        <div className="mt-4 flex gap-2">
                            {v.archived ? (
                                <button
                                    onClick={() => store.restore(v.id)}
                                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-border bg-card py-2 text-xs font-semibold hover:border-foreground"
                                >
                                    <RotateCcw className="h-3 w-3" /> Restore
                                </button>
                            ) : (
                                <>
                                    {canManage && (
                                        <button
                                            onClick={() => openEdit(v)}
                                            className="inline-flex flex-1 items-center justify-center gap-1 rounded-sm border border-border bg-card py-2 text-xs font-semibold hover:border-foreground"
                                        >
                                            <Pencil className="h-3 w-3" /> Edit
                                        </button>
                                    )}
                                    <button
                                        className="flex-1 rounded-sm bg-foreground py-2 text-xs font-semibold text-background hover:opacity-85"
                                        disabled={v.status !== "Accredited"}
                                    >
                                        Invite to RFQ
                                    </button>
                                    {canManage && (
                                        <button
                                            onClick={() => store.archive(v.id)}
                                            className="inline-flex items-center justify-center rounded-sm border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                                            title="Archive"
                                        >
                                            <Archive className="h-3 w-3" />
                                        </button>
                                    )}
                                </>
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

            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Invite vendor" : draft.companyName || "Edit vendor"}
                description="Onboard a new vendor or update an existing accreditation."
                onClose={closeDrawer}
                onSave={handleSave}
                onArchive={drawer?.mode === "edit" ? handleArchive : undefined}
                canSave={draft.companyName.trim() !== ""}
            >
                <Field label="Company name">
                    <input className={inputCls} value={draft.companyName}
                        onChange={(e) => setDraft({ ...draft, companyName: e.target.value, initials: deriveInitials(e.target.value) })} />
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
                            onChange={(e) => setDraft({ ...draft, status: e.target.value as BuyerVendor["status"] })}>
                            <option>Pending</option>
                            <option>Accredited</option>
                            <option>Blocked</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Risk class">
                        <select className={selectCls} value={draft.riskClass}
                            onChange={(e) => setDraft({ ...draft, riskClass: e.target.value as BuyerVendor["riskClass"] })}>
                            <option>Low</option><option>Medium</option><option>High</option>
                        </select>
                    </Field>
                    <Field label="Risk score (0-1)">
                        <input type="number" step="0.01" min="0" max="1" className={inputCls} value={draft.riskScore}
                            onChange={(e) => setDraft({ ...draft, riskScore: Number(e.target.value) })} />
                    </Field>
                    <Field label="Rating">
                        <input type="number" step="0.1" min="0" max="5" className={inputCls} value={draft.rating}
                            onChange={(e) => setDraft({ ...draft, rating: Number(e.target.value) })} />
                    </Field>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    <Field label="Lifetime spend">
                        <input type="number" className={inputCls} value={draft.totalSpend}
                            onChange={(e) => setDraft({ ...draft, totalSpend: Number(e.target.value) })} />
                    </Field>
                    <Field label="Orders">
                        <input type="number" className={inputCls} value={draft.orders}
                            onChange={(e) => setDraft({ ...draft, orders: Number(e.target.value) })} />
                    </Field>
                    <Field label="On-time %">
                        <input type="number" min="0" max="100" className={inputCls} value={draft.onTimeRate}
                            onChange={(e) => setDraft({ ...draft, onTimeRate: Number(e.target.value) })} />
                    </Field>
                </div>
                <Field label="Notes">
                    <textarea className={textareaCls} placeholder="Accreditation notes, contacts, payment terms…" />
                </Field>
            </CrudDrawer>
        </div>
    );
}
