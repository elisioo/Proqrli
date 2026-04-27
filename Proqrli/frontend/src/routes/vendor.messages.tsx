import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { Send, Pin } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { CONVERSATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/vendor/messages")({
  component: () => (
    <PermissionGate permission="messages:view">
      <MessagesPage />
    </PermissionGate>
  ),
});

function MessagesPage() {
  const [activeId, setActiveId] = React.useState(CONVERSATIONS[0].id);
  const active = CONVERSATIONS.find((c) => c.id === activeId)!;
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <PageHeader eyebrow="Engage" title="Messages" description="Direct conversations with buyers about orders, deliveries, and quotes." />
      <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-md border border-border bg-card md:grid-cols-[320px_1fr]" style={{ height: "calc(100vh - 280px)", minHeight: 480 }}>
        <div className="overflow-y-auto border-b border-border md:border-b-0 md:border-r">
          {CONVERSATIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={cn("flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-muted", activeId === c.id && "bg-muted")}
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">{c.initials}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{c.buyerName}</span>
                  <span className="text-[10px] text-muted-foreground">{c.lastAt}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-muted-foreground">{c.preview}</p>
                  {c.unread > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-foreground px-1 font-mono text-[9px] font-bold text-background">{c.unread}</span>}
                </div>
              </div>
              {c.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            </button>
          ))}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3 border-b border-border px-5 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">{active.initials}</span>
            <div>
              <div className="font-semibold">{active.buyerName}</div>
              <div className="text-[11px] text-muted-foreground">Buyer · accredited</div>
            </div>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">
            {active.messages.map((m, i) => (
              <div key={i} className={cn("flex", m.from === "vendor" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[75%] rounded-md px-3 py-2 text-sm", m.from === "vendor" ? "bg-foreground text-background" : "bg-muted")}>
                  <div>{m.text}</div>
                  <div className={cn("mt-1 text-[10px]", m.from === "vendor" ? "opacity-60" : "text-muted-foreground")}>{m.at}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-3">
            <input className="h-10 flex-1 rounded-sm border border-border bg-card px-3 text-sm outline-none focus:border-foreground" placeholder="Type a message..." />
            <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-medium text-background hover:opacity-85">
              <Send className="h-4 w-4" /> Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
