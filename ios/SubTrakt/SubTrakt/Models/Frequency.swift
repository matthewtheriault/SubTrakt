import Foundation

enum Frequency: String, Codable, CaseIterable, Identifiable {
    case biweekly
    case monthly
    case semiannual
    case yearly

    var id: String { rawValue }

    var occurrencesPerYear: Double {
        switch self {
        case .biweekly: return 26
        case .monthly: return 12
        case .semiannual: return 2
        case .yearly: return 1
        }
    }

    var label: String {
        switch self {
        case .biweekly: return "Bi-Weekly"
        case .monthly: return "Monthly"
        case .semiannual: return "Semi-Annual"
        case .yearly: return "Yearly"
        }
    }

    var perUnitLabel: String {
        switch self {
        case .biweekly: return "period"
        case .monthly: return "month"
        case .semiannual: return "6mo"
        case .yearly: return "year"
        }
    }

    func toMonthly(_ amount: Double) -> Double { amount * occurrencesPerYear / 12 }
    func toYearly(_ amount: Double) -> Double { amount * occurrencesPerYear }
    func toBiWeekly(_ amount: Double) -> Double { amount * occurrencesPerYear / 26 }
}
