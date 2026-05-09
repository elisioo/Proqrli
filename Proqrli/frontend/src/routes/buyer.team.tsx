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
    { value: "inventory_staff", label: BUYER_ROLE_LABELS["inventory_staff"] },
    { value: "inventory_manager", label: BUYER_ROLE_LABELS["inventory_manager"] },
];

function TeamPage() {
    const { hasPermission } = useBuyer();
    const queryClient = useQueryClient();
    const [inviteOpen, setInviteOpen] = React.useState(false);
    const [form, setForm] = React.useState<InvitePayload>({ email: "", role: "buyer_procurement" });
    const [error, setError] = React.useState<string | null>(null);
    const [success, setSuccess] = React.useState<string | null>(null);

    const { data: members = [], isLoading } = useQuery({
        queryKey: ["team-members"],
        queryFn: teamApi.list,
    });

    const inviteMutation = useMutation({
        mutationFn: teamApi.invite,
        onSuccess: (res) => {
            setSuccess(res.message + (res.devPassword ? ` (Dev password: ${res.devPassword})` : ""));
            setForm({ email: "", role: "buyer_procurement" });
            setInviteOpen(false);
            queryClient.invalidateQueries({ queryKey: ["team-members"] });
        },
        onError: (err: Error) => setError(err.message),
    });

    const updateRoleMutation = useMutation({
        mutationFn: ({ userId, role }: { userId: number; role: string }) =>
            teamApi.updateRole(userId, role),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members"] }),
        onError: (err: Error) => setError(err.message),
    });

    const removeMutation = useMutation({
        mutationFn: teamApi.remove,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["team-members"] }),
        onError: (err: Error) => setError(err.message),
    });

    const handleInvite = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!form.email?.includes("@")) {
            setError("Enter a valid email address.");
            return;
        }
        inviteMutation.mutate(form);
    };

    return (
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
            <PageHeader
                title="Team"
                description="Invite members and manage their roles in your workspace."
            />

            {/* Alerts */}
            {error && (
                <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
            {success && (
                <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {/* Invite section */}
            <div className="rounded-md border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
                    </div>
                    {hasPermission("team:manage") && (
                        <button
                            onClick={() => { setInviteOpen((v) => !v); setError(null); setSuccess(null); }}
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
                                {hasPermission("team:manage") && <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {members.map((m) => (
                                <TeamMemberRow
                                    key={m.userId}
                                    member={m}
                                    canManage={hasPermission("team:manage")}
                                    onUpdateRole={(role) => updateRoleMutation.mutate({ userId: m.userId, role })}
                                    onDeactivate={() => removeMutation.mutate(m.userId)}
                                    isUpdating={updateRoleMutation.isPending}
                                    isRemoving={removeMutation.isPending}
                                />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

function TeamMemberRow({
    member,
    canManage,
    onUpdateRole,
    onDeactivate,
    isUpdating,
    isRemoving,
}: {
    member: TeamMember;
    canManage: boolean;
    onUpdateRole: (role: string) => void;
    onDeactivate: () => void;
    isUpdating: boolean;
    isRemoving: boolean;
}) {
    const [roleOpen, setRoleOpen] = React.useState(false);
    const roleLabel = BUYER_ROLE_LABELS[member.role as BuyerRole] ?? member.role;

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
                {member.mustChangePassword ? (
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
            <td className="px-4 py-3 text-right">
                {canManage && (
                    <button
                        onClick={onDeactivate}
                        disabled={isRemoving}
                        className="inline-flex items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                    >
                        <Trash2 className="h-3 w-3" />
                        Remove
                    </button>
                )}
            </td>
        </tr>
    );
}
