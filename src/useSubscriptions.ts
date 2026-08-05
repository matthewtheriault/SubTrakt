import { useCallback, useEffect, useRef, useState } from "react";
import { load, type Store } from "@tauri-apps/plugin-store";
import type { Subscription } from "./types";

const STORE_FILE = "subtrakt.json";
const STORE_KEY = "subscriptions";

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const storeRef = useRef<Store | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const store = await load(STORE_FILE, { autoSave: true });
      storeRef.current = store;
      const saved = await store.get<Subscription[]>(STORE_KEY);
      if (!cancelled) {
        setSubscriptions(saved ?? []);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback(async (next: Subscription[]) => {
    setSubscriptions(next);
    const store = storeRef.current;
    if (store) {
      await store.set(STORE_KEY, next);
      await store.save();
    }
  }, []);

  const addSubscription = useCallback(
    (sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newSub: Subscription = {
        ...sub,
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      persist([...subscriptions, newSub]);
    },
    [subscriptions, persist],
  );

  const updateSubscription = useCallback(
    (id: string, sub: Omit<Subscription, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      persist(
        subscriptions.map((s) =>
          s.id === id ? { ...sub, id, createdAt: s.createdAt, updatedAt: now } : s,
        ),
      );
    },
    [subscriptions, persist],
  );

  const deleteSubscription = useCallback(
    (id: string) => {
      persist(subscriptions.filter((s) => s.id !== id));
    },
    [subscriptions, persist],
  );

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
  };
}
