import { useCallback, useEffect, useRef, useState } from "react";
import { load, type Store } from "@tauri-apps/plugin-store";
import type { Subscription } from "./types";
import { todayISO } from "./lib/dateMath";

const STORE_FILE = "subtrakt.json";
const STORE_KEY = "subscriptions";

export type SubscriptionInput = Pick<
  Subscription,
  | "name"
  | "category"
  | "amount"
  | "currency"
  | "frequency"
  | "paymentDate"
  | "account"
  | "notes"
  | "isTrial"
  | "trialEndDate"
  | "lastUsedDate"
>;

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

  // Used by the app-level reconciliation pass (payment-date rollover, reminder
  // dedupe marking) to persist a fully-computed replacement list.
  const replaceAll = persist;

  const addSubscription = useCallback(
    (input: SubscriptionInput) => {
      const now = new Date().toISOString();
      const newSub: Subscription = {
        ...input,
        id: crypto.randomUUID(),
        priceHistory: [
          { amount: input.amount, frequency: input.frequency, currency: input.currency, effectiveFrom: todayISO() },
        ],
        createdAt: now,
        updatedAt: now,
      };
      persist([...subscriptions, newSub]);
    },
    [subscriptions, persist],
  );

  const updateSubscription = useCallback(
    (id: string, input: SubscriptionInput) => {
      const now = new Date().toISOString();
      persist(
        subscriptions.map((s) => {
          if (s.id !== id) return s;
          const priceChanged =
            s.amount !== input.amount || s.frequency !== input.frequency || s.currency !== input.currency;
          const priceHistory = priceChanged
            ? [
                ...s.priceHistory,
                { amount: input.amount, frequency: input.frequency, currency: input.currency, effectiveFrom: todayISO() },
              ]
            : s.priceHistory;
          return {
            ...s,
            ...input,
            priceHistory,
            lastNotifiedDate: input.paymentDate !== s.paymentDate ? undefined : s.lastNotifiedDate,
            lastTrialNotifiedDate: input.trialEndDate !== s.trialEndDate ? undefined : s.lastTrialNotifiedDate,
            updatedAt: now,
          };
        }),
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

  const markUsedToday = useCallback(
    (id: string) => {
      persist(subscriptions.map((s) => (s.id === id ? { ...s, lastUsedDate: todayISO() } : s)));
    },
    [subscriptions, persist],
  );

  return {
    subscriptions,
    loading,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    markUsedToday,
    replaceAll,
  };
}
