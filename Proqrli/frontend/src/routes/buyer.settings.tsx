/* eslint-disable prettier/prettier */
import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { useBuyer } from "@/lib/buyer-context";
import { BUYER_ROLE_LABELS, BUYER_ROLE_DESCRIPTIONS, type BuyerRole } from "@/lib/buyer-mock-data";
import { THEME_PRESETS } from "@/lib/themes";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, Search, Loader2, Download, RefreshCw } from "lucide-react";
import { settingsApi, teamApi, type TenantSettingsDto, type AuditLogEntryDto } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/buyer/settings")({
  component: () => (
    <BuyerPermissionGate permission="settings:view">
      <SettingsPage />
    </BuyerPermissionGate>
  ),
});


function formatPHTime(ts: string): string {
  const utc = ts.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(ts) ? ts : ts + "Z";
  return new Date(utc).toLocaleString("en-PH", {
    timeZone: "Asia/Manila",
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
}

/** Export the current page of logs as a downloadable CSV file. */
function exportCsv(logs: AuditLogEntryDto[]) {
  const header = ["Timestamp (Asia/Manila)", "User", "Role", "Action", "Module", "Entity ID", "IP Address"];
  const rows = logs.map((l) => [
    formatPHTime(l.timestamp),
    l.userName,
    l.role.replace("buyer_", "").replace(/_/g, " "),
    l.action,
    l.module,
    l.entityId ?? "",
    l.ipAddress,
  ]);
  const csv = [header, ...rows]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function SettingsPage() {
  const { tenant, themeId, setThemeId, accent, setAccent, hasPermission } = useBuyer();
  const queryClient = useQueryClient();

  // Debounced audit log search (400 ms) — avoids an API call per keystroke
  const [logSearchInput, setLogSearchInput] = React.useState("");
  const [logSearch, setLogSearch] = React.useState("");
  const [logPage, setLogPage] = React.useState(1);
  const logPageSize = 10;

  React.useEffect(() => {
    const t = setTimeout(() => {
      setLogSearch(logSearchInput.trim());
      setLogPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [logSearchInput]);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: settings, isLoading: isSettingsLoading } = useQuery({
    queryKey: ["tenant-settings"],
    queryFn: settingsApi.getTenantSettings,
    retry: 1,
  });

  const { data: team = [], isLoading: isTeamLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: teamApi.list,
    enabled: hasPermission("team:view"),
  });

  const {
    data: logsData,
    isLoading: isLogsLoading,
    isError: isLogsError,
  } = useQuery({
    queryKey: ["audit-logs", logSearch, logPage, logPageSize],
    queryFn: () => settingsApi.getAuditLogs(logSearch, logPage, logPageSize),
    enabled: hasPermission("audit_log:view"),
    // Keep showing stale data while new page loads (avoids blank flash)
    placeholderData: (prev) => prev,
  });

  const logs: AuditLogEntryDto[] = logsData?.data ?? [];
  const logTotal = logsData?.total ?? 0;
  const logTotalPages = Math.max(1, Math.ceil(logTotal / logPageSize));

  // ── Settings form ────────────────────────────────────────────────────────

  const [form, setForm] = React.useState<Partial<TenantSettingsDto>>({
    companyName: tenant?.companyName || "",
    contactEmail: tenant?.contactEmail || "",
    industry: tenant?.industry || "",
  });

  React.useEffect(() => {
    if (settings) setForm((prev) => ({ ...prev, ...settings }));
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateTenantSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-settings"] });
      // Immediately refresh audit logs so the new "Updated workspace settings" row appears
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Settings updated successfully");
    },
    onError: (err: Error) => toast.error(`Failed to update settings: ${err.message}`),
  });

  if (isSettingsLoading)
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin opacity-20" />
      </div>
    );

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description={`Configure ${settings?.companyName || tenant?.companyName || "your workspace"} — your team, theme, and integrations.`}
      />

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="flex w-full justify-start gap-2 bg-transparent p-0">
          <TabsTrigger value="profile" className="rounded-sm border border-border data-[state=active]:bg-foreground data-[state=active]:text-background">Profile</TabsTrigger>
          {hasPermission("team:view") && (
            <TabsTrigger value="team" className="rounded-sm border border-border data-[state=active]:bg-foreground data-[state=active]:text-background">Team &amp; RBAC</TabsTrigger>
          )}
          <TabsTrigger value="theme" className="rounded-sm border border-border data-[state=active]:bg-foreground data-[state=active]:text-background">Theme</TabsTrigger>
          {hasPermission("budget:view") && (
            <TabsTrigger value="budget" className="rounded-sm border border-border data-[state=active]:bg-foreground data-[state=active]:text-background">Budget</TabsTrigger>
          )}
          {hasPermission("audit_log:view") && (
            <TabsTrigger value="audit" className="rounded-sm border border-border data-[state=active]:bg-foreground data-[state=active]:text-background">Audit Log</TabsTrigger>
          )}
        </TabsList>

        {/* ── Profile ── */}
        <TabsContent value="profile" className="mt-6">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="t-label mb-4">Company profile</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Company name" value={form.companyName || ""} onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))} />
              <Field label="Industry" value={form.industry || ""} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} />
              <Field label="Procurement email" value={form.contactEmail || ""} onChange={(e) => setForm((f) => ({ ...f, contactEmail: e.target.value }))} />
              <Field label="Tax ID / TIN" value={form.taxId || ""} onChange={(e) => setForm((f) => ({ ...f, taxId: e.target.value }))} />
            </div>
            <button
              onClick={() => updateSettingsMutation.mutate(form)}
              disabled={updateSettingsMutation.isPending}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-50"
            >
              {updateSettingsMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save changes
            </button>
          </div>
        </TabsContent>

        {/* ── Team ── */}
        <TabsContent value="team" className="mt-6">
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <span className="t-label">Team &amp; roles</span>
              {hasPermission("team:manage") && (
                <Link to="/buyer/team" className="inline-flex h-9 items-center rounded-sm bg-foreground px-3 text-xs font-semibold text-background hover:opacity-85">
                  + Invite member
                </Link>
              )}
            </div>
            {isTeamLoading ? (
              <div className="p-12 text-center text-sm text-muted-foreground">Loading team…</div>
            ) : (
              <ul className="divide-y divide-border">
                {team.map((m) => (
                  <li key={m.userId} className="grid grid-cols-12 items-center gap-3 px-5 py-3">
                    <div className="col-span-4 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">
                        {(m.fullName || m.email).charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <div className="text-sm font-semibold">{m.fullName || m.email}</div>
                        <div className="font-mono text-[10px] text-muted-foreground">{m.email}</div>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-muted-foreground">{m.position || "N/A"}</div>
                    <div className="col-span-3">
                      <RolePill role={m.role as BuyerRole} />
                    </div>
                    <div className="col-span-2 font-mono text-[10px] text-muted-foreground">
                      Joined {formatPHTime(m.createdAt).split(",")[0]}
                    </div>
                    <div className="col-span-1 text-right">
                      <span className={cn("inline-block h-2 w-2 rounded-full", m.isActive ? "bg-emerald-500" : "bg-rose-500")} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="border-t border-border bg-paper-mid p-5">
              <div className="t-label mb-3">Role permission matrix</div>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(BUYER_ROLE_LABELS) as BuyerRole[]).map((r) => (
                  <div key={r} className="rounded-sm border border-border bg-card p-3">
                    <div className="font-display text-sm font-extrabold">{BUYER_ROLE_LABELS[r]}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{BUYER_ROLE_DESCRIPTIONS[r]}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Theme ── */}
        <TabsContent value="theme" className="mt-6">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="t-label mb-4">Marketplace theme</div>
            <p className="mb-6 text-sm text-muted-foreground">
              Choose how your procurement workspace feels. Picks a coordinated accent across charts, buttons, and badges.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {THEME_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { setThemeId(p.id); toast.success(`Theme switched to ${p.name}`); }}
                  className={cn("flex flex-col gap-3 rounded-md border-2 p-4 text-left transition-all hover:shadow-sm", themeId === p.id ? "border-foreground" : "border-border")}
                >
                  <div className="flex h-12 w-full rounded-sm" style={{ background: p.accent }} />
                  <div>
                    <div className="font-display text-base font-extrabold">{p.name}</div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-6 border-t border-border pt-6">
              <div className="t-label mb-3">Custom accent</div>
              <div className="flex items-center gap-3">
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-12 w-20 cursor-pointer rounded-sm border border-border bg-transparent p-0" />
                <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} className="h-11 w-44 rounded-sm border border-border bg-paper px-3 font-mono text-sm uppercase outline-none focus:border-foreground" />
                <span className="rounded-sm px-3 py-2 text-sm font-semibold" style={{ background: "var(--accent-solid)", color: "var(--accent-foreground-solid)" }}>Preview button</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Budget ── */}
        <TabsContent value="budget" className="mt-6">
          <div className="rounded-md border border-border bg-card p-6">
            <div className="t-label mb-4">FY budget controls</div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Annual procurement budget" type="number" value={form.annualBudget || ""} onChange={(e) => setForm((f) => ({ ...f, annualBudget: Number(e.target.value) }))} />
              <Field label="PO approval threshold" type="number" value={form.poApprovalThreshold || ""} onChange={(e) => setForm((f) => ({ ...f, poApprovalThreshold: Number(e.target.value) }))} />
              <Field label="Bill auto-pay limit" type="number" value={form.billAutoPayLimit || ""} onChange={(e) => setForm((f) => ({ ...f, billAutoPayLimit: Number(e.target.value) }))} />
              <Field label="Required approvers ≥ threshold" type="number" value={form.requiredApprovers || ""} onChange={(e) => setForm((f) => ({ ...f, requiredApprovers: Number(e.target.value) }))} />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              POs over threshold require approval from a member with <span className="font-semibold">Approver</span> or <span className="font-semibold">Owner</span> role.
            </p>
            <button
              onClick={() => updateSettingsMutation.mutate(form)}
              disabled={updateSettingsMutation.isPending}
              className="mt-6 inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85 disabled:opacity-50"
            >
              {updateSettingsMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Save budget controls
            </button>
          </div>
        </TabsContent>

        {/* ── Audit Log ── */}
        {hasPermission("audit_log:view") && (
          <TabsContent value="audit" className="mt-6">
            <div className="rounded-md border border-border bg-card">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4 text-muted-foreground" />
                  <span className="t-label">System Audit Log</span>
                  {logTotal > 0 && (
                    <span className="ml-1 rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                      {logTotal.toLocaleString()} events
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <input
                      placeholder="Search user, action, module…"
                      value={logSearchInput}
                      onChange={(e) => setLogSearchInput(e.target.value)}
                      className="h-8 w-52 rounded-sm border border-border bg-paper pl-8 pr-3 text-[11px] outline-none focus:border-foreground"
                    />
                  </div>
                  <button
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["audit-logs"] })}
                    className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-[11px] font-semibold hover:bg-paper-mid"
                  >
                    <RefreshCw className={cn("h-3 w-3", isLogsLoading && "animate-spin")} />
                    Refresh
                  </button>
                  <button
                    onClick={() => exportCsv(logs)}
                    disabled={logs.length === 0}
                    className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-border bg-card px-3 text-[11px] font-semibold hover:bg-paper-mid disabled:opacity-40"
                  >
                    <Download className="h-3 w-3" />
                    Export CSV
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="overflow-x-auto">
                {isLogsLoading ? (
                  <div className="flex flex-col items-center gap-3 p-20 text-center">
                    <Loader2 className="h-5 w-5 animate-spin opacity-30" />
                    <span className="text-sm text-muted-foreground">Loading audit history…</span>
                  </div>
                ) : isLogsError ? (
                  <div className="p-12 text-center text-sm text-rose-500">
                    Failed to load audit logs — please refresh.
                  </div>
                ) : logs.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 p-16 text-center">
                    <History className="h-8 w-8 opacity-10" />
                    <p className="text-sm font-semibold text-muted-foreground">
                      {logSearch ? "No logs match your search." : "No audit events recorded yet."}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Every login, transaction, and action is automatically logged here for security.
                    </p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      <tr>
                        <th className="whitespace-nowrap px-5 py-3">Timestamp (PH)</th>
                        <th className="px-5 py-3">User</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">Module</th>
                        <th className="whitespace-nowrap px-5 py-3">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.map((log) => (
                        <tr key={log.logID} className="transition-colors hover:bg-muted/40">
                          <td className="whitespace-nowrap px-5 py-3 font-mono text-[11px] text-muted-foreground">
                            {formatPHTime(log.timestamp)}
                          </td>
                          <td className="px-5 py-3">
                            <div className="font-semibold">{log.userName}</div>
                            <div className="text-[10px] capitalize text-muted-foreground">
                              {log.role.replace("buyer_", "").replace(/_/g, " ")}
                            </div>
                          </td>
                          <td className="max-w-xs px-5 py-3">
                            <div className="font-medium text-foreground">{log.action}</div>
                            {log.entityId && (
                              <div className="mt-0.5 font-mono text-[9px] text-muted-foreground">ID: {log.entityId}</div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span className="rounded-sm bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider">
                              {log.module}
                            </span>
                          </td>
                          <td className="px-5 py-3 font-mono text-[10px] text-muted-foreground">
                            {log.ipAddress || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-border bg-paper-mid px-5 py-3">
                <span className="text-[10px] text-muted-foreground">
                  {logTotal > 0 ? (
                    <>
                      Showing{" "}
                      <span className="font-semibold text-foreground">
                        {(logPage - 1) * logPageSize + 1} — {Math.min(logPage * logPageSize, logTotal)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-foreground">{logTotal}</span> events
                    </>
                  ) : (
                    "No events found"
                  )}
                </span>
                {logTotalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLogPage((p) => Math.max(1, p - 1))}
                      disabled={logPage === 1}
                      className="h-7 rounded-sm border border-border px-2.5 text-[11px] font-semibold disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <span className="flex h-7 min-w-[3rem] items-center justify-center rounded-sm border border-border bg-muted px-2 text-[11px] font-semibold">
                      {logPage} / {logTotalPages}
                    </span>
                    <button
                      onClick={() => setLogPage((p) => Math.min(logTotalPages, p + 1))}
                      disabled={logPage >= logTotalPages}
                      className="h-7 rounded-sm border border-border px-2.5 text-[11px] font-semibold disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="t-label mb-2 block">{label}</label>
      <input {...props} className="h-11 w-full rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" />
    </div>
  );
}

function RolePill({ role }: { role: BuyerRole }) {
  const tones: Record<string, string> = {
    buyer_owner: "bg-foreground text-background",
    buyer_procurement: "bg-sky-100 text-sky-800 border border-sky-200",
    buyer_approver: "bg-amber-100 text-amber-800 border border-amber-200",
    buyer_finance: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    inventory_staff: "bg-violet-100 text-violet-800 border border-violet-200",
    inventory_manager: "bg-teal-100 text-teal-800 border border-teal-200",
  };
  return (
    <span className={cn("inline-block rounded-sm px-2 py-[2px] font-mono text-[10px] font-bold uppercase tracking-widest", tones[role] ?? "bg-muted text-muted-foreground")}>
      {BUYER_ROLE_LABELS[role] || role}
    </span>
  );
}
