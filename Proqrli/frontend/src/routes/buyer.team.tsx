/* eslint-disable prettier/prettier */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { teamApi, type TeamMember, type InvitePayload } from "@/lib/api";
import { BUYER_ROLE_LABELS, type BuyerRole } from "@/lib/buyer-mock-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Users, Mail, UserPlus, ShieldAlert, Trash2,
    ChevronDown, Loader2, AlertCircle, CheckCircle2,
    X, Ban, AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBuyer } from "@/lib/buyer-context";

export const Route = createFileRoute("/buyer/team")({
    component: () => (
        <BuyerPermissionGate permission={["team:view", "team:manage"]}>
            <TeamPage />
        </BuyerPermissionGate>
    ),
});

const ROLES: { value: BuyerRole; label: string }[] = [
    { value: "buyer_procurement", label: BUYER_ROLE_LABELS["buyer_procurement"] },
    { value: "buyer_approver", label: BUYER_ROLE_LABELS["buyer_approver"] },
    { value: "buyer_finance", label: BUYER_ROLE_LABELS["buyer_finance"] },
    { value: "buyer_inventory", label: BUYER_ROLE_LABELS["buyer_inventory"] },
    { value: "buyer_warehouse", label: BUYER_ROLE_LABELS["buyer_warehouse"] },
    { value: "buyer_requester", label: BUYER_ROLE_LABELS["buyer_requester"] },
];

// ─── Toast System ────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning";

interface Toast {
    id: string;
    type: ToastType;
    message: string;
}

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={cn(
                        "flex items-start gap-3 rounded-md border px-4 py-3 text-sm shadow-lg animate-in slide-in-from-right-5 duration-200",
                        t.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-800",
                        t.type === "error" && "border-rose-200 bg-rose-50 text-rose-800",
                        t.type === "warning" && "border-amber-200 bg-amber-50 text-amber-800",
                    )}
                >
                    {t.type === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />}
                    {t.type === "error" && <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600" />}
                    {t.type === "warning" && <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />}
                    <span className="flex-1 leading-snug">{t.message}</span>
                    <button onClick={() => onDismiss(t.id)} className="flex-shrink-0 opacity-50 hover:opacity-100">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
    );
}

function useToast() {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const push = React.useCallback((type: ToastType, message: string) => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, type, message }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
    }, []);

    const dismiss = React.useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, dismiss, toast: { success: (m: string) => push("success", m), error: (m: string) => push("error", m), warning: (m: string) => push("warning", m) } };
}

// ─── Confirmation Dialog ─────────────────────────────────────────────────────

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    confirmVariant?: "danger" | "warning";
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

function ConfirmDialog({
    open, title, description, confirmLabel = "Confirm",
    confirmVariant = "danger", onConfirm, onCancel, isLoading,
}: ConfirmDialogProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onCancel}
            />
            {/* Dialog */}
            <div className="relative z-10 w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl mx-4">
                <div className="flex items-start gap-3 p-5">
                    <div className={cn(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                        confirmVariant === "danger" && "bg-rose-100",
                        confirmVariant === "warning" && "bg-amber-100",
                    )}>
                        {confirmVariant === "danger" && <Trash2 className="h-4 w-4 text-rose-600" />}
                        {confirmVariant === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
                    </div>
                    <button onClick={onCancel} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="h-8 rounded-sm border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                        Go back
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={cn(
                            "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold disabled:opacity-50",
                            confirmVariant === "danger" && "bg-rose-600 text-white hover:bg-rose-700",
                            confirmVariant === "warning" && "bg-amber-500 text-white hover:bg-amber-600",
                        )}
                    >
                        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

function TeamPage() {
    const { hasPermission } = useBuyer();
    const queryClient = useQueryClient();
    const { toasts, dismiss, toast } = useToast();

    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [form, setForm] = React.useState<InvitePayload>({ email: "", role: "buyer_procurement" });

    // Confirm dialog state
    const [confirm, setConfirm] = React.useState<{
        open: boolean;
        memberId: number | null;
        isPending: boolean;
        name: string;
    }>({ open: false, memberId: null, isPending: false, name: "" });

    const { data: members = [], isLoading } = useQuery({
        queryKey: ["team-members"],
        queryFn: teamApi.list,
    });

    const inviteMutation = useMutation({
        mutationFn: teamApi.invite,
        onSuccess: (res) => {
            toast.success(res.message + (res.devPassword ? ` (Dev password: ${res.devPassword})` : ""));
            setForm({ email: "", role: "buyer_procurement" });
            setInviteOpen(false);
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) =>
            teamApi.updateRole(userId, role),
        onSuccess: () => {
            toast.success("Role updated successfully.");
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
        onError: (err: Error) => toast.error(err.message),
    });

    const removeMutation = useMutation({
        mutationFn: teamApi.remove,
        onSuccess: (_, userId) => {
            const wasPending = confirm.isPending;
            toast.success(wasPending ? "Invitation cancelled." : "Team member deactivated.");
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
            setConfirm({ open: false, memberId: null, isPending: false, name: "" });
        },
        onError: (err: Error) => {
            toast.error(err.message);
            setConfirm((prev) => ({ ...prev, open: false }));
        },
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.email?.includes("@")) {
            toast.error("Enter a valid email address.");
            return;
        }
        inviteMutation.mutate(form);
    };

    const openConfirm = (member: TeamMember) => {
        setConfirm({
            open: true,
            memberId: member.userId,
            isPending: !!member.mustChangePassword,
            name: member.fullName || member.email,
        });
    };

    const handleConfirmAction = () => {
        if (confirm.memberId !== null) {
            removeMutation.mutate(confirm.memberId);
        }
    };

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <PageHeader
                title="Team"
                description="Invite members and manage their roles in your workspace."
            />

            {/* Invite section */}
            <div className="rounded-md border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
                    </div>
                    {hasPermission("team:manage") && (
                        <button
                            onClick={() => setInviteOpen((v) => !v)}
                            className="inline-flex items-center gap-2 rounded-sm bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-85"
                        >
                            <UserPlus className="h-3.5 w-3.5" />
                            Invite member
                        </button>
                    )}
                </div>

                {inviteOpen && (
                    <form onSubmit={handleInvite} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-foreground">Email</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                placeholder="colleague@company.com"
                                className="h-9 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-foreground">Role</label>
                            <select
                                value={form.role}
                                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                                className="h-9 rounded-sm border border-border bg-card px-2 text-sm outline-none focus:border-foreground"
                            >
                                {ROLES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-foreground">Full name</label>
                            <input
                                type="text"
                                value={form.fullName ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                                placeholder="Optional"
                                className="h-9 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-xs font-semibold text-foreground">Position</label>
                            <input
                                type="text"
                                value={form.position ?? ""}
                                onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                                placeholder="Optional"
                                className="h-9 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
                            />
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-2">
                            <button
                                type="submit"
                                disabled={inviteMutation.isPending}
                                className="inline-flex h-9 items-center gap-2 rounded-sm bg-foreground px-4 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50"
                            >
                                {inviteMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                                Send invitation
                            </button>
                            <button
                                type="button"
                                onClick={() => setInviteOpen(false)}
                                className="h-9 rounded-sm border border-border px-4 text-xs font-semibold text-muted-foreground hover:text-foreground"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Members table */}
            <div className="rounded-md border border-border bg-card">
                {isLoading ? (
                    <div className="p-12 text-center text-sm text-muted-foreground">Loading team…</div>
                ) : members.length === 0 ? (
                    <div className="p-12 text-center text-sm text-muted-foreground">
                        No team members yet. Invite your first colleague above.
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Member</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                                {hasPermission("team:manage") && (
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {members.map((m) => (
                                <TeamMemberRow
                                    key={m.userId}
                                    member={m}
                                    canManage={hasPermission("team:manage")}
                                    onUpdateRole={(role) => updateRoleMutation.mutate({ userId: m.userId, role })}
                                    onAction={() => openConfirm(m)}
                                    isUpdating={updateRoleMutation.isPending}
                                    isRemoving={removeMutation.isPending && confirm.memberId === m.userId}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={confirm.open}
                title={confirm.isPending ? "Cancel Invitation" : "Deactivate Team Member"}
                description={
                    confirm.isPending
                        ? `Cancel the pending invitation for "${confirm.name}"? They won't be able to join using the invite link.`
                        : `Deactivate "${confirm.name}"? They will lose access to this workspace immediately, but their data history will be kept.`
                }
                confirmLabel={confirm.isPending ? "Cancel Invite" : "Deactivate Member"}
                confirmVariant={confirm.isPending ? "warning" : "danger"}
                onConfirm={handleConfirmAction}
                onCancel={() => setConfirm({ open: false, memberId: null, isPending: false, name: "" })}
                isLoading={removeMutation.isPending}
            />

            {/* Toast Notifications */}
            <ToastContainer toasts={toasts} onDismiss={dismiss} />
        </div>
    );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function TeamMemberRow({
    member,
    canManage,
    onUpdateRole,
    onAction,
    isUpdating,
    isRemoving,
}: {
    member: TeamMember;
    canManage: boolean;
    onUpdateRole: (role: string) => void;
    onAction: () => void;
    isUpdating: boolean;
    isRemoving: boolean;
}) {
    const [roleOpen, setRoleOpen] = React.useState(false);
    const roleLabel = BUYER_ROLE_LABELS[member.role as BuyerRole] ?? member.role;
    const isPending = !!member.mustChangePassword;

    return (
        <tr>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-muted font-mono text-xs font-bold text-muted-foreground">
                        {(member.fullName || member.email).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?"}
                    </div>
                    <div>
                        <div className="font-semibold text-foreground">
                            {member.fullName || member.email}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {member.email}
                        </div>
                        {member.position && (
                            <div className="text-xs text-muted-foreground">{member.position}</div>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3">
                <div className={cn("relative inline-block", roleOpen && "z-20")}>
                    <button
                        onClick={() => { if (canManage) setRoleOpen((v) => !v); }}
                        disabled={isUpdating || !canManage}
                        className={cn(
                            "inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs font-semibold hover:border-foreground disabled:opacity-50",
                            !canManage && "cursor-default border-transparent bg-transparent px-0"
                        )}
                    >
                        {roleLabel}
                        {canManage && <ChevronDown className="h-3 w-3" />}
                    </button>
                    {roleOpen && (
                        <div className="absolute z-10 mt-1 w-48 rounded-sm border border-border bg-card shadow-md">
                            {ROLES.map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => { onUpdateRole(r.value); setRoleOpen(false); }}
                                    className={cn(
                                        "block w-full px-3 py-2 text-left text-xs hover:bg-muted",
                                        r.value === member.role && "font-semibold bg-muted"
                                    )}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </td>
            <td className="px-4 py-3">
                {isPending ? (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                        <ShieldAlert className="h-3 w-3" />
                        Pending invite
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 rounded-sm bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                    </span>
                )}
            </td>
            {canManage && (
                <td className="px-4 py-3 text-right">
                    {isPending ? (
                        // Pending → show "Cancel Invite" in amber
                        <button
                            onClick={onAction}
                            disabled={isRemoving}
                            className="inline-flex items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50"
                        >
                            {isRemoving
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Ban className="h-3 w-3" />
                            }
                            Cancel Invite
                        </button>
                    ) : (
                        // Active → show "Deactivate" in red
                        <button
                            onClick={onAction}
                            disabled={isRemoving}
                            className="inline-flex items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                        >
                            {isRemoving
                                ? <Loader2 className="h-3 w-3 animate-spin" />
                                : <Ban className="h-3 w-3" />
                            }
                            Deactivate
                        </button>
                    )}
                </td>
            )}
        </tr>
    );
}