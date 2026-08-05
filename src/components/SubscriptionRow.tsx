import type { Subscription } from "../types";
import { FREQUENCY_LABELS } from "../types";
import { daysUntil, formatCurrency, formatDate } from "../lib/format";

interface SubscriptionRowProps {
  sub: Subscription;
  color: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function SubscriptionRow({ sub, color, onEdit, onDelete }: SubscriptionRowProps) {
  const remaining = daysUntil(sub.paymentDate);
  let dueLabel: string | null = null;
  let dueTone = "var(--text-muted)";
  if (remaining !== null) {
    if (remaining < 0) {
      dueLabel = `${formatDate(sub.paymentDate)} · overdue`;
      dueTone = "var(--status-critical)";
    } else if (remaining === 0) {
      dueLabel = "Due today";
      dueTone = "var(--status-warning)";
    } else if (remaining <= 3) {
      dueLabel = `${formatDate(sub.paymentDate)} · in ${remaining}d`;
      dueTone = "var(--status-warning)";
    } else {
      dueLabel = `${formatDate(sub.paymentDate)} · in ${remaining}d`;
    }
  }

  return (
    <div
      className="group flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            {sub.name}
          </p>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            {FREQUENCY_LABELS[sub.frequency]}
          </span>
        </div>
        <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
          {sub.account}
          {dueLabel && (
            <>
              {" · "}
              <span style={{ color: dueTone }}>{dueLabel}</span>
            </>
          )}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="tabular-nums text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {formatCurrency(sub.amount)}
        </p>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          per {sub.frequency === "biweekly" ? "period" : sub.frequency.replace("ly", "")}
        </p>
      </div>

      <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
          style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
          style={{ color: "var(--status-critical)", background: "var(--surface-2)" }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
