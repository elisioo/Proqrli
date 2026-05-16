import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { AutoStatus } from "@/components/StatusPill";
import { adminApi, type AdminUser } from "@/lib/api";
import { Search, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await adminApi.users(q));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = window.setTimeout(load, 200);
    return () => window.clearTimeout(id);
  }, [q]);

  const toggleUser = async (user: AdminUser) => {
    const scope = user.scope === "Platform" ? "platform" : "tenant";
    await adminApi.updateUserStatus(scope, user.userId, user.status !== "Active");
    await load();
  };

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <PageHeader
        eyebrow="Identity & access"
        title="Users & roles"
        description="Platform admins and tenant users, loaded from PlatformUser, TenantUser, and Role."
        actions={
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-sm bg-foreground px-3 py-2 text-[12.5px] font-medium text-background hover:opacity-90">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        }
      />

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search users, tenants, roles..."
          className="w-full rounded-sm border border-border bg-card py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
        />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40 text-left font-mono text-[10px] uppercase tracking-[0.12em] text-ink-muted">
            <tr>
              <th className="px-4 py-2 font-semibold">User</th>
              <th className="px-4 py-2 font-semibold">Tenant</th>
              <th className="px-4 py-2 font-semibold">Role</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold">Created</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground font-display text-[11px] font-bold text-paper">
                      {initials(u.name)}
                    </span>
                    <div>
                      <div className="font-medium">{u.name}</div>
                      <div className="font-mono text-[11px] text-ink-muted">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[12.5px]">{u.tenantName}</td>
                <td className="px-4 py-3">
                  <span className="rounded-sm border border-border bg-muted px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3"><AutoStatus status={u.status === "Invited" ? "Pending" : u.status} /></td>
                <td className="px-4 py-3 text-[12.5px] text-ink-muted">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => toggleUser(u)} className="rounded-sm border border-border px-2 py-1 text-[11px] hover:bg-muted">
                    {u.status === "Active" ? "Suspend" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
            {(loading || error || users.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-muted">
                  {loading ? "Loading users..." : error ?? "No users match your filters."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name.split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}
