/* eslint-disable prettier/prettier */
import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { teamApi, type InvitePayload, type TeamMember } from "@/lib/api";
import { ROLE_LABELS, type VendorRole } from "@/lib/mock-data";
import { useVendor } from "@/lib/vendor-context";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Mail,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor/team")({
  component: () => (
    <PermissionGate permission={["team:view", "team:manage"]}>
      <TeamPage />
    </PermissionGate>
  ),
});

const ROLES: { value: VendorRole; label: string }[] = [
  { value: "vendor_owner", label: ROLE_LABELS.vendor_owner },
  { value: "vendor_admin", label: ROLE_LABELS.vendor_admin },
  { value: "vendor_staff", label: ROLE_LABELS.vendor_staff },
  { value: "vendor_finance", label: ROLE_LABELS.vendor_finance },
];

type ConfirmState = {
  open: boolean;
  memberId: number | null;
  isPending: boolean;
  name: string;
};

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmVariant,
  onConfirm,
  onCancel,
  isLoading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative z-10 mx-4 w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-start gap-3 p-5">
          <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", confirmVariant === "danger" ? "bg-rose-100" : "bg-amber-100")}>
            {confirmVariant === "danger" ? <Trash2 className="h-4 w-4 text-rose-600" /> : <AlertTriangle className="h-4 w-4 text-amber-600" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <button onClick={onCancel} className="shrink-0 text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <button onClick={onCancel} disabled={isLoading} className="h-8 rounded-sm border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground disabled:opacity-50">
            Go back
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-sm px-3 text-xs font-semibold text-white disabled:opacity-50",
              confirmVariant === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-500 hover:bg-amber-600",
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

function TeamPage() {
  const { hasPermission } = useVendor();
  const queryClient = useQueryClient();
  const canManage = hasPermission("team:manage");

  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [form, setForm] = React.useState<InvitePayload>({ email: "", role: "vendor_staff" });
  const [editOpen, setEditOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ userId: 0, fullName: "", position: "" });
  const [confirm, setConfirm] = React.useState<ConfirmState>({ open: false, memberId: null, isPending: false, name: "" });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["vendor-team-members"],
    queryFn: teamApi.list,
  });

  const inviteMutation = useMutation({
    mutationFn: teamApi.invite,
    onSuccess: (res) => {
      toast.success(res.message + (res.devPassword ? ` (Dev password: ${res.devPassword})` : ""));
      setForm({ email: "", role: "vendor_staff" });
      setInviteOpen(false);
      queryClient.invalidateQueries({ queryKey: ["vendor-team-members"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => teamApi.updateRole(userId, role),
    onSuccess: () => {
      toast.success("Role updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["vendor-team-members"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMemberMutation = useMutation({
    mutationFn: (body: { userId: number; fullName: string; position: string }) => teamApi.updateMember(body.userId, { fullName: body.fullName, position: body.position }),
    onSuccess: () => {
      toast.success("Team member updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["vendor-team-members"] });
      setEditOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: teamApi.remove,
    onSuccess: () => {
      toast.success(confirm.isPending ? "Invitation cancelled." : "Team member deactivated.");
      queryClient.invalidateQueries({ queryKey: ["vendor-team-members"] });
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

  const openEdit = (member: TeamMember) => {
    setEditForm({ userId: member.userId, fullName: member.fullName ?? "", position: member.position ?? "" });
    setEditOpen(true);
  };

  const openConfirm = (member: TeamMember) => {
    setConfirm({
      open: true,
      memberId: member.userId,
      isPending: !!member.mustChangePassword,
      name: member.fullName || member.email,
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader title="Team" description="Invite vendor teammates and manage their portal roles." />

      <div className="rounded-md border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>{members.length} member{members.length !== 1 ? "s" : ""}</span>
          </div>
          {canManage && (
            <button onClick={() => setInviteOpen((v) => !v)} className="inline-flex items-center gap-2 rounded-sm bg-foreground px-3 py-2 text-xs font-semibold text-background hover:opacity-85">
              <UserPlus className="h-3.5 w-3.5" />
              Invite member
            </button>
          )}
        </div>

        {inviteOpen && (
          <form onSubmit={handleInvite} className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input label="Email" type="email" value={form.email} onChange={(value) => setForm((f) => ({ ...f, email: value }))} placeholder="teammate@vendor.com" required />
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-foreground">Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} className="h-9 rounded-sm border border-border bg-card px-2 text-sm outline-none focus:border-foreground">
                {ROLES.map((role) => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>
            <Input label="Full name" value={form.fullName ?? ""} onChange={(value) => setForm((f) => ({ ...f, fullName: value }))} placeholder="Optional" />
            <Input label="Position" value={form.position ?? ""} onChange={(value) => setForm((f) => ({ ...f, position: value }))} placeholder="Optional" />
            <div className="flex items-center gap-2 sm:col-span-2">
              <button type="submit" disabled={inviteMutation.isPending} className="inline-flex h-9 items-center gap-2 rounded-sm bg-foreground px-4 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50">
                {inviteMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                Send invitation
              </button>
              <button type="button" onClick={() => setInviteOpen(false)} className="h-9 rounded-sm border border-border px-4 text-xs font-semibold text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Loading team...</div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">No team members yet. Invite your first teammate above.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Member</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                {canManage && <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <TeamMemberRow
                  key={member.userId}
                  member={member}
                  canManage={canManage}
                  onUpdateRole={(role) => updateRoleMutation.mutate({ userId: member.userId, role })}
                  onEdit={() => openEdit(member)}
                  onAction={() => openConfirm(member)}
                  isUpdating={updateRoleMutation.isPending}
                  isRemoving={removeMutation.isPending && confirm.memberId === member.userId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative z-10 mx-4 w-full max-w-sm rounded-lg border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="text-sm font-semibold text-foreground">Edit team member</span>
              <button onClick={() => setEditOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); updateMemberMutation.mutate(editForm); }} className="flex flex-col gap-4 p-5">
              <Input label="Full name" value={editForm.fullName} onChange={(value) => setEditForm((f) => ({ ...f, fullName: value }))} required />
              <Input label="Position" value={editForm.position} onChange={(value) => setEditForm((f) => ({ ...f, position: value }))} />
              <div className="mt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setEditOpen(false)} className="h-8 rounded-sm border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground">Cancel</button>
                <button type="submit" disabled={updateMemberMutation.isPending} className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85 disabled:opacity-50">
                  {updateMemberMutation.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title={confirm.isPending ? "Cancel invitation" : "Deactivate team member"}
        description={confirm.isPending ? `Cancel the pending invitation for "${confirm.name}"?` : `Deactivate "${confirm.name}"? They will lose access to this vendor workspace immediately.`}
        confirmLabel={confirm.isPending ? "Cancel invite" : "Deactivate member"}
        confirmVariant={confirm.isPending ? "warning" : "danger"}
        onConfirm={() => confirm.memberId !== null && removeMutation.mutate(confirm.memberId)}
        onCancel={() => setConfirm({ open: false, memberId: null, isPending: false, name: "" })}
        isLoading={removeMutation.isPending}
      />
    </div>
  );
}

function TeamMemberRow({
  member,
  canManage,
  onUpdateRole,
  onEdit,
  onAction,
  isUpdating,
  isRemoving,
}: {
  member: TeamMember;
  canManage: boolean;
  onUpdateRole: (role: string) => void;
  onEdit: () => void;
  onAction: () => void;
  isUpdating: boolean;
  isRemoving: boolean;
}) {
  const [roleOpen, setRoleOpen] = React.useState(false);
  const roleLabel = ROLE_LABELS[member.role as VendorRole] ?? member.role;
  const isPending = !!member.mustChangePassword;

  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-muted font-mono text-xs font-bold text-muted-foreground">
            {(member.fullName || member.email).split(" ").map((word) => word[0]).slice(0, 2).join("").toUpperCase() || "?"}
          </div>
          <div>
            <div className="font-semibold text-foreground">{member.fullName || member.email}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mail className="h-3 w-3" />
              {member.email}
            </div>
            {member.position && <div className="text-xs text-muted-foreground">{member.position}</div>}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={cn("relative inline-block", roleOpen && "z-20")}>
          <button
            onClick={() => canManage && setRoleOpen((v) => !v)}
            disabled={isUpdating || !canManage}
            className={cn("inline-flex items-center gap-1 rounded-sm border border-border bg-card px-2.5 py-1.5 text-xs font-semibold hover:border-foreground disabled:opacity-50", !canManage && "cursor-default border-transparent bg-transparent px-0")}
          >
            {roleLabel}
            {canManage && <ChevronDown className="h-3 w-3" />}
          </button>
          {roleOpen && (
            <div className="absolute z-10 mt-1 w-48 rounded-sm border border-border bg-card shadow-md">
              {ROLES.map((role) => (
                <button
                  key={role.value}
                  onClick={() => { onUpdateRole(role.value); setRoleOpen(false); }}
                  className={cn("block w-full px-3 py-2 text-left text-xs hover:bg-muted", role.value === member.role && "bg-muted font-semibold")}
                >
                  {role.label}
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
          <div className="flex items-center justify-end gap-2">
            <button onClick={onEdit} disabled={isRemoving || isUpdating} className="inline-flex h-7 items-center justify-center rounded-sm border border-border px-3 text-xs font-semibold text-muted-foreground hover:border-foreground hover:text-foreground disabled:opacity-50">
              Edit
            </button>
            <button onClick={onAction} disabled={isRemoving} className={cn("inline-flex items-center gap-1 rounded-sm border px-2.5 py-1.5 text-xs font-semibold disabled:opacity-50", isPending ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100" : "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100")}>
              {isRemoving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Ban className="h-3 w-3" />}
              {isPending ? "Cancel" : "Deactivate"}
            </button>
          </div>
        </td>
      )}
    </tr>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-foreground">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground"
      />
    </div>
  );
}
