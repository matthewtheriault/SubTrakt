import type { Frequency } from "../types";

function parseISO(iso: string): Date | null {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return null;
  const d = new Date(year, month - 1, day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addPeriod(d: Date, frequency: Frequency): Date {
  const next = new Date(d);
  if (frequency === "biweekly") {
    next.setDate(next.getDate() + 14);
  } else if (frequency === "monthly") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setFullYear(next.getFullYear() + 1);
  }
  return next;
}

// If `iso` is strictly before today, advances it by whole periods (per `frequency`)
// until it lands on today or in the future. Returns the original string if it's
// empty, unparseable, or already current.
export function rollForwardToFuture(iso: string, frequency: Frequency): string {
  const date = parseISO(iso);
  if (!date) return iso;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let cursor = date;
  let guard = 0;
  while (cursor.getTime() < today.getTime() && guard < 1000) {
    cursor = addPeriod(cursor, frequency);
    guard += 1;
  }
  return toISO(cursor);
}

export function daysSince(iso: string): number | null {
  const date = parseISO(iso);
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((today.getTime() - date.getTime()) / 86_400_000);
}

export function todayISO(): string {
  return toISO(new Date());
}
