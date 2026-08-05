import { useState, type FormEvent } from "react";
import type { Frequency, Subscription } from "../types";
import type { SubscriptionInput } from "../useSubscriptions";
import { FrequencyToggle } from "./FrequencyToggle";
import { COMMON_CURRENCIES } from "../lib/currency";

export interface SubscriptionFormValues {
  name: string;
  category: string;
  amount: string;
  currency: string;
  frequency: Frequency;
  paymentDate: string;
  account: string;
  notes: string;
  isTrial: boolean;
  trialEndDate: string;
  lastUsedDate: string;
}

interface SubscriptionFormProps {
  initial?: Subscription;
  categories: string[];
  defaultCurrency: string;
  onCancel: () => void;
  onSubmit: (values: SubscriptionInput) => void;
}

function emptyValues(defaultCurrency: string): SubscriptionFormValues {
  return {
    name: "",
    category: "",
    amount: "",
    currency: defaultCurrency,
    frequency: "monthly",
    paymentDate: "",
    account: "",
    notes: "",
    isTrial: false,
    trialEndDate: "",
    lastUsedDate: "",
  };
}

function fromSubscription(sub: Subscription): SubscriptionFormValues {
  return {
    name: sub.name,
    category: sub.category,
    amount: String(sub.amount),
    currency: sub.currency,
    frequency: sub.frequency,
    paymentDate: sub.paymentDate,
    account: sub.account,
    notes: sub.notes ?? "",
    isTrial: sub.isTrial ?? false,
    trialEndDate: sub.trialEndDate ?? "",
    lastUsedDate: sub.lastUsedDate ?? "",
  };
}

const inputStyle = {
  background: "var(--surface-2)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
};

export function SubscriptionForm({
  initial,
  categories,
  defaultCurrency,
  onCancel,
  onSubmit,
}: SubscriptionFormProps) {
  const [values, setValues] = useState<SubscriptionFormValues>(
    initial ? fromSubscription(initial) : emptyValues(defaultCurrency),
  );
  const [error, setError] = useState<string | null>(null);

  const currencyOptions = Array.from(new Set([...COMMON_CURRENCIES, values.currency]));

  function set<K extends keyof SubscriptionFormValues>(key: K, value: SubscriptionFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amount = Number(values.amount);
    if (!values.name.trim()) {
      setError("Give the subscription a name.");
      return;
    }
    if (!values.category.trim()) {
      setError("Pick or type a category.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Amount must be a number greater than 0.");
      return;
    }
    if (!values.account.trim()) {
      setError("Note which account or card this is paid from.");
      return;
    }
    if (values.isTrial && !values.trialEndDate) {
      setError("Add the date the trial converts to paid.");
      return;
    }
    onSubmit({
      name: values.name.trim(),
      category: values.category.trim(),
      amount,
      currency: values.currency,
      frequency: values.frequency,
      paymentDate: values.paymentDate,
      account: values.account.trim(),
      notes: values.notes.trim() || undefined,
      isTrial: values.isTrial,
      trialEndDate: values.isTrial ? values.trialEndDate : undefined,
      lastUsedDate: values.lastUsedDate || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <h2 className="text-lg font-semibold">{initial ? "Edit Subscription" : "Add Subscription"}</h2>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Name</span>
          <input
            autoFocus
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            style={inputStyle}
            placeholder="e.g. Xbox Game Pass"
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Category</span>
          <input
            list="subtrakt-categories"
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            style={inputStyle}
            placeholder="e.g. Gaming"
            value={values.category}
            onChange={(e) => set("category", e.target.value)}
          />
          <datalist id="subtrakt-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>

        <div className="flex gap-3">
          <label className="flex flex-col gap-1.5 text-sm flex-[2]">
            <span style={{ color: "var(--text-secondary)" }}>Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 tabular-nums"
              style={inputStyle}
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm flex-1">
            <span style={{ color: "var(--text-secondary)" }}>Currency</span>
            <select
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 cursor-pointer"
              style={inputStyle}
              value={values.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              {currencyOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Payment date</span>
          <input
            type="date"
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 tabular-nums"
            style={inputStyle}
            value={values.paymentDate}
            onChange={(e) => set("paymentDate", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Billing frequency</span>
          <FrequencyToggle value={values.frequency} onChange={(f) => set("frequency", f)} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Bank account / card</span>
          <input
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
            style={inputStyle}
            placeholder="e.g. Chase Sapphire, •••• 4821"
            value={values.account}
            onChange={(e) => set("account", e.target.value)}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Last used (optional)</span>
          <input
            type="date"
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 tabular-nums"
            style={inputStyle}
            value={values.lastUsedDate}
            onChange={(e) => set("lastUsedDate", e.target.value)}
          />
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Track when you actually used this, to spot subscriptions worth cutting.
          </span>
        </label>

        <div
          className="flex flex-col gap-2 rounded-lg border p-3"
          style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
        >
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={values.isTrial}
              onChange={(e) => set("isTrial", e.target.checked)}
              className="cursor-pointer"
            />
            <span style={{ color: "var(--text-primary)" }}>This is a free trial</span>
          </label>
          {values.isTrial && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span style={{ color: "var(--text-secondary)" }}>Trial ends / converts to paid on</span>
              <input
                type="date"
                className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 tabular-nums"
                style={{ background: "var(--surface-1)", borderColor: "var(--border)", color: "var(--text-primary)" }}
                value={values.trialEndDate}
                onChange={(e) => set("trialEndDate", e.target.value)}
              />
            </label>
          )}
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Notes (optional)</span>
          <textarea
            className="rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 resize-none"
            style={inputStyle}
            rows={2}
            placeholder="Anything worth remembering about this one"
            value={values.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </label>

        {error && (
          <p className="text-sm" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            {initial ? "Save changes" : "Add subscription"}
          </button>
        </div>
      </form>
    </div>
  );
}
