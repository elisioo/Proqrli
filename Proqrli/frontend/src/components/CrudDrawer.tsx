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

export type CrudDrawerMode = "create" | "edit" | null;

export function CrudDrawer({
    open,
    mode,
    title,
    description,
    onClose,
    onSave,
    onArchive,
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
                                className="inline-flex h-9 items-center gap-1 rounded-sm border border-rose-200 bg-rose-50 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                            >
                                <Archive className="h-3 w-3" /> Archive
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

// Reusable labeled field wrappers — keep look consistent across forms.
export function Field({
    label,
    hint,
    children,
}: {
    label: string;
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

export const inputCls =
    "h-10 w-full rounded-sm border border-border bg-background px-3 text-sm outline-none focus:border-foreground";
export const selectCls = inputCls;
export const textareaCls =
    "min-h-[80px] w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-foreground";
