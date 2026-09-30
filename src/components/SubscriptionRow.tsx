import { useState } from "react";
import type { Frequency, Subscription } from "../types";
import { FREQUENCY_LABELS } from "../types";
import { daysUntil, formatDate } from "../lib/format";
import { formatMoney } from "../lib/currency";
import { daysSince } from "../lib/dateMath";
import { LogoBadge } from "./LogoBadge";

const PERIOD_UNIT_LABELS: Record<Frequency, string> = {
  biweekly: "period",
  monthly: "month",
  semiannual: "6mo",
  yearly: "year",
};

interface SubscriptionRowProps {
  sub: Subscription;
  color: string;
  staleAfterDays: number;
  onEdit: () => void;
  onDelete: () => void;
  onMarkUsedToday: () => void;
  onMarkPaid: () => void;
}

export function SubscriptionRow({
  sub,
  color,
  staleAfterDays,
  onEdit,
  onDelete,
  onMarkUsedToday,
  onMarkPaid,
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
  const isDueOrOverdue = remaining !== null && remaining <= 0;

  return (
    <div
      className="rounded-2xl border transition-colors"
      style={{ background: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      <div className="group flex items-center gap-4 px-4 py-3.5">
        <div className="relative shrink-0">
          <LogoBadge sub={sub} size={40} />
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full"
            style={{ background: color, boxShadow: "0 0 0 2px var(--surface-1)" }}
            aria-hidden
          />
        </div>

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

        {isDueOrOverdue && (
          <label
            className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium cursor-pointer"
            style={{ color: "var(--status-warning)", background: "var(--surface-2)" }}
            title="Mark this payment as made and roll to the next cycle"
          >
            <input type="checkbox" checked={false} onChange={onMarkPaid} className="cursor-pointer" />
            Mark paid
          </label>
        )}

        <div className="shrink-0 text-right">
          <p className="tabular-nums text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            {formatMoney(sub.amount, sub.currency)}
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            per {PERIOD_UNIT_LABELS[sub.frequency]}
          </p>
        </div>

        <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {hasHistory && (
            <button
              type="button"
              onClick={() => setHistoryOpen((v) => !v)}
              title="Price history"
              aria-label="Price history"
              className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
              style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
            >
              <ClockIcon />
            </button>
          )}
          <button
            type="button"
            onClick={onMarkUsedToday}
            title="Used today"
            aria-label="Used today"
            className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
            style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
          >
            <CheckIcon />
          </button>
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            aria-label="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
            style={{ color: "var(--text-secondary)", background: "var(--surface-2)" }}
          >
            <PencilIcon />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            aria-label="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-full cursor-pointer"
            style={{ color: "var(--status-critical)", background: "var(--surface-2)" }}
          >
            <TrashIcon />
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

function ClockIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}
