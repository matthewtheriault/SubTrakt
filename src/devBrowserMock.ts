// Dev-only stand-in for the Tauri backend so `npm run dev` works in a plain
// browser for UI work. Loaded from main.tsx only when running under Vite dev
// outside Tauri; never part of a production build.
//
// Data lives in localStorage. URL flags:
//   ?fresh  — wipe everything (shows onboarding again)
//   ?demo   — seed sample subscriptions and skip onboarding
import { mockIPC } from "@tauri-apps/api/mocks";

const PREFIX = "subtrakt-dev:";

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === undefined) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage blocked: the app still runs, it just won't persist.
  }
}

function iso(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

function seedDemo() {
  const now = new Date().toISOString();
  const sub = (
    name: string,
    category: string,
    amount: number,
    frequency: string,
    payIn: number,
    account: string,
    usedAgo: number,
    extra: Record<string, unknown> = {},
  ) => ({
    id: name.toLowerCase().replace(/\W+/g, "-"),
    name,
    category,
    amount,
    currency: "USD",
    frequency,
    paymentDate: iso(payIn),
    account,
    lastUsedDate: iso(-usedAgo),
    priceHistory: [{ amount, frequency, currency: "USD", effectiveFrom: iso(-120) }],
    createdAt: now,
    updatedAt: now,
    ...extra,
  });
  write("subscriptions", [
    sub("Netflix", "Entertainment", 17.99, "monthly", 2, "Visa •• 4821", 1),
    sub("Spotify", "Entertainment", 11.99, "monthly", 6, "Visa •• 4821", 0),
    sub("Headspace", "Health", 69.99, "yearly", 2, "Apple Pay", 4, { isTrial: true, trialEndDate: iso(2) }),
    sub("Adobe Creative Cloud", "Tech", 59.99, "monthly", 11, "Amex •• 1009", 2),
    sub("Xbox Game Pass", "Gaming", 19.99, "monthly", 14, "Amex •• 1009", 61),
    sub("Peloton", "Health", 44, "monthly", 19, "Visa •• 4821", 47),
    sub("iCloud+", "Tech", 2.99, "monthly", 8, "Apple Pay", 0),
    sub("DigitalOcean", "Server", 12, "monthly", 4, "Amex •• 1009", 5),
    sub("Car Loan", "Loans", 289, "monthly", 13, "Checking", 0),
    sub("Amazon Prime", "Entertainment", 139, "yearly", 74, "Visa •• 4821", 3),
  ]);
  write("settings", {
    baseCurrency: "USD",
    exchangeRates: {},
    reminderDaysBefore: 3,
    staleAfterDays: 30,
    appearance: "system",
    hasCompletedOnboarding: true,
  });
}

export function installDevBrowserMock() {
  const params = new URLSearchParams(location.search);
  if (params.has("fresh") || params.has("demo")) {
    write("subscriptions", undefined);
    write("settings", undefined);
  }
  if (params.has("demo")) seedDemo();

  mockIPC((cmd, payload) => {
    const args = (payload ?? {}) as { key?: string; value?: unknown };
    switch (cmd) {
      case "plugin:store|load":
      case "plugin:store|get_store":
        return 1;
      case "plugin:store|get": {
        const value = read(args.key ?? "");
        return [value ?? null, value !== undefined];
      }
      case "plugin:store|set":
        write(args.key ?? "", args.value);
        return null;
      case "plugin:notification|is_permission_granted":
        return false;
      case "plugin:notification|request_permission":
        return "denied";
      default:
        return null;
    }
  });
}
