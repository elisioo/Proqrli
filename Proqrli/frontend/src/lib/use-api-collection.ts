/* eslint-disable prettier/prettier */
// lib/use-api-collection.ts
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in replacement for useCollection that talks to the real API.
// Usage is identical to useCollection, but data is persisted to the backend.
//
// Example:
//   const store = useApiCollection(requisitionsApi);
//   store.items          → active records
//   store.create(draft)  → POST to API, adds to local state
//   store.update(id, {}) → PATCH to API, merges locally
//   store.archive(id)    → DELETE to API, removes from active list
// ─────────────────────────────────────────────────────────────────────────────

import * as React from "react";

export type ApiEndpoints<T, CreatePayload, UpdatePayload> = {
    getAll:  ()                                   => Promise<T[]>;
    create:  (body: CreatePayload)                => Promise<T>;
    update:  (id: string, body: UpdatePayload)    => Promise<T>;
    archive: (id: string)                         => Promise<void>;
};

export type ApiCollectionState = "idle" | "loading" | "error";

export type ApiCollectionApi<T, CreatePayload, UpdatePayload> = {
    items:   T[];
    state:   ApiCollectionState;
    error:   string | null;
    reload:  () => void;
    create:  (body: CreatePayload)             => Promise<T>;
    update:  (id: string, body: UpdatePayload) => Promise<T>;
    archive: (id: string)                      => Promise<void>;
};

export function useApiCollection<
    T extends { id: string; archived?: boolean },
    CreatePayload,
    UpdatePayload,
>(
    endpoints: ApiEndpoints<T, CreatePayload, UpdatePayload>,
): ApiCollectionApi<T, CreatePayload, UpdatePayload> {
    const [items, setItems]   = React.useState<T[]>([]);
    const [state, setState]   = React.useState<ApiCollectionState>("idle");
    const [error, setError]   = React.useState<string | null>(null);

    const load = React.useCallback(async () => {
        setState("loading");
        setError(null);
        try {
            const data = await endpoints.getAll();
            setItems(data);
            setState("idle");
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown error");
            setState("error");
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    React.useEffect(() => { load(); }, [load]);

    const create = React.useCallback(async (body: CreatePayload) => {
        const created = await endpoints.create(body);
        setItems(prev => [created, ...prev]);
        return created;
    }, [endpoints]);

    const update = React.useCallback(async (id: string, body: UpdatePayload) => {
        const updated = await endpoints.update(id, body);
        setItems(prev => prev.map(i => i.id === id ? updated : i));
        return updated;
    }, [endpoints]);

    const archive = React.useCallback(async (id: string) => {
        await endpoints.archive(id);
        // Reload from backend to get the exact new state (e.g., status changed to Archived or IsActive=false)
        await load();
    }, [endpoints, load]);

    return { items, state, error, reload: load, create, update, archive };
}
