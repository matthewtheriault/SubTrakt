import type { Subscription } from "../types";
import { todayISO } from "./dateMath";

// Backfills fields that didn't exist in earlier versions of the app, so data
// saved before a feature (currency, price history, trials, ...) was added
// keeps loading correctly after an update rather than crashing or silently
// dropping the record.
export function normalizeSubscription(input: unknown): Subscription {
  const raw = (input && typeof input === "object" ? input : {}) as Partial<Subscription> &
    Record<string, unknown>;
  const currency = typeof raw.currency === "string" && raw.currency ? raw.currency : "USD";
  const amount = typeof raw.amount === "number" ? raw.amount : 0;
  const frequency = raw.frequency ?? "monthly";
  const createdAt = typeof raw.createdAt === "string" && raw.createdAt ? raw.createdAt : new Date().toISOString();

  const priceHistory =
    Array.isArray(raw.priceHistory) && raw.priceHistory.length > 0
      ? raw.priceHistory
      : [{ amount, frequency, currency, effectiveFrom: createdAt.slice(0, 10) || todayISO() }];

  return {
    id: typeof raw.id === "string" && raw.id ? raw.id : crypto.randomUUID(),
    name: typeof raw.name === "string" ? raw.name : "",
    category: typeof raw.category === "string" && raw.category ? raw.category : "Other",
    amount,
    currency,
    frequency,
    paymentDate: typeof raw.paymentDate === "string" ? raw.paymentDate : "",
    account: typeof raw.account === "string" ? raw.account : "",
    notes: raw.notes,
    isTrial: raw.isTrial,
    trialEndDate: raw.trialEndDate,
    lastUsedDate: raw.lastUsedDate,
    logoOverrideId: typeof raw.logoOverrideId === "string" ? raw.logoOverrideId : undefined,
    customLogoDataUrl: typeof raw.customLogoDataUrl === "string" ? raw.customLogoDataUrl : undefined,
    priceHistory,
    lastNotifiedDate: raw.lastNotifiedDate,
    lastTrialNotifiedDate: raw.lastTrialNotifiedDate,
    createdAt,
    updatedAt: typeof raw.updatedAt === "string" && raw.updatedAt ? raw.updatedAt : createdAt,
  };
}
