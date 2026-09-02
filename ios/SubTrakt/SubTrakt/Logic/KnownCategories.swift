import Foundation

enum KnownCategories {
    static func known(from subscriptions: [Subscription]) -> [String] {
        var set = Constants.defaultCategories
        for sub in subscriptions where !set.contains(sub.category) {
            set.append(sub.category)
        }
        return set
    }

    static func counts(for subscriptions: [Subscription]) -> [String: Int] {
        var counts: [String: Int] = [:]
        for sub in subscriptions {
            counts[sub.category, default: 0] += 1
        }
        return counts
    }
}
