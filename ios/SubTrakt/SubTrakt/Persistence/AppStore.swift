import Foundation

@MainActor
final class AppStore: ObservableObject {
    @Published private(set) var subscriptions: [Subscription] = []
    @Published private(set) var settings: AppSettings = .default
    @Published private(set) var isLoading = true

    private let persistence: PersistenceController
    private let notifications: NotificationScheduler

    init(persistence: PersistenceController = .shared, notifications: NotificationScheduler = .shared) {
        self.persistence = persistence
        self.notifications = notifications
    }

    func load() async {
        let loadedSubscriptions = persistence.loadSubscriptions()
        settings = persistence.loadSettings()

        let (rolled, changed) = Reconciler.rollForwardPastDue(loadedSubscriptions)
        subscriptions = rolled
        if changed {
            try? persistence.saveSubscriptions(subscriptions)
        }

        isLoading = false

        await notifications.rescheduleAll(subscriptions: subscriptions, settings: settings)
    }

    func addSubscription(_ draft: SubscriptionDraft) {
        let now = ISO8601DateFormatter().string(from: Date())
        let today = DateMath.todayISO()
        let newSub = Subscription(
            name: draft.name,
            category: draft.category,
            amount: draft.amount,
            currency: draft.currency,
            frequency: draft.frequency,
            paymentDate: draft.paymentDate,
            account: draft.account,
            notes: draft.notes,
            isTrial: draft.isTrial,
            trialEndDate: draft.trialEndDate,
            lastUsedDate: draft.lastUsedDate,
            logoOverride: draft.logoOverride,
            customLogoData: draft.customLogoData,
            priceHistory: [PriceHistoryEntry(amount: draft.amount, frequency: draft.frequency, currency: draft.currency, effectiveFrom: today)],
            createdAt: now,
            updatedAt: now
        )
        subscriptions.append(newSub)
        // Ask for notification permission here, in context, rather than on
        // first launch — this is the first moment a reminder is meaningful.
        persistAndReschedule(requestingAuthorization: true)
    }

    func updateSubscription(id: String, with draft: SubscriptionDraft) {
        guard let index = subscriptions.firstIndex(where: { $0.id == id }) else { return }
        let existing = subscriptions[index]
        let now = ISO8601DateFormatter().string(from: Date())

        let priceChanged = existing.amount != draft.amount || existing.frequency != draft.frequency || existing.currency != draft.currency
        var priceHistory = existing.priceHistory
        if priceChanged {
            priceHistory.append(PriceHistoryEntry(amount: draft.amount, frequency: draft.frequency, currency: draft.currency, effectiveFrom: DateMath.todayISO()))
        }

        var updated = existing
        updated.name = draft.name
        updated.category = draft.category
        updated.amount = draft.amount
        updated.currency = draft.currency
        updated.frequency = draft.frequency
        updated.paymentDate = draft.paymentDate
        updated.account = draft.account
        updated.notes = draft.notes
        updated.isTrial = draft.isTrial
        updated.trialEndDate = draft.trialEndDate
        updated.lastUsedDate = draft.lastUsedDate
        updated.logoOverride = draft.logoOverride
        updated.customLogoData = draft.customLogoData
        updated.priceHistory = priceHistory
        updated.lastNotifiedDate = draft.paymentDate != existing.paymentDate ? nil : existing.lastNotifiedDate
        updated.lastTrialNotifiedDate = draft.trialEndDate != existing.trialEndDate ? nil : existing.lastTrialNotifiedDate
        updated.updatedAt = now

        subscriptions[index] = updated
        persistAndReschedule()
    }

    func deleteSubscription(id: String) {
        subscriptions.removeAll { $0.id == id }
        persistAndReschedule()
    }

    func markUsedToday(id: String) {
        guard let index = subscriptions.firstIndex(where: { $0.id == id }) else { return }
        subscriptions[index].lastUsedDate = DateMath.todayISO()
        persist()
    }

    func markPaid(id: String) {
        guard let index = subscriptions.firstIndex(where: { $0.id == id }) else { return }
        let sub = subscriptions[index]
        guard let paymentDate = sub.paymentDate, !paymentDate.isEmpty else { return }
        subscriptions[index].paymentDate = DateMath.advanceOnePeriod(paymentDate, frequency: sub.frequency)
        subscriptions[index].lastNotifiedDate = nil
        persistAndReschedule()
    }

    func updateSettings(_ newSettings: AppSettings) {
        let reminderWindowChanged = newSettings.reminderDaysBefore != settings.reminderDaysBefore
        settings = newSettings
        try? persistence.saveSettings(settings)
        if reminderWindowChanged {
            persistAndReschedule(skipSubscriptionSave: true)
        }
    }

    private func persist() {
        try? persistence.saveSubscriptions(subscriptions)
    }

    private func persistAndReschedule(skipSubscriptionSave: Bool = false, requestingAuthorization: Bool = false) {
        if !skipSubscriptionSave {
            try? persistence.saveSubscriptions(subscriptions)
        }
        let subs = subscriptions
        let currentSettings = settings
        Task { [notifications] in
            if requestingAuthorization {
                await notifications.requestAuthorizationIfNeeded()
            }
            await notifications.rescheduleAll(subscriptions: subs, settings: currentSettings)
        }
    }
}
