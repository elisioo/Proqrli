/* eslint-disable prettier/prettier */
// Generic in-memory CRUD store with soft-delete (archive).
// Holds an array of records identified by `id`. Each record optionally
// carries an `archived: boolean` flag added/managed by the hook.

import * as React from "react";

export type Archivable = { id: string; archived?: boolean };

export type CollectionApi<T extends Archivable> = {
    items: T[];                          // active only
    archived: T[];                       // archived only
    all: T[];                            // both
    get: (id: string) => T | undefined;
    create: (draft: Omit<T, "id"> & { id?: string }) => T;
    update: (id: string, patch: Partial<T>) => void;
    archive: (id: string) => void;
    restore: (id: string) => void;
    remove: (id: string) => void;        // hard delete (escape hatch)
};

let counter = 0;
function genId(prefix: string) {
    counter += 1;
    return `${prefix}_${Date.now().toString(36)}_${counter}`;
}

export function useCollection<T extends Archivable>(
    initial: T[],
    idPrefix = "rec",
): CollectionApi<T> {
    const [data, setData] = React.useState<T[]>(() => initial.map((i) => ({ ...i })));

    return React.useMemo<CollectionApi<T>>(() => {
        const get = (id: string) => data.find((d) => d.id === id);

        const create: CollectionApi<T>["create"] = (draft) => {
            const next = { ...(draft as T), id: draft.id ?? genId(idPrefix), archived: false };
            setData((prev) => [next, ...prev]);
            return next;
        };

        const update: CollectionApi<T>["update"] = (id, patch) => {
            setData((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)));
        };

        const archive = (id: string) => update(id, { archived: true } as Partial<T>);
        const restore = (id: string) => update(id, { archived: false } as Partial<T>);
        const remove = (id: string) => setData((prev) => prev.filter((d) => d.id !== id));

        return {
            items: data.filter((d) => !d.archived),
            archived: data.filter((d) => d.archived),
            all: data,
            get,
            create,
            update,
            archive,
            restore,
            remove,
        };
    }, [data, idPrefix]);
}
