import Foundation

// Named AppSettings (not `Settings`) to avoid colliding with SwiftUI's own
// `Settings<Content>` scene type.
struct AppSettings: Codable, Equatable {
    var baseCurrency: String
    var exchangeRates: [String: Double]
    var reminderDaysBefore: Int
    var staleAfterDays: Int

    static let `default` = AppSettings(
        baseCurrency: "USD",
        exchangeRates: [:],
        reminderDaysBefore: 3,
        staleAfterDays: 30
    )

    init(baseCurrency: String, exchangeRates: [String: Double], reminderDaysBefore: Int, staleAfterDays: Int) {
        self.baseCurrency = baseCurrency
        self.exchangeRates = exchangeRates
        self.reminderDaysBefore = reminderDaysBefore
        self.staleAfterDays = staleAfterDays
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let baseCurrency = (try? c.decodeIfPresent(String.self, forKey: .baseCurrency)) ?? nil
        self.baseCurrency = (baseCurrency?.isEmpty == false) ? baseCurrency! : "USD"
        self.exchangeRates = (try? c.decodeIfPresent([String: Double].self, forKey: .exchangeRates)) ?? nil ?? [:]
        self.reminderDaysBefore = (try? c.decodeIfPresent(Int.self, forKey: .reminderDaysBefore)) ?? nil ?? 3
        self.staleAfterDays = (try? c.decodeIfPresent(Int.self, forKey: .staleAfterDays)) ?? nil ?? 30
    }
}
