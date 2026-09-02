import Foundation

struct PriceHistoryEntry: Codable, Equatable, Hashable {
    var amount: Double
    var frequency: Frequency
    var currency: String
    var effectiveFrom: String // ISO date YYYY-MM-DD
}
