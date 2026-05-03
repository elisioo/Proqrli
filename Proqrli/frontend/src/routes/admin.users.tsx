import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { PLATFORM_USERS, TENANTS } from "@/lib/admin-mock-data";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

const tenantName = (id: string | null) =>
  id == null ? "— Platform —" : TENANTS.find((t) => t.id === id)?.name ?? id;

function UsersPage() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Identity & access"
        title="Users & roles"
        description="All platform-level admins plus tenant administrators. Reset, suspend, or reassign roles."
        actions={
          <button className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-[12.5px] font-medium text-background hover:opacity-90">
            <Plus className="h-3.5 w-3.5" />
            Invite admin
          </button>
        }
      />

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">User</th>
              <th className="px-4 py-2 font-semibold">Tenant</th>
              <th className="px-4 py-2 font-semibold">Role</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Last seen</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PLATFORM_USERS.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-display text-[11px] font-bold text-paper">
                      {u.name.split(" ").map((s) => s[0]).join("").slice(0, 2)}
                    </span>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="font-mono text-[11px] text-ink-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12.5px]">{tenantName(u.tenantId)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3"><AutoStatus status={u.status === "Invited" ? "Pending" : u.status} /></td>
                <td className="px-4 py-3 text-[12.5px] text-ink-muted">{u.lastSeen}</td>
                <td className="px-4 py-3 text-right">
                  <button className="rounded-sm border border-border px-2 py-1 text-[11px] hover:bg-muted">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
