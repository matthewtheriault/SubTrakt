import Foundation
import UserNotifications

// Schedules real local notifications for upcoming payments and trial
// conversions, rather than only computing reminders when the app happens to
// be foregrounded (the desktop app's pattern). The full pending set is
// rebuilt from scratch on every relevant mutation, which makes de-dup
// automatic: an identifier is keyed on `subscriptionId + the exact date
// value being reminded about`, so a given (subscription, date) pair can
// never be scheduled twice, and once that date changes the old identifier
// simply isn't re-added on the next reschedule.
@MainActor
final class NotificationScheduler {
    static let shared = NotificationScheduler()

    private let center = UNUserNotificationCenter.current()
    private let fireHour = 9 // 9:00 AM local
    private let pendingCap = 64 // iOS's hard limit on pending local notifications

    func requestAuthorizationIfNeeded() async {
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .notDetermined else { return }
        _ = try? await center.requestAuthorization(options: [.alert, .sound, .badge])
    }

    func rescheduleAll(subscriptions: [Subscription], settings: AppSettings) async {
        let authStatus = await center.notificationSettings().authorizationStatus
        center.removeAllPendingNotificationRequests()
        guard authStatus == .authorized || authStatus == .provisional else { return }

        var candidates: [(date: Date, request: UNNotificationRequest)] = []

        for sub in subscriptions {
            if let paymentDate = sub.paymentDate, !paymentDate.isEmpty {
                if let candidate = paymentCandidate(for: sub, paymentDate: paymentDate, settings: settings) {
                    candidates.append(candidate)
                }
            }
            if sub.isTrial, let trialEndDate = sub.trialEndDate, !trialEndDate.isEmpty {
                if let candidate = trialCandidate(for: sub, trialEndDate: trialEndDate, settings: settings) {
                    candidates.append(candidate)
                }
            }
        }

        candidates.sort { $0.date < $1.date }
        for candidate in candidates.prefix(pendingCap) {
            try? await center.add(candidate.request)
        }
    }

    private func paymentCandidate(for sub: Subscription, paymentDate: String, settings: AppSettings) -> (date: Date, request: UNNotificationRequest)? {
        guard let targetDate = DateMath.parseISODate(paymentDate) else { return nil }
        guard let fireDate = fireDate(before: targetDate, daysBefore: settings.reminderDaysBefore) else { return nil }

        let when = settings.reminderDaysBefore <= 0 ? "today" : "in \(settings.reminderDaysBefore)d"
        let content = UNMutableNotificationContent()
        content.title = "\(sub.name) · \(Currency.formatMoney(sub.amount, currency: sub.currency))"
        content.body = "Charges \(when) (\(sub.frequency.label)) from \(sub.account)"
        content.sound = .default

        let identifier = "payment.\(sub.id).\(paymentDate)"
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger(for: fireDate))
        return (fireDate, request)
    }

    private func trialCandidate(for sub: Subscription, trialEndDate: String, settings: AppSettings) -> (date: Date, request: UNNotificationRequest)? {
        guard let targetDate = DateMath.parseISODate(trialEndDate) else { return nil }
        guard let fireDate = fireDate(before: targetDate, daysBefore: settings.reminderDaysBefore) else { return nil }

        let when = settings.reminderDaysBefore <= 0 ? "today" : "in \(settings.reminderDaysBefore)d"
        let content = UNMutableNotificationContent()
        content.title = "Trial ending: \(sub.name)"
        content.body = "Converts to \(Currency.formatMoney(sub.amount, currency: sub.currency)) \(when) unless you cancel"
        content.sound = .default

        let identifier = "trial.\(sub.id).\(trialEndDate)"
        let request = UNNotificationRequest(identifier: identifier, content: content, trigger: trigger(for: fireDate))
        return (fireDate, request)
    }

    private func fireDate(before targetDate: Date, daysBefore: Int, calendar: Calendar = .current) -> Date? {
        guard let dayOfReminder = calendar.date(byAdding: .day, value: -daysBefore, to: targetDate) else { return nil }
        var components = calendar.dateComponents([.year, .month, .day], from: dayOfReminder)
        components.hour = fireHour
        components.minute = 0
        components.second = 0
        return calendar.date(from: components)
    }

    private func trigger(for fireDate: Date, calendar: Calendar = .current) -> UNNotificationTrigger {
        if fireDate <= Date() {
            // Already past — fire a short while from now instead of silently skipping it.
            return UNTimeIntervalNotificationTrigger(timeInterval: 5 * 60, repeats: false)
        }
        let components = calendar.dateComponents([.year, .month, .day, .hour, .minute], from: fireDate)
        return UNCalendarNotificationTrigger(dateMatching: components, repeats: false)
    }
}
