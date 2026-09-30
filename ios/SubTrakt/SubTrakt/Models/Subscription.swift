import Foundation

struct Subscription: Identifiable, Codable, Equatable {
    var id: String
    var name: String
    var category: String
    var amount: Double
    var currency: String
    var frequency: Frequency
    var paymentDate: String?
    var account: String
    var notes: String?
    var isTrial: Bool
    var trialEndDate: String?
    var lastUsedDate: String?
    var logoOverride: String?
    var customLogoData: Data?
    var priceHistory: [PriceHistoryEntry]
    var lastNotifiedDate: String?
    var lastTrialNotifiedDate: String?
    var createdAt: String
    var updatedAt: String

    init(
        id: String = UUID().uuidString,
        name: String,
        category: String,
        amount: Double,
        currency: String,
        frequency: Frequency,
        paymentDate: String?,
        account: String,
        notes: String? = nil,
        isTrial: Bool = false,
        trialEndDate: String? = nil,
        lastUsedDate: String? = nil,
        logoOverride: String? = nil,
        customLogoData: Data? = nil,
        priceHistory: [PriceHistoryEntry],
        lastNotifiedDate: String? = nil,
        lastTrialNotifiedDate: String? = nil,
        createdAt: String,
        updatedAt: String
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.amount = amount
        self.currency = currency
        self.frequency = frequency
        self.paymentDate = paymentDate
        self.account = account
        self.notes = notes
        self.isTrial = isTrial
        self.trialEndDate = trialEndDate
        self.lastUsedDate = lastUsedDate
        self.logoOverride = logoOverride
        self.customLogoData = customLogoData
        self.priceHistory = priceHistory
        self.lastNotifiedDate = lastNotifiedDate
        self.lastTrialNotifiedDate = lastTrialNotifiedDate
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }

    // Backfills fields that may be missing from older/partial persisted JSON,
    // mirroring src/lib/normalize.ts, so a corrupted or legacy record never
    // crashes decoding.
    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)

        let currency = (try? c.decodeIfPresent(String.self, forKey: .currency)) ?? nil
        let resolvedCurrency = (currency?.isEmpty == false) ? currency! : "USD"
        let amount = (try? c.decodeIfPresent(Double.self, forKey: .amount)) ?? nil ?? 0
        let frequency = (try? c.decodeIfPresent(Frequency.self, forKey: .frequency)) ?? nil ?? .monthly
        let createdAtRaw = (try? c.decodeIfPresent(String.self, forKey: .createdAt)) ?? nil
        let createdAt = (createdAtRaw?.isEmpty == false) ? createdAtRaw! : ISO8601DateFormatter().string(from: Date())

        let history = (try? c.decodeIfPresent([PriceHistoryEntry].self, forKey: .priceHistory)) ?? nil
        let priceHistory: [PriceHistoryEntry]
        if let history, !history.isEmpty {
            priceHistory = history
        } else {
            let effectiveFrom = String(createdAt.prefix(10)).isEmpty ? DateMath.todayISO() : String(createdAt.prefix(10))
            priceHistory = [PriceHistoryEntry(amount: amount, frequency: frequency, currency: resolvedCurrency, effectiveFrom: effectiveFrom)]
        }

        let idRaw = (try? c.decodeIfPresent(String.self, forKey: .id)) ?? nil
        self.id = (idRaw?.isEmpty == false) ? idRaw! : UUID().uuidString
        self.name = (try? c.decodeIfPresent(String.self, forKey: .name)) ?? nil ?? ""
        let categoryRaw = (try? c.decodeIfPresent(String.self, forKey: .category)) ?? nil
        self.category = (categoryRaw?.isEmpty == false) ? categoryRaw! : "Other"
        self.amount = amount
        self.currency = resolvedCurrency
        self.frequency = frequency
        self.paymentDate = (try? c.decodeIfPresent(String.self, forKey: .paymentDate)) ?? nil
        self.account = (try? c.decodeIfPresent(String.self, forKey: .account)) ?? nil ?? ""
        self.notes = (try? c.decodeIfPresent(String.self, forKey: .notes)) ?? nil
        self.isTrial = (try? c.decodeIfPresent(Bool.self, forKey: .isTrial)) ?? nil ?? false
        self.trialEndDate = (try? c.decodeIfPresent(String.self, forKey: .trialEndDate)) ?? nil
        self.lastUsedDate = (try? c.decodeIfPresent(String.self, forKey: .lastUsedDate)) ?? nil
        self.logoOverride = (try? c.decodeIfPresent(String.self, forKey: .logoOverride)) ?? nil
        self.customLogoData = (try? c.decodeIfPresent(Data.self, forKey: .customLogoData)) ?? nil
        self.priceHistory = priceHistory
        self.lastNotifiedDate = (try? c.decodeIfPresent(String.self, forKey: .lastNotifiedDate)) ?? nil
        self.lastTrialNotifiedDate = (try? c.decodeIfPresent(String.self, forKey: .lastTrialNotifiedDate)) ?? nil
        self.createdAt = createdAt
        let updatedAtRaw = (try? c.decodeIfPresent(String.self, forKey: .updatedAt)) ?? nil
        self.updatedAt = (updatedAtRaw?.isEmpty == false) ? updatedAtRaw! : createdAt
    }
}
