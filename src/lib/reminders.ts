import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";
import type { Settings, Subscription } from "../types";
import { FREQUENCY_LABELS } from "../types";
import { daysSince, rollForwardToFuture } from "./dateMath";
import { formatMoney } from "./currency";

function daysUntilFromToday(iso: string): number | null {
  if (!iso) return null;
  const since = daysSince(iso);
  return since === null ? null : -since;
}

// Rolls forward any past-due payment dates, then fires (deduped) native
// notifications for payments and trial-conversions landing within the
// reminder window. Returns the updated subscription list only if something
// changed, so the caller can decide whether a persist is needed.
export async function reconcileSubscriptions(
  subscriptions: Subscription[],
  settings: Settings,
): Promise<Subscription[] | null> {
  let changed = false;

  // Permission is requested in context (onboarding, first add), never here.
  const granted = await isPermissionGranted();

  const next = subscriptions.map((sub) => {
    let s = sub;

    // Roll a past-due payment forward to its next future occurrence.
    if (s.paymentDate) {
      const rolled = rollForwardToFuture(s.paymentDate, s.frequency);
      if (rolled !== s.paymentDate) {
        s = { ...s, paymentDate: rolled, lastNotifiedDate: undefined };
        changed = true;
      }
    }

    // Due-payment reminder.
    if (s.paymentDate) {
      const days = daysUntilFromToday(s.paymentDate);
      if (
        days !== null &&
        days >= 0 &&
        days <= settings.reminderDaysBefore &&
        s.lastNotifiedDate !== s.paymentDate
      ) {
        if (granted) {
          const when = days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`;
          sendNotification({
            title: `${s.name} · ${formatMoney(s.amount, s.currency)}`,
            body: `Charges ${when} (${FREQUENCY_LABELS[s.frequency]}) from ${s.account}`,
          });
        }
        s = { ...s, lastNotifiedDate: s.paymentDate };
        changed = true;
      }
    }

    // Trial-ending reminder.
    if (s.isTrial && s.trialEndDate) {
      const days = daysUntilFromToday(s.trialEndDate);
      if (
        days !== null &&
        days >= 0 &&
        days <= settings.reminderDaysBefore &&
        s.lastTrialNotifiedDate !== s.trialEndDate
      ) {
        if (granted) {
          const when = days === 0 ? "today" : `in ${days} day${days === 1 ? "" : "s"}`;
          sendNotification({
            title: `Trial ending: ${s.name}`,
            body: `Converts to ${formatMoney(s.amount, s.currency)} ${when} unless you cancel`,
          });
        }
        s = { ...s, lastTrialNotifiedDate: s.trialEndDate };
        changed = true;
      }
    }

    return s;
  });

  return changed ? next : null;
}

// Asks for notification permission if it hasn't been granted yet. The OS only
// shows the prompt once; later calls just return the stored answer.
export async function requestNotificationPermission(): Promise<boolean> {
  if (await isPermissionGranted()) return true;
  return (await requestPermission()) === "granted";
}
