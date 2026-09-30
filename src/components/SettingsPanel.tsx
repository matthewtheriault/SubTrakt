import { useState } from "react";
import type { Appearance, Settings } from "../types";
import { COMMON_CURRENCIES } from "../lib/currency";

interface SettingsPanelProps {
  settings: Settings;
  currenciesInUse: string[];
  onCancel: () => void;
  onSave: (next: Settings) => void;
}

const inputStyle = {
  background: "var(--surface-2)",
  borderColor: "var(--border)",
  color: "var(--text-primary)",
};

export function SettingsPanel({ settings, currenciesInUse, onCancel, onSave }: SettingsPanelProps) {
  const [appearance, setAppearance] = useState<Appearance>(settings.appearance);
  const [baseCurrency, setBaseCurrency] = useState(settings.baseCurrency);
  const [reminderDaysBefore, setReminderDaysBefore] = useState(String(settings.reminderDaysBefore));
  const [staleAfterDays, setStaleAfterDays] = useState(String(settings.staleAfterDays));
  const [rates, setRates] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(settings.exchangeRates).map(([k, v]) => [k, String(v)])),
  );

  const foreignCurrencies = currenciesInUse.filter((c) => c !== baseCurrency);
  const currencyOptions = Array.from(new Set([...COMMON_CURRENCIES, baseCurrency]));

  function handleSave() {
    const exchangeRates: Record<string, number> = {};
    for (const code of foreignCurrencies) {
      const n = Number(rates[code]);
      if (Number.isFinite(n) && n > 0) exchangeRates[code] = n;
    }
    onSave({
      ...settings,
      appearance,
      baseCurrency,
      exchangeRates,
      reminderDaysBefore: Math.max(0, Number(reminderDaysBefore) || 0),
      staleAfterDays: Math.max(1, Number(staleAfterDays) || 30),
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
      <div
        className="w-full max-w-md rounded-[28px] border p-6 flex flex-col gap-4 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <h2 className="text-lg font-semibold">Settings</h2>

        <div className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Appearance</span>
          <div className="grid grid-cols-3 gap-1 rounded-full p-1" style={{ background: "var(--surface-2)" }} role="radiogroup">
            {(["system", "light", "dark"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={appearance === option}
                onClick={() => setAppearance(option)}
                className="rounded-full py-1.5 text-sm font-medium capitalize cursor-pointer"
                style={{
                  background: appearance === option ? "var(--surface-1)" : "transparent",
                  color: appearance === option ? "var(--text-primary)" : "var(--text-secondary)",
                  boxShadow: appearance === option ? "0 1px 3px rgba(0,0,0,0.15)" : undefined,
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Base currency</span>
          <select
            value={baseCurrency}
            onChange={(e) => setBaseCurrency(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm outline-none cursor-pointer"
            style={inputStyle}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Totals and the category chart are converted into this currency.
          </span>
        </label>

        {foreignCurrencies.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Exchange rates to {baseCurrency}
            </span>
            {foreignCurrencies.map((code) => (
              <div key={code} className="flex items-center gap-2 text-sm">
                <span className="w-28 shrink-0" style={{ color: "var(--text-muted)" }}>
                  1 {code} =
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.0001"
                  inputMode="decimal"
                  placeholder="rate"
                  className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none tabular-nums"
                  style={inputStyle}
                  value={rates[code] ?? ""}
                  onChange={(e) => setRates((r) => ({ ...r, [code]: e.target.value }))}
                />
                <span className="shrink-0" style={{ color: "var(--text-muted)" }}>
                  {baseCurrency}
                </span>
              </div>
            ))}
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              Leave blank to treat as 1:1 until you set a rate.
            </span>
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Remind me before a charge / trial ends</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="30"
              className="w-20 rounded-lg border px-3 py-2 text-sm outline-none tabular-nums"
              style={inputStyle}
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(e.target.value)}
            />
            <span style={{ color: "var(--text-muted)" }}>days ahead</span>
          </div>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span style={{ color: "var(--text-secondary)" }}>Flag as a cancel candidate after</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              className="w-20 rounded-lg border px-3 py-2 text-sm outline-none tabular-nums"
              style={inputStyle}
              value={staleAfterDays}
              onChange={(e) => setStaleAfterDays(e.target.value)}
            />
            <span style={{ color: "var(--text-muted)" }}>days unused</span>
          </div>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-full text-sm font-medium cursor-pointer"
            style={{ background: "var(--accent)", color: "var(--accent-ink)", boxShadow: "var(--accent-glow)" }}
          >
            Save settings
          </button>
        </div>
      </div>
    </div>
  );
}
