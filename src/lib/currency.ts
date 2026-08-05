import type { Settings } from "../types";

export const COMMON_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CHF",
  "CNY",
  "INR",
  "MXN",
  "BRL",
  "NZD",
  "SEK",
  "NOK",
  "SGD",
] as const;

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: string): string {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    try {
      formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
    } catch {
      formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    }
    formatterCache.set(currency, formatter);
  }
  return formatter.format(amount);
}

// Rate is stored as: 1 unit of `currency` = exchangeRates[currency] units of baseCurrency.
export function toBaseCurrency(amount: number, currency: string, settings: Settings): number {
  if (currency === settings.baseCurrency) return amount;
  const rate = settings.exchangeRates[currency];
  if (!rate || rate <= 0) return amount; // no rate on file — treat 1:1 rather than silently dropping it
  return amount * rate;
}
