import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PermissionGate } from "@/components/PermissionGate";
import { REVIEWS } from "@/lib/mock-data";

export const Route = createFileRoute("/vendor/reviews")({
  component: () => (
    <PermissionGate permission="reviews:view">
      <ReviewsPage />
    </PermissionGate>
  ),
});

function ReviewsPage() {
  const avg = REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length;
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader eyebrow="Engage" title="Reviews" description="What buyers say about your products and service." />
      <div className="rounded-md border border-border bg-card p-6">
        <div className="flex items-center gap-6">
          <div>
            <div className="font-display text-5xl font-extrabold">{avg.toFixed(1)}</div>
            <div className="mt-1 flex text-amber-400">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={i < Math.round(avg) ? "h-4 w-4 fill-amber-400" : "h-4 w-4 text-muted"} />)}</div>
            <div className="mt-1 text-xs text-muted-foreground">{REVIEWS.length} reviews</div>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = REVIEWS.filter((r) => r.rating === stars).length;
              const pct = (count / REVIEWS.length) * 100;
              return (
                <div key={stars} className="flex items-center gap-2 text-xs">
                  <span className="w-4 font-mono">{stars}★</span>
                  <div className="h-2 flex-1 rounded-sm bg-muted"><div className="h-full rounded-sm bg-foreground" style={{ width: `${pct}%` }} /></div>
                  <span className="w-6 font-mono text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="space-y-3">
        {REVIEWS.map((r) => (
          <div key={r.id} className="rounded-md border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-background">{r.initials}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{r.buyerName}</span>
                  <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">on {r.productName} · {r.at}</div>
                <p className="mt-2 text-sm">{r.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
