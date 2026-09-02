import Foundation

// Launch-time data-hygiene pass: rolls any past-due paymentDate forward to
// its next future occurrence. (Reminder firing itself is handled by
// NotificationScheduler via real scheduled local notifications, not here.)
enum Reconciler {
    static func rollForwardPastDue(_ subscriptions: [Subscription]) -> (updated: [Subscription], changed: Bool) {
        var changed = false
        let updated = subscriptions.map { sub -> Subscription in
            guard let paymentDate = sub.paymentDate, !paymentDate.isEmpty else { return sub }
            let rolled = DateMath.rollForwardToFuture(paymentDate, frequency: sub.frequency)
            guard rolled != paymentDate else { return sub }
            var next = sub
            next.paymentDate = rolled
            next.lastNotifiedDate = nil
            changed = true
            return next
        }
        return (updated, changed)
    }
}
