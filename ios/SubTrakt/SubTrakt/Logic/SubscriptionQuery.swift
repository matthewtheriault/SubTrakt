import Foundation

enum SubscriptionFilter {
    case all
    case trialsEnding
    case cancelCandidates
}

enum SubscriptionSort {
    case date
    case amount
    case name
}

struct DueStatus {
    var text: String?
    var tone: Tone

    enum Tone {
        case normal, warning, critical
    }
}

enum SubscriptionQuery {
    static func isCancelCandidate(_ sub: Subscription, settings: AppSettings) -> Bool {
        guard let lastUsedDate = sub.lastUsedDate, !lastUsedDate.isEmpty else { return false }
        guard let unused = DateMath.daysSince(lastUsedDate) else { return false }
        return unused >= settings.staleAfterDays
    }

    static func isTrialEnding(_ sub: Subscription, settings: AppSettings) -> Bool {
        guard sub.isTrial, let trialEndDate = sub.trialEndDate, !trialEndDate.isEmpty else { return false }
        guard let days = DateMath.daysUntil(trialEndDate) else { return false }
        return days >= 0 && days <= settings.reminderDaysBefore
    }

    static func filtered(
        _ subscriptions: [Subscription],
        filter: SubscriptionFilter,
        category: String?,
        search: String,
        settings: AppSettings
    ) -> [Subscription] {
        var list: [Subscription]
        switch filter {
        case .all:
            list = subscriptions
            if let category { list = list.filter { $0.category == category } }
        case .trialsEnding:
            list = subscriptions.filter { isTrialEnding($0, settings: settings) }
        case .cancelCandidates:
            list = subscriptions.filter { isCancelCandidate($0, settings: settings) }
        }

        let query = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        if !query.isEmpty {
            list = list.filter {
                $0.name.lowercased().contains(query)
                    || $0.account.lowercased().contains(query)
                    || $0.category.lowercased().contains(query)
            }
        }
        return list
    }

    static func sorted(_ subscriptions: [Subscription], by sortKey: SubscriptionSort, settings: AppSettings) -> [Subscription] {
        switch sortKey {
        case .amount:
            return subscriptions.sorted { a, b in
                let am = Currency.toBaseCurrency(a.frequency.toMonthly(a.amount), currency: a.currency, settings: settings)
                let bm = Currency.toBaseCurrency(b.frequency.toMonthly(b.amount), currency: b.currency, settings: settings)
                return am > bm
            }
        case .name:
            return subscriptions.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
        case .date:
            return subscriptions.sorted { (a, b) in
                (a.paymentDate?.isEmpty == false ? a.paymentDate! : "9999") < (b.paymentDate?.isEmpty == false ? b.paymentDate! : "9999")
            }
        }
    }

    static func dueStatus(for sub: Subscription) -> DueStatus {
        guard let paymentDate = sub.paymentDate, !paymentDate.isEmpty,
              let remaining = DateMath.daysUntil(paymentDate)
        else { return DueStatus(text: nil, tone: .normal) }

        if remaining == 0 {
            return DueStatus(text: "Due today", tone: .warning)
        } else if remaining < 0 {
            return DueStatus(text: "\(Format.formatDate(paymentDate)) · overdue", tone: .critical)
        } else if remaining <= 3 {
            return DueStatus(text: "\(Format.formatDate(paymentDate)) · in \(remaining)d", tone: .warning)
        } else {
            return DueStatus(text: "\(Format.formatDate(paymentDate)) · in \(remaining)d", tone: .normal)
        }
    }

    static func isDueOrOverdue(_ sub: Subscription) -> Bool {
        guard let paymentDate = sub.paymentDate, !paymentDate.isEmpty,
              let remaining = DateMath.daysUntil(paymentDate)
        else { return false }
        return remaining <= 0
    }
}
