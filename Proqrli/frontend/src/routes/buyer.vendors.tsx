/* eslint-disable prettier/prettier */
import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import {
    Star, Pencil, Archive, Loader2, Search, Send, MessageSquare,
    MapPin, Package, CheckCircle2, Clock, X, ChevronRight, Building2,
    BadgeCheck, ExternalLink, ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { AutoStatus } from "@/components/StatusPill";
import { CrudDrawer, Field, inputCls, selectCls, textareaCls, SelectOrCustom } from "@/components/CrudDrawer";
import { useApiCollection } from "@/lib/use-api-collection";
import { vendorsApi, type VendorRecord, type CreateVendorPayload, type UpdateVendorPayload, type MarketplaceVendorDto } from "@/lib/api";
import { formatBuyerCurrency } from "@/lib/buyer-mock-data";
import { useBuyer } from "@/lib/buyer-context";
import { cn } from "@/lib/utils";
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

export const Route = createFileRoute("/buyer/vendors")({
    component: () => (
        <BuyerPermissionGate permission="vendors:view">
            <VendorsPage />
        </BuyerPermissionGate>
    ),
});


type InviteStatus = "none" | "pending" | "accepted" | "declined";
const VENDOR_STATUSES = ["Pending", "Accredited", "Blocked"] as const;
const CATEGORIES = ["Industrial Equipment", "Hydraulics", "Chemicals", "Fasteners", "Electrical", "Safety", "Raw Materials", "MRO", "Packaging"];

const EMPTY = { companyName: "", category: CATEGORIES[0], status: "Pending" as string };

function deriveInitials(name: string) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "??";
}

function VendorsPage() {
    const { hasPermission } = useBuyer();
    const canManage = hasPermission("vendors:manage");
    const store = useApiCollection<VendorRecord, CreateVendorPayload, UpdateVendorPayload>(vendorsApi);

    const [mainTab, setMainTab] = React.useState<"discover" | "my-vendors">("discover");

    const [searchQuery, setSearchQuery] = React.useState("");
    const [debouncedQuery, setDebouncedQuery] = React.useState("");
    const [categoryFilter, setCategoryFilter] = React.useState("All");
    const [invitations, setInvitations] = React.useState<Record<string, InviteStatus>>({});
    const [profileVendor, setProfileVendor] = React.useState<MarketplaceVendorDto | null>(null);

    const [marketplaceVendors, setMarketplaceVendors] = React.useState<MarketplaceVendorDto[]>([]);
    const [isLoadingMarket, setIsLoadingMarket] = React.useState(true);
    const [page, setPage] = React.useState(1);
    const [totalMarket, setTotalMarket] = React.useState(0);
    const pageSize = 10;

    React.useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
        return () => clearTimeout(t);
    }, [searchQuery]);

    React.useEffect(() => {
        setIsLoadingMarket(true);
        vendorsApi.getMarketplace(page, pageSize, debouncedQuery, categoryFilter)
            .then(res => {
                setMarketplaceVendors(res.data);
                setTotalMarket(res.total);
            })
            .catch(console.error)
            .finally(() => setIsLoadingMarket(false));
    }, [page, debouncedQuery, categoryFilter]);

    const ALL_CATEGORIES = ["All", ...CATEGORIES];

    // My Vendors state
    const [vendorView, setVendorView] = React.useState<"active" | "blocked">("active");
    const [drawer, setDrawer] = React.useState<{ mode: "create" | "edit"; id?: string } | null>(null);
    const [draft, setDraft] = React.useState(EMPTY);
    const [saving, setSaving] = React.useState(false);
    const [confirmState, setConfirmState] = React.useState<{ title: string; desc: string; onConfirm: () => void } | null>(null);

    // We no longer filter locally, the backend handles it.
    const filteredMarket = marketplaceVendors;

    const sendInvite = async (id: string) => {
        setInvitations((prev) => ({ ...prev, [id]: "pending" }));
        try {
            await vendorsApi.invite(id);
        } catch (e) {
            console.error(e);
            setInvitations((prev) => ({ ...prev, [id]: "none" }));
        }
    };
    // Keep simulateAccept and cancelInvite for visual state for now unless we add endpoints for those on the buyer side
    const simulateAccept = (id: string) => setInvitations((prev) => ({ ...prev, [id]: "accepted" }));
    const cancelInvite = (id: string) => setInvitations((prev) => ({ ...prev, [id]: "none" }));

    
    const activeVendors = store.items.filter((v) => v.status !== "Blocked");
    const blockedVendors = store.items.filter((v) => v.status === "Blocked");
    const vendorList = vendorView === "active" ? activeVendors : blockedVendors;

    const openCreate = () => { setDraft({ ...EMPTY }); setDrawer({ mode: "create" }); };
    const openEdit = (v: VendorRecord) => {
        setDraft({ companyName: v.companyName, category: v.category || CATEGORIES[0], status: v.status });
        setDrawer({ mode: "edit", id: v.id });
    };
    const closeDrawer = () => setDrawer(null);

    const handleSave = async () => {
        if (!drawer) return;
        setSaving(true);
        try {
            if (drawer.mode === "create") await store.create({ companyName: draft.companyName, category: draft.category, status: draft.status });
            else if (drawer.id) await store.update(drawer.id, { companyName: draft.companyName, category: draft.category, status: draft.status });
            closeDrawer();
        } catch (err) { console.error(err); } finally { setSaving(false); }
    };

    const handleArchive = () => {
        if (!drawer?.id) return;
        const target = store.items.find((v) => v.id === drawer.id);
        setConfirmState({
            title: "Block vendor?",
            desc: `Block "${target?.companyName}"? They will be moved to the blocked list.`,
            onConfirm: async () => { await store.archive(drawer.id!); closeDrawer(); },
        });
    };

    return (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
            <PageHeader
                eyebrow="Supply network"
                title="Vendors"
                description="Discover and invite vendors, then manage your active supply relationships."
            />

            {/* Main tabs */}
            <div className="flex gap-1 border-b border-border">
                {([
                    { key: "discover", label: "Discover vendors", desc: "Find and invite new suppliers" },
                    { key: "my-vendors", label: "My vendors", desc: "Manage your connections" },
                ] as const).map((t) => (
                    <button key={t.key} onClick={() => setMainTab(t.key)}
                        className={cn(
                            "flex flex-col items-start border-b-2 px-4 py-2.5 text-left transition-colors",
                            mainTab === t.key ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                        )}>
                        <span className="text-xs font-mono font-semibold uppercase tracking-widest">{t.label}</span>
                        <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                    </button>
                ))}
            </div>

        
            {mainTab === "discover" && (
                <div className="flex flex-col gap-4">
                    {/* Search + filter bar — search left, dropdown right (inline) */}
                    <div className="flex items-center gap-3">
                        {/* Search input — takes all remaining space */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by company name or specialization…"
                                className="h-11 w-full rounded-sm border border-border bg-card pl-9 pr-9 text-sm outline-none focus:border-foreground"
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Category dropdown — fixed width, flush right */}
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="h-11 w-52 shrink-0 rounded-sm border border-border bg-card px-3 text-sm text-foreground outline-none focus:border-foreground appearance-none cursor-pointer pr-8"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                        >
                            {ALL_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>{cat === "All" ? "All Specializations" : cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Result count */}
                    <p className="text-xs text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{totalMarket}</span> vendors
                        {debouncedQuery && <> matching <span className="font-semibold text-foreground">"{debouncedQuery}"</span></>}
                    </p>

                    {/* Vendor rows */}
                    <div className="flex flex-col gap-3">
                        {isLoadingMarket && (
                            <div className="flex items-center justify-center py-12 text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading marketplace...
                            </div>
                        )}
                        {!isLoadingMarket && filteredMarket.map((v) => {
                            const status = invitations[v.id] ?? "none";
                            return (
                                <MarketplaceRow
                                    key={v.id}
                                    vendor={v}
                                    inviteStatus={status}
                                    onInvite={() => sendInvite(v.id)}
                                    onCancelInvite={() => cancelInvite(v.id)}
                                    onAccept={() => simulateAccept(v.id)}
                                    onViewProfile={() => { window.location.href = `/buyer/vendors/${v.id}`; }}
                                />
                            );
                        })}
                        {!isLoadingMarket && filteredMarket.length === 0 && (
                            <div className="rounded-md border border-dashed border-border bg-card/50 py-16 text-center">
                                <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                                <p className="text-sm font-semibold text-foreground">No vendors found</p>
                                <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or category filter.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {totalMarket > pageSize && (
                        <div className="flex items-center justify-between border-t border-border pt-4">
                            <p className="text-xs text-muted-foreground">
                                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalMarket)} of {totalMarket}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={page * pageSize >= totalMarket}
                                    className="rounded-sm border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════════════════ */}
            {/* MY VENDORS TAB                                                 */}
            {/* ══════════════════════════════════════════════════════════════ */}
            {mainTab === "my-vendors" && (
                <>
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
                            {/* Sub-tabs */}
                            <div className="flex gap-1 border-b border-border">
                                {(["active", "blocked"] as const).map((v) => (
                                    <button key={v} onClick={() => setVendorView(v)}
                                        className={cn(
                                            "border-b-2 px-3 py-2 text-xs font-mono uppercase tracking-widest",
                                            vendorView === v ? "border-foreground text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
                                        )}>
                                        {v} ({v === "active" ? activeVendors.length : blockedVendors.length})
                                    </button>
                                ))}
                            </div>

                            {/* Vendor management rows */}
                            <div className="flex flex-col gap-3">
                                {vendorList.map((v) => (
                                    <ManagedVendorRow
                                        key={v.id}
                                        vendor={v}
                                        canManage={canManage}
                                        onEdit={() => openEdit(v)}
                                        onBlock={() => setConfirmState({
                                            title: "Block vendor?",
                                            desc: `Block "${v.companyName}"? They will be removed from your active supply list.`,
                                            onConfirm: () => store.archive(v.id),
                                        })}
                                    />
                                ))}
                                {vendorList.length === 0 && (
                                    <div className="rounded-md border border-dashed border-border bg-card/50 py-16 text-center">
                                        <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
                                        <p className="text-sm font-semibold text-foreground">No vendors here yet</p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {vendorView === "active"
                                                ? "Invite vendors from the Discover tab to build your supply network."
                                                : "No blocked vendors."}
                                        </p>
                                        {vendorView === "active" && (
                                            <button onClick={() => setMainTab("discover")}
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-sm bg-foreground px-4 py-2 text-xs font-semibold text-background hover:opacity-85">
                                                <Search className="h-3.5 w-3.5" /> Go to Discover
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ── Vendor Profile Modal ── */}
            {profileVendor && (
                <VendorProfileModal
                    vendor={profileVendor}
                    inviteStatus={invitations[profileVendor.id] ?? "none"}
                    onClose={() => setProfileVendor(null)}
                    onInvite={() => { sendInvite(profileVendor.id); setProfileVendor(null); }}
                />
            )}

            {/* ── CRUD Drawer ── */}
            <CrudDrawer
                open={drawer !== null}
                mode={drawer?.mode ?? null}
                title={drawer?.mode === "create" ? "Add vendor" : draft.companyName || "Edit vendor"}
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
                        <SelectOrCustom
                            value={draft.category}
                            options={CATEGORIES}
                            onChange={(val) => setDraft({ ...draft, category: val })}
                            addLabel="+ Other category…"
                            placeholder="Type category…"
                        />
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

            {/* ── Confirm Dialog ── */}
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

// ─── Marketplace Row ──────────────────────────────────────────────────────────

function MarketplaceRow({
    vendor: v,
    inviteStatus,
    onInvite,
    onCancelInvite,
    onAccept,
    onViewProfile,
}: {
    vendor: MarketplaceVendorDto;
    inviteStatus: InviteStatus;
    onInvite: () => void;
    onCancelInvite: () => void;
    onAccept: () => void;
    onViewProfile: () => void;
}) {
    return (
        <div className={cn(
            "flex items-center gap-5 rounded-md border bg-card px-5 py-4 transition-all",
            inviteStatus === "accepted" ? "border-emerald-300 bg-emerald-50/40" : "border-border hover:border-foreground/30 hover:shadow-sm",
        )}>
            {/* Avatar */}
            <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-md font-mono text-base font-bold text-white",
                    v.avatarColor,
                )}>
                    {v.initials}
                </div>
                <span className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">No Image Yet</span>
            </div>

            {/* Main info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-extrabold leading-tight">{v.companyName}</span>
                    {v.verified && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-sky-700">
                            <BadgeCheck className="h-2.5 w-2.5" /> Verified
                        </span>
                    )}
                    {inviteStatus === "accepted" && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-emerald-700">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Connected
                        </span>
                    )}
                    {inviteStatus === "pending" && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-amber-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-amber-700">
                            <Clock className="h-2.5 w-2.5" /> Invite sent
                        </span>
                    )}
                </div>

                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono uppercase tracking-wider">{v.category}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1"><MapPin className="h-2.5 w-2.5" />{v.location}</span>
                    <span>·</span>
                    <span>{v.yearsActive}y in business</span>
                </div>

                <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{v.description}</p>

                {/* Tags */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                    {v.tags.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-sm border border-border bg-muted px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                            <Package className="h-2 w-2" />{tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="hidden shrink-0 flex-col gap-2 text-center sm:flex" style={{ minWidth: "5rem" }}>
                <div>
                    <div className="inline-flex items-center gap-1 font-semibold text-sm">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {v.rating.toFixed(1)}
                    </div>
                    <div className="font-mono text-[9px] text-muted-foreground">{v.reviewCount} reviews</div>
                </div>
                <div>
                    <div className="text-sm font-bold text-emerald-700">{v.onTimeRate}%</div>
                    <div className="font-mono text-[9px] text-muted-foreground">On-time</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 flex-col gap-2">
                <button
                    onClick={onViewProfile}
                    className="inline-flex items-center justify-center gap-1 rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-foreground hover:text-foreground"
                >
                    <ExternalLink className="h-3 w-3" /> View profile
                </button>

                {inviteStatus === "none" && (
                    <button onClick={onInvite}
                        className="inline-flex items-center justify-center gap-1 rounded-sm bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-85">
                        <Send className="h-3 w-3" /> Invite
                    </button>
                )}
                {inviteStatus === "pending" && (
                    <button onClick={onCancelInvite}
                        className="inline-flex items-center justify-center gap-1 rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100">
                        <X className="h-3 w-3" /> Cancel
                    </button>
                )}
                {inviteStatus === "accepted" && (
                    <button
                        className="inline-flex items-center justify-center gap-1 rounded-sm border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 cursor-default"
                        disabled>
                        <CheckCircle2 className="h-3 w-3" /> Connected
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Managed Vendor Row (My Vendors tab) ─────────────────────────────────────

function ManagedVendorRow({
    vendor: v,
    canManage,
    onEdit,
    onBlock,
}: {
    vendor: VendorRecord;
    canManage: boolean;
    onEdit: () => void;
    onBlock: () => void;
}) {
    return (
        <div className="flex items-center gap-5 rounded-md border border-border bg-card px-5 py-4 hover:border-foreground/30 hover:shadow-sm transition-all">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="flex h-12 w-12 items-center justify-center rounded-md bg-foreground font-mono text-sm font-bold text-background">
                    {v.initials || deriveInitials(v.companyName)}
                </div>
                <span className="text-[8px] text-muted-foreground font-mono uppercase tracking-widest">No Image Yet</span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-base font-extrabold">{v.companyName}</span>
                    <AutoStatus status={v.status} />
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span className="font-mono uppercase tracking-wider">{v.category}</span>
                    {v.rating > 0 && (
                        <>
                            <span>·</span>
                            <span className="inline-flex items-center gap-1">
                                <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                {v.rating.toFixed(1)}
                            </span>
                        </>
                    )}
                    {(v.totalSpend ?? 0) > 0 && (
                        <>
                            <span>·</span>
                            <span>Spend: {formatBuyerCurrency(v.totalSpend ?? 0)}</span>
                        </>
                    )}
                    {(v.onTimeRate ?? 0) > 0 && (
                        <>
                            <span>·</span>
                            <span className="text-emerald-700 font-semibold">{v.onTimeRate}% on-time</span>
                        </>
                    )}
                </div>
            </div>

            {/* Risk badge */}
            {v.riskClass && (
                <div className="hidden shrink-0 flex-col items-center gap-1 sm:flex">
                    <AutoStatus status={v.riskClass} />
                    <span className="font-mono text-[9px] text-muted-foreground">Risk</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2">
                {/* Message — redirects to messaging module */}
                <a
                    href={`/buyer/messages?vendor=${v.id}`}
                    className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2 text-xs font-semibold hover:border-foreground hover:text-foreground transition-colors"
                    title="Send a private message to this vendor"
                >
                    <MessageSquare className="h-3.5 w-3.5" /> Message
                </a>

                {v.status === "Accredited" && (
                    <button className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-85">
                        <Send className="h-3 w-3" /> Invite to RFQ
                    </button>
                )}

                {canManage && (
                    <>
                        <button onClick={onEdit}
                            className="inline-flex h-8 items-center gap-1 rounded-sm border border-border bg-card px-2 text-[10px] font-semibold hover:border-foreground">
                            <Pencil className="h-3 w-3" />
                        </button>
                        {v.status !== "Blocked" && (
                            <button onClick={onBlock}
                                className="inline-flex h-8 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2 text-[10px] font-semibold text-rose-700 hover:bg-rose-100">
                                <Archive className="h-3 w-3" />
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ─── Vendor Profile Modal ─────────────────────────────────────────────────────

function VendorProfileModal({
    vendor: v,
    inviteStatus,
    onClose,
    onInvite,
}: {
    vendor: MarketplaceVendorDto;
    inviteStatus: InviteStatus;
    onClose: () => void;
    onInvite: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xl overflow-hidden rounded-md border border-border bg-card shadow-2xl">
                {/* Header */}
                <div className="flex items-start gap-4 border-b border-border bg-muted px-6 py-5">
                    <div className="flex flex-col items-center gap-1">
                        <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-md font-mono text-lg font-bold text-white", v.avatarColor)}>
                            {v.initials}
                        </div>
                        <span className="text-[9px] text-muted-foreground whitespace-nowrap">No image yet</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="font-display text-xl font-extrabold">{v.companyName}</h2>
                            {v.verified && (
                                <span className="inline-flex items-center gap-1 rounded-sm bg-sky-100 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-sky-700">
                                    <BadgeCheck className="h-2.5 w-2.5" /> Verified
                                </span>
                            )}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono uppercase tracking-wider">{v.category}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.location}</span>
                            <span>·</span>
                            <span>{v.yearsActive} years active</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-5 px-6 py-5">
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>

                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3">
                        {[
                            { label: "Rating", value: v.rating.toFixed(1), sub: `${v.reviewCount} reviews`, icon: <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> },
                            { label: "On-time", value: `${v.onTimeRate}%`, sub: "delivery rate", icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" /> },
                            { label: "Min. order", value: formatBuyerCurrency(v.minOrderValue), sub: "per PO", icon: <Package className="h-4 w-4 text-muted-foreground" /> },
                            { label: "Accredited", value: v.verified ? "Yes" : "No", sub: "by system", icon: <ShieldCheck className="h-4 w-4 text-sky-600" /> },
                        ].map((s) => (
                            <div key={s.label} className="rounded-sm border border-border bg-muted/50 p-3 text-center">
                                <div className="mb-1 flex justify-center">{s.icon}</div>
                                <div className="font-mono text-sm font-bold">{s.value}</div>
                                <div className="font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Products / tags */}
                    <div>
                        <div className="t-label mb-2">Products & services</div>
                        <div className="flex flex-wrap gap-1.5">
                            {v.tags.map((tag) => (
                                <span key={tag} className="inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1 text-xs font-semibold">
                                    <Package className="h-3 w-3 text-muted-foreground" />{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted px-6 py-3">
                    <button onClick={onClose}
                        className="h-9 rounded-sm border border-border bg-card px-4 text-xs font-semibold hover:bg-muted">
                        Close
                    </button>
                    {inviteStatus === "none" && (
                        <button onClick={onInvite}
                            className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-foreground px-4 text-xs font-semibold text-background hover:opacity-85">
                            <Send className="h-3.5 w-3.5" /> Send invitation
                        </button>
                    )}
                    {inviteStatus === "pending" && (
                        <span className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-amber-300 bg-amber-50 px-4 text-xs font-semibold text-amber-700">
                            <Clock className="h-3.5 w-3.5" /> Invitation pending
                        </span>
                    )}
                    {inviteStatus === "accepted" && (
                        <span className="inline-flex h-9 items-center gap-1.5 rounded-sm border border-emerald-300 bg-emerald-50 px-4 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Already connected
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
