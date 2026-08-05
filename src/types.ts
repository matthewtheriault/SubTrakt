export type Frequency = "biweekly" | "monthly" | "semiannual" | "yearly";

export interface PriceHistoryEntry {
  amount: number;
  frequency: Frequency;
  currency: string;
  effectiveFrom: string; // ISO date
}

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string; // ISO 4217 code, e.g. "USD"
  frequency: Frequency;
  paymentDate: string; // ISO date (YYYY-MM-DD) of next/upcoming payment
  account: string; // bank account or card this is paid from
  notes?: string;

  isTrial?: boolean;
  trialEndDate?: string; // ISO date the trial converts to paid

  lastUsedDate?: string; // ISO date, optional, for spotting unused subscriptions

  priceHistory: PriceHistoryEntry[];

  lastNotifiedDate?: string; // paymentDate value we last sent a due-soon reminder for
  lastTrialNotifiedDate?: string; // trialEndDate value we last sent a trial-ending reminder for

  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  baseCurrency: string;
  exchangeRates: Record<string, number>; // code -> units per 1 baseCurrency... actually rate TO base (1 unit of code = rate baseCurrency)
  reminderDaysBefore: number;
  staleAfterDays: number;
}

export const DEFAULT_SETTINGS: Settings = {
  baseCurrency: "USD",
  exchangeRates: {},
  reminderDaysBefore: 3,
  staleAfterDays: 30,
};

export const DEFAULT_CATEGORIES = [
  "Tech",
  "Gaming",
  "Entertainment",
  "Loans",
  "Server",
  "Food",
  "Utilities",
  "Health",
  "Finance",
  "Other",
] as const;

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  biweekly: "Bi-Weekly",
  monthly: "Monthly",
  semiannual: "Semi-Annual",
  yearly: "Yearly",
};

// Occurrences per year for each frequency
const OCCURRENCES_PER_YEAR: Record<Frequency, number> = {
  biweekly: 26,
  monthly: 12,
  semiannual: 2,
  yearly: 1,
};

export function toMonthly(amount: number, frequency: Frequency): number {
  return (amount * OCCURRENCES_PER_YEAR[frequency]) / 12;
}

export function toYearly(amount: number, frequency: Frequency): number {
  return amount * OCCURRENCES_PER_YEAR[frequency];
}

export function toBiWeekly(amount: number, frequency: Frequency): number {
  return (amount * OCCURRENCES_PER_YEAR[frequency]) / 26;
}
