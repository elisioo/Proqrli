import { cn } from "@/lib/utils";

type Tone = "default" | "green" | "amber" | "red" | "blue" | "ink";

const toneStyles: Record<Tone, string> = {
  default: "border-border bg-muted text-ink-soft",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  red: "border-rose-200 bg-rose-50 text-rose-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  ink: "border-foreground bg-foreground text-background",
};

export function StatusPill({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border px-2 py-[2px] font-mono text-[10px] font-semibold uppercase tracking-[0.1em]",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, Tone> = {
  // Marketplace
  New: "blue",
  Acknowledged: "blue",
  Packed: "amber",
  Shipped: "amber",
  Delivered: "green",
  Cancelled: "red",
  // PO
  Issued: "blue",
  "Partially Received": "amber",
  Received: "green",
  // Delivery
  Preparing: "default",
  "In Transit": "amber",
  "Out for Delivery": "amber",
  Failed: "red",
  // Invoice / Payout
  Draft: "default",
  Sent: "blue",
  Paid: "green",
  Overdue: "red",
  Scheduled: "blue",
  Processing: "amber",
  // Compliance
  Valid: "green",
  Expiring: "amber",
  Expired: "red",
  "Pending Review": "amber",
  // Buyer
  Approved: "green",
  Pending: "amber",
  Rejected: "red",
  Suspended: "red",
  // Product
  Active: "green",
  "Out of stock": "red",
  // Risk
  Low: "green",
  Medium: "amber",
  High: "red",
  // Buyer-side extras
  "Pending Approval": "amber",
  "Converted to RFQ": "blue",
  "Converted to PO": "blue",
  Open: "blue",
  Closed: "default",
  Awarded: "green",
  Submitted: "blue",
  Withdrawn: "default",
  "Pending Inspection": "amber",
  "Partially Accepted": "amber",
  Accredited: "green",
  Blocked: "red",
  Disputed: "red",
  Accepted: "green",
  // Inventory
  "In stock": "green",
  "Low stock": "amber",
  // RFQ vendor invitation
  Invited: "blue",
  Viewed: "default",
  Quoted: "green",
  Declined: "red",
};

export function AutoStatus({ status }: { status: string }) {
  return <StatusPill tone={STATUS_TONES[status] ?? "default"}>{status}</StatusPill>;
}
