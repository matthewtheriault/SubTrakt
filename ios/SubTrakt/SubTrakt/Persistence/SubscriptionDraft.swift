import Foundation

// Plain form-input struct used by SubscriptionFormView, kept separate from
// the persisted Subscription model — mirrors SubscriptionInput in the
// original TypeScript source.
struct SubscriptionDraft {
    var name: String = ""
    var category: String = ""
    var amount: Double = 0
    var currency: String = "USD"
    var frequency: Frequency = .monthly
    var paymentDate: String? = nil
    var account: String = ""
    var notes: String? = nil
    var isTrial: Bool = false
    var trialEndDate: String? = nil
    var lastUsedDate: String? = nil
    var logoOverride: String? = nil
    var customLogoData: Data? = nil

    static func from(_ sub: Subscription) -> SubscriptionDraft {
        SubscriptionDraft(
            name: sub.name,
            category: sub.category,
            amount: sub.amount,
            currency: sub.currency,
            frequency: sub.frequency,
            paymentDate: sub.paymentDate,
            account: sub.account,
            notes: sub.notes,
            isTrial: sub.isTrial,
            trialEndDate: sub.trialEndDate,
            lastUsedDate: sub.lastUsedDate,
            logoOverride: sub.logoOverride,
            customLogoData: sub.customLogoData
        )
    }
}
