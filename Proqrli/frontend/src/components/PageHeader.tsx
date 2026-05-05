/* eslint-disable prettier/prettier */
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div>
        {eyebrow && (
          <div className="t-label mb-3 flex items-center gap-2">
            {/*<span className="h-px w-6 bg-ink-muted" />*/}
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
