import type { Frequency } from "../types";
import { FREQUENCY_LABELS } from "../types";

const OPTIONS: Frequency[] = ["biweekly", "monthly", "semiannual", "yearly"];

interface FrequencyToggleProps {
  value: Frequency;
  onChange: (value: Frequency) => void;
}

export function FrequencyToggle({ value, onChange }: FrequencyToggleProps) {
  return (
    <div
      className="grid grid-cols-2 p-1 rounded-full gap-1"
      style={{ background: "var(--surface-2)" }}
      role="tablist"
      aria-label="Payment frequency"
    >
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt)}
            className="px-3 py-1.5 text-sm font-medium rounded-full transition-colors cursor-pointer"
            style={{
              background: active ? "var(--accent)" : "transparent",
              color: active ? "var(--accent-ink)" : "var(--text-secondary)",
            }}
          >
            {FREQUENCY_LABELS[opt]}
          </button>
        );
      })}
    </div>
  );
}
