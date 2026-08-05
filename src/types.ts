export type Frequency = "biweekly" | "monthly" | "yearly";

export interface Subscription {
  id: string;
  name: string;
  category: string;
  amount: number;
  frequency: Frequency;
  paymentDate: string; // ISO date (YYYY-MM-DD) of next/first payment
  account: string; // bank account or card this is paid from
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

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
  yearly: "Yearly",
};

// Occurrences per year for each frequency
const OCCURRENCES_PER_YEAR: Record<Frequency, number> = {
  biweekly: 26,
  monthly: 12,
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
