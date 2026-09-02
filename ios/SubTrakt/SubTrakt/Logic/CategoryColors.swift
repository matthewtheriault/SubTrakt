import SwiftUI

// Fixed categorical order — never cycled or reassigned. The 9th+ distinct
// category falls back to a neutral muted tone rather than repeating a hue.
enum CategoryColors {
    private static let slotNames = [
        "Series1", "Series2", "Series3", "Series4", "Series5", "Series6", "Series7", "Series8",
    ]
    private static let fallbackName = "SeriesMuted"

    static func colorMap(for subscriptions: [Subscription]) -> [String: Color] {
        var firstSeen: [String] = []
        for sub in subscriptions.sorted(by: { $0.createdAt < $1.createdAt }) {
            if !firstSeen.contains(sub.category) { firstSeen.append(sub.category) }
        }
        let ordered = Constants.defaultCategories.filter { firstSeen.contains($0) }
            + firstSeen.filter { !Constants.defaultCategories.contains($0) }

        var map: [String: Color] = [:]
        for (index, category) in ordered.enumerated() {
            let name = index < slotNames.count ? slotNames[index] : fallbackName
            map[category] = Color(name)
        }
        return map
    }

    static func orderedCategories(for subscriptions: [Subscription]) -> [String] {
        var firstSeen: [String] = []
        for sub in subscriptions.sorted(by: { $0.createdAt < $1.createdAt }) {
            if !firstSeen.contains(sub.category) { firstSeen.append(sub.category) }
        }
        return Constants.defaultCategories.filter { firstSeen.contains($0) }
            + firstSeen.filter { !Constants.defaultCategories.contains($0) }
    }
}
