import { useBuyer } from "@/lib/buyer-context";
import type { BuyerPermission } from "@/lib/buyer-mock-data";
import { Lock } from "lucide-react";

type Props = {
  permission: BuyerPermission | BuyerPermission[];
  children: React.ReactNode;
  silent?: boolean;
};

export function BuyerPermissionGate({ permission, children, silent }: Props) {
  const { hasPermission, role } = useBuyer();
  const perms = Array.isArray(permission) ? permission : [permission];
  const ok = perms.some((p) => hasPermission(p));
  if (ok) return <>{children}</>;
  if (silent) return null;
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border border-dashed border-border bg-card p-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
      <h3 className="font-display text-xl font-bold">Access restricted</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Your role <span className="font-semibold text-foreground">{role.replace("buyer_", "")}</span> doesn't have access to this section.
        Ask the Owner to grant you the right permission.
      </p>
      <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        Required: {perms.join(" or ")}
      </p>
    </div>
  );
}
