import UIKit

enum Appearance: String, Codable, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var label: String {
        switch self {
        case .system: return "System"
        case .light: return "Light"
        case .dark: return "Dark"
        }
    }

    var interfaceStyle: UIUserInterfaceStyle {
        switch self {
        case .system: return .unspecified
        case .light: return .light
        case .dark: return .dark
        }
    }
}

// Named AppSettings (not `Settings`) to avoid colliding with SwiftUI's own
// `Settings<Content>` scene type.
struct AppSettings: Codable, Equatable {
    var baseCurrency: String
    var exchangeRates: [String: Double]
    var reminderDaysBefore: Int
    var staleAfterDays: Int
    var appearance: Appearance
    var hasCompletedOnboarding: Bool

    static let `default` = AppSettings(
        baseCurrency: "USD",
        exchangeRates: [:],
        reminderDaysBefore: 3,
        staleAfterDays: 30
    )

    init(
        baseCurrency: String,
        exchangeRates: [String: Double],
        reminderDaysBefore: Int,
        staleAfterDays: Int,
        appearance: Appearance = .system,
        hasCompletedOnboarding: Bool = false
    ) {
        self.baseCurrency = baseCurrency
        self.exchangeRates = exchangeRates
        self.reminderDaysBefore = reminderDaysBefore
        self.staleAfterDays = staleAfterDays
        self.appearance = appearance
        self.hasCompletedOnboarding = hasCompletedOnboarding
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let baseCurrency = (try? c.decodeIfPresent(String.self, forKey: .baseCurrency)) ?? nil
        self.baseCurrency = (baseCurrency?.isEmpty == false) ? baseCurrency! : "USD"
        self.exchangeRates = (try? c.decodeIfPresent([String: Double].self, forKey: .exchangeRates)) ?? nil ?? [:]
        self.reminderDaysBefore = (try? c.decodeIfPresent(Int.self, forKey: .reminderDaysBefore)) ?? nil ?? 3
        self.staleAfterDays = (try? c.decodeIfPresent(Int.self, forKey: .staleAfterDays)) ?? nil ?? 30
        self.appearance = (try? c.decodeIfPresent(Appearance.self, forKey: .appearance)) ?? nil ?? .system
        self.hasCompletedOnboarding = (try? c.decodeIfPresent(Bool.self, forKey: .hasCompletedOnboarding)) ?? nil ?? false
    }
}
