import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BuyerPermissionGate } from "@/components/BuyerPermissionGate";
import { BUYER_CONVERSATIONS } from "@/lib/buyer-mock-data";
import { cn } from "@/lib/utils";
import { Pin, Send } from "lucide-react";

export const Route = createFileRoute("/buyer/messages")({
  component: () => (
    <BuyerPermissionGate permission="messages:view">
      <MessagesPage />
    </BuyerPermissionGate>
  ),
});

function MessagesPage() {
  const [openId, setOpenId] = React.useState(BUYER_CONVERSATIONS[0].id);
  const open = BUYER_CONVERSATIONS.find((c) => c.id === openId)!;

  return (
    <div className="mx-auto flex h-[calc(100vh-160px)] max-w-7xl gap-4">
      <aside className="hidden w-[320px] flex-shrink-0 overflow-y-auto rounded-md border border-border bg-card md:block">
        <div className="border-b border-border px-4 py-4">
          <div className="t-label">Conversations</div>
          <input placeholder="Search vendor…" className="mt-2 h-9 w-full rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" />
        </div>
        <ul>
          {BUYER_CONVERSATIONS.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => setOpenId(c.id)}
                className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors", openId === c.id ? "bg-muted" : "hover:bg-muted/40")}
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">{c.initials}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold">{c.vendorName}</span>
                    {c.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
                  </div>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{c.preview}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] text-muted-foreground">{c.lastAt}</div>
                  {c.unread > 0 && <span className="mt-1 inline-block rounded-full bg-foreground px-2 py-[1px] font-mono text-[10px] font-bold text-background">{c.unread}</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex flex-1 flex-col rounded-md border border-border bg-card">
        <header className="border-b border-border px-5 py-4">
          <div className="font-display text-lg font-extrabold">{open.vendorName}</div>
          <div className="t-label">Vendor · accredited supplier</div>
        </header>
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {open.messages.map((m, i) => (
            <div key={i} className={cn("flex", m.from === "buyer" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[70%] rounded-md px-4 py-2 text-sm", m.from === "buyer" ? "bg-foreground text-background" : "bg-muted")}>
                <p>{m.text}</p>
                <div className={cn("mt-1 font-mono text-[10px]", m.from === "buyer" ? "text-background/60" : "text-muted-foreground")}>{m.at}</div>
              </div>
            </div>
          ))}
        </div>
        <footer className="border-t border-border p-4">
          <div className="flex gap-2">
            <input placeholder="Type a message…" className="h-10 flex-1 rounded-sm border border-border bg-paper px-3 text-sm outline-none focus:border-foreground" />
            <button className="inline-flex h-10 items-center gap-2 rounded-sm bg-foreground px-4 text-sm font-semibold text-background hover:opacity-85">
              Send <Send className="h-4 w-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
