/* eslint-disable prettier/prettier */
import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { PageHeader } from "@/components/PageHeader";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { notificationsApi, type NotificationDto } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Bell, CheckCircle2, Info, AlertTriangle, XCircle, ArrowRight, Loader2 } from "lucide-react";

export const Route = createFileRoute("/buyer/notifications")({
    component: () => (
        <BuyerPermissionGate permission="dashboard:view">
            <NotificationsPage />
        </BuyerPermissionGate>
    ),
});

function NotificationsPage() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: notificationsApi.getAll,
        refetchInterval: 10000, // Refresh every 10 seconds for "real-time" feel
    });

    const readAllMutation = useMutation({
        mutationFn: notificationsApi.markAllAsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const readOneMutation = useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    return (
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
            <PageHeader
                eyebrow="Activity"
                title="Notifications"
                description="Stay updated on procurement actions, approvals, and system alerts."
                actions={
                    <button 
                        onClick={() => readAllMutation.mutate()}
                        disabled={readAllMutation.isPending || notifications.every(n => n.read)}
                        className="inline-flex h-9 items-center gap-2 rounded-sm border border-border bg-card px-3 text-xs font-semibold hover:bg-paper-mid disabled:opacity-50"
                    >
                        {readAllMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        Mark all as read
                    </button>
                }
            />

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                    <Loader2 className="mb-3 h-8 w-8 animate-spin opacity-20" />
                    <p className="text-sm">Fetching activity feed...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {notifications.map((n) => (
                        <NotificationRow key={n.id} notification={n} onRead={() => !n.read && readOneMutation.mutate(n.id)} />
                    ))}
                    {notifications.length === 0 && (
                        <div className="py-20 text-center text-muted-foreground">
                            <Bell className="mx-auto mb-3 h-8 w-8 opacity-20" />
                            <p>No activity yet</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function NotificationRow({ notification: n, onRead }: { notification: NotificationDto; onRead: () => void }) {
    const icons = {
        info: <Info className="h-4 w-4 text-sky-600" />,
        success: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
        warning: <AlertTriangle className="h-4 w-4 text-amber-600" />,
        error: <XCircle className="h-4 w-4 text-rose-600" />,
    };

    const bgs = {
        info: "bg-sky-50 border-sky-100",
        success: "bg-emerald-50 border-emerald-100",
        warning: "bg-amber-50 border-amber-100",
        error: "bg-rose-50 border-rose-100",
    };

    return (
        <div 
            onClick={onRead}
            className={cn(
                "group flex items-start gap-4 rounded-md border p-4 transition-all hover:shadow-sm cursor-pointer",
                n.read ? "bg-card border-border opacity-80" : bgs[n.type as keyof typeof bgs] || "bg-card border-border shadow-[0_0_10px_rgba(0,0,0,0.02)]"
            )}
        >
            <div className={cn(
                "mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                n.read ? "bg-muted" : "bg-white"
            )}>
                {icons[n.type as keyof typeof icons]}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <h4 className="truncate font-display text-sm font-extrabold text-foreground">{n.title}</h4>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{n.at}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                {n.link && (
                    <Link 
                        to={n.link} 
                        className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-foreground hover:underline"
                    >
                        View details <ArrowRight className="h-3 w-3" />
                    </Link>
                )}
            </div>
            {!n.read && (
                <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-rose-500 animate-pulse" />
            )}
        </div>
    );
}
