import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone = "default",
  className,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  icon?: LucideIcon;
  tone?: "default" | "accent" | "ink";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border p-5 transition-shadow hover:shadow-sm",
        tone === "default" && "border-border bg-card",
        tone === "accent" && "border-transparent bg-accent text-accent-foreground",
        tone === "ink" && "border-transparent bg-foreground text-background",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="t-label" style={tone !== "default" ? { color: "currentColor", opacity: 0.6 } : undefined}>
          {label}
        </span>
        {Icon && <Icon className="h-4 w-4 opacity-60" />}
      </div>
      <div className="font-display text-3xl font-extrabold tracking-tight">{value}</div>
      {delta && (
        <div className="text-xs" style={tone === "default" ? { color: "var(--color-ink-muted)" } : { opacity: 0.7 }}>
          {delta}
        </div>
      )}
    </div>
  );
}
