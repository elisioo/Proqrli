/* eslint-disable prettier/prettier */
// Reusable side-drawer form shell used by every CRUD page.
// Wraps shadcn Sheet. Pages provide their own form fields as children
// and a save handler. The drawer renders the title, a sticky footer with
// Cancel / Save, and an optional Archive button when editing.

import * as React from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { Archive, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type CrudDrawerMode = "create" | "edit" | null;

export function CrudDrawer({
    open,
    mode,
    title,
    description,
    onClose,
    onSave,
    onArchive,
    archiveLabel,
    saveLabel,
    children,
    canSave = true,
}: {
    open: boolean;
    mode: CrudDrawerMode;
    title: string;
    description?: string;
    onClose: () => void;
    onSave: () => void;
    onArchive?: () => void;
    archiveLabel?: string;
    saveLabel?: string;
    children: React.ReactNode;
    canSave?: boolean;
}) {
    return (
        <Sheet open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
            >
                <SheetHeader className="border-b border-border bg-card px-6 py-5">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                        {mode === "create" ? "Create new" : "Edit record"}
                    </div>
                    <SheetTitle className="font-display text-2xl font-extrabold leading-tight">
                        {title}
                    </SheetTitle>
                    {description && (
                        <SheetDescription className="text-xs text-muted-foreground">
                            {description}
                        </SheetDescription>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="space-y-4">{children}</div>
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border bg-muted px-6 py-3">
                    <div>
                        {mode === "edit" && onArchive && (
                            <button
                                type="button"
                                onClick={onArchive}
                                className="inline-flex h-9 items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                            >
                                <Archive className="h-3 w-3" /> {archiveLabel ?? "Archive"}
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="inline-flex h-9 items-center gap-1 rounded-sm border border-border bg-card px-3 text-xs font-semibold hover:bg-paper-mid"
                        >
                            <X className="h-3 w-3" /> Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            disabled={!canSave}
                            className="inline-flex h-9 items-center rounded-sm bg-foreground px-4 text-xs font-semibold text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {saveLabel ?? (mode === "create" ? "Create" : "Save changes")}
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}

// ─── Labeled field wrapper ────────────────────────────────────────────────────
export function Field({
    label,
    hint,
    children,
}: {
    label: React.ReactNode;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <div className="t-label mb-1">{label}</div>
            {children}
            {hint && <p className="mt-1 text-[10px] text-muted-foreground">{hint}</p>}
        </label>
    );
}

// ─── NumberInput ──────────────────────────────────────────────────────────────
// Reusable number input with:
//   • Blank when value is 0 (shows placeholder instead)
//   • Blocks negative input (no minus, e, E, + keys)
//   • min defaults to 0; override via prop
//   • Accepts an optional `step` for decimals (e.g. step="0.01")
export function NumberInput({
    value,
    onChange,
    placeholder = "0",
    min = 0,
    step,
    className,
    disabled,
}: {
    value: number;
    onChange: (val: number) => void;
    placeholder?: string;
    min?: number;
    step?: string | number;
    className?: string;
    disabled?: boolean;
}) {
    return (
        <input
            type="number"
            min={min}
            step={step}
            disabled={disabled}
            value={value === 0 ? "" : value}
            placeholder={placeholder}
            className={cn(inputCls, disabled && "cursor-not-allowed bg-muted opacity-70", className)}
            onKeyDown={(e) => {
                if (["-", "e", "E", "+"].includes(e.key)) e.preventDefault();
            }}
            onChange={(e) => {
                const raw = Number(e.target.value);
                onChange(isNaN(raw) ? min : Math.max(min, raw));
            }}
        />
    );
}

// ─── SelectOrCustom ───────────────────────────────────────────────────────────
// A dropdown that appends a sentinel "___OTHER___" option. When selected,
// it swaps to a free-text input so the user can type a custom value.
// Used for Department, UOM, Category etc.
export function SelectOrCustom({
    value,
    options,
    onChange,
    addLabel = "+ Add custom…",
    placeholder = "Type a value…",
    className,
    disabled,
}: {
    value: string;
    options: string[];
    onChange: (val: string) => void;
    addLabel?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}) {
    // Track whether we're in "custom typing" mode.
    const isCustom = value !== "" && !options.includes(value);
    const [customMode, setCustomMode] = React.useState(isCustom);

    // Keep customMode in sync if parent resets value (e.g. openCreate resets draft).
    React.useEffect(() => {
        if (options.includes(value) || value === "") setCustomMode(false);
    }, [value, options]);

    if (customMode) {
        return (
            <div className="flex items-center gap-2">
                <input
                    autoFocus
                    className={cn(inputCls, disabled && "cursor-not-allowed bg-muted opacity-70", className)}
                    value={value}
                    placeholder={placeholder}
                    disabled={disabled}
                    onChange={(e) => onChange(e.target.value)}
                />
                {!disabled && (
                    <button
                        type="button"
                        onClick={() => { setCustomMode(false); onChange(options[0] ?? ""); }}
                        className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                        Cancel
                    </button>
                )}
            </div>
        );
    }

    return (
        <select
            className={cn(selectCls, disabled && "cursor-not-allowed bg-muted opacity-70", className)}
            value={options.includes(value) ? value : ""}
            disabled={disabled}
            onChange={(e) => {
                if (e.target.value === "___OTHER___") {
                    setCustomMode(true);
                    onChange("");
                } else {
                    onChange(e.target.value);
                }
            }}
        >
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
            <option value="___OTHER___">{addLabel}</option>
        </select>
    );
}

// ─── Base class strings ───────────────────────────────────────────────────────
export const inputCls =
    "h-10 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground";
export const selectCls = inputCls;
export const textareaCls =
    "min-h-[80px] w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";
