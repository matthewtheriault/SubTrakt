import { useState } from "react";
import type { Subscription } from "../types";
import { FREQUENCY_LABELS } from "../types";
import { daysUntil, formatDate } from "../lib/format";
import { formatMoney } from "../lib/currency";
import { daysSince } from "../lib/dateMath";

interface SubscriptionRowProps {
  sub: Subscription;
  color: string;
  staleAfterDays: number;
  onEdit: () => void;
  onDelete: () => void;
  onMarkUsedToday: () => void;
}

export function SubscriptionRow({
  sub,
  color,
  staleAfterDays,
  onEdit,
  onDelete,
  onMarkUsedToday,
}: SubscriptionRowProps) {
  const [historyOpen, setHistoryOpen] = useState(false);

  const remaining = daysUntil(sub.paymentDate);
  let dueLabel: string | null = null;
  let dueTone = "var(--text-muted)";
  if (remaining !== null) {
    if (remaining === 0) {
      dueLabel = "Due today";
      dueTone = "var(--status-warning)";
    } else if (remaining < 0) {
      dueLabel = `${formatDate(sub.paymentDate)} · overdue`;
      dueTone = "var(--status-critical)";
    } else if (remaining <= 3) {
      dueLabel = `${formatDate(sub.paymentDate)} · in ${remaining}d`;
      dueTone = "var(--status-warning)";
    } else {
      dueLabel = `${formatDate(sub.paymentDate)} · in ${remaining}d`;
    }
  }

  const trialDaysLeft = sub.isTrial && sub.trialEndDate ? daysUntil(sub.trialEndDate) : null;
  const unusedDays = sub.lastUsedDate ? daysSince(sub.lastUsedDate) : null;
  const isCancelCandidate = unusedDays !== null && unusedDays >= staleAfterDays;

  const hasHistory = sub.priceHistory.length > 1;

  return (
    <div
      className="rounded-xl border transition-colors"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="group flex items-center gap-4 px-4 py-3">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              {sub.name}
            </p>
            <span
              className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
              style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
            >
              {FREQUENCY_LABELS[sub.frequency]}
            </span>
            {sub.isTrial && trialDaysLeft !== null && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: "var(--status-warning)", color: "#241a00" }}
              >
                Trial · {trialDaysLeft <= 0 ? "ends today" : `${trialDaysLeft}d left`}
              </span>
            )}
            {isCancelCandidate && (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={{ background: "var(--status-serious)", color: "#2a1200" }}
              >
                Unused {unusedDays}d
              </span>
            )}
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
            {formatMoney(sub.amount, sub.currency)}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            per {sub.frequency === "biweekly" ? "period" : sub.frequency.replace("ly", "")}
          </p>
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {hasHistory && (
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              className="rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
              style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
            >
              History
            </button>
          )}
          <button
            type="button"
            onClick={onMarkUsedToday}
            className="rounded-lg px-2 py-1.5 text-xs font-medium cursor-pointer"
            style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
          >
            Used today
          </button>
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

      {historyOpen && hasHistory && (
        <div className="flex flex-col gap-1.5 border-t px-4 py-3" style={{ borderColor: "var(--border)" }}>
          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
            Price history
          </span>
          {sub.priceHistory
            .slice()
            .reverse()
            .map((entry, i, arr) => {
              const prev = arr[i + 1];
              let delta: "up" | "down" | null = null;
              if (prev && prev.currency === entry.currency) {
                if (entry.amount > prev.amount) delta = "up";
                else if (entry.amount < prev.amount) delta = "down";
              }
              return (
                <div key={entry.effectiveFrom + i} className="flex items-center justify-between text-xs">
                  <span style={{ color: "var(--text-secondary)" }}>since {formatDate(entry.effectiveFrom)}</span>
                  <span className="tabular-nums flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                    {delta === "up" && <span style={{ color: "var(--status-serious)" }}>▲</span>}
                    {delta === "down" && <span style={{ color: "var(--status-good)" }}>▼</span>}
                    {formatMoney(entry.amount, entry.currency)} / {FREQUENCY_LABELS[entry.frequency]}
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
