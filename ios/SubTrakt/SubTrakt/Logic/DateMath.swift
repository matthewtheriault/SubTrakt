import Foundation

// Dates are stored as plain "YYYY-MM-DD" strings and always compared as
// local calendar dates (never UTC), matching the original app's `new
// Date(year, month-1, day)` semantics.
enum DateMath {
    static func parseISODate(_ iso: String, calendar: Calendar = .current) -> Date? {
        let parts = iso.split(separator: "-")
        guard parts.count == 3,
              let year = Int(parts[0]), let month = Int(parts[1]), let day = Int(parts[2]),
              year > 0, month > 0, day > 0
        else { return nil }
        var components = DateComponents()
        components.year = year
        components.month = month
        components.day = day
        return calendar.date(from: components)
    }

    static func isoString(from date: Date, calendar: Calendar = .current) -> String {
        let components = calendar.dateComponents([.year, .month, .day], from: date)
        let year = components.year ?? 1970
        let month = components.month ?? 1
        let day = components.day ?? 1
        return String(format: "%04d-%02d-%02d", year, month, day)
    }

    static func todayISO(calendar: Calendar = .current) -> String {
        isoString(from: calendar.startOfDay(for: Date()), calendar: calendar)
    }

    static func addPeriod(_ date: Date, frequency: Frequency, calendar: Calendar = .current) -> Date {
        switch frequency {
        case .biweekly:
            return calendar.date(byAdding: .day, value: 14, to: date) ?? date
        case .monthly:
            return calendar.date(byAdding: .month, value: 1, to: date) ?? date
        case .semiannual:
            return calendar.date(byAdding: .month, value: 6, to: date) ?? date
        case .yearly:
            return calendar.date(byAdding: .year, value: 1, to: date) ?? date
        }
    }

    // Advances an ISO date forward by exactly one billing period.
    static func advanceOnePeriod(_ iso: String, frequency: Frequency) -> String {
        guard let date = parseISODate(iso) else { return iso }
        return isoString(from: addPeriod(date, frequency: frequency))
    }

    // If `iso` is strictly before today, advances it by whole periods until
    // it lands on today or in the future. Returns the original string if
    // it's empty, unparseable, or already current.
    static func rollForwardToFuture(_ iso: String, frequency: Frequency, calendar: Calendar = .current) -> String {
        guard let date = parseISODate(iso, calendar: calendar) else { return iso }
        let today = calendar.startOfDay(for: Date())
        var cursor = date
        var guardCount = 0
        while cursor < today && guardCount < 1000 {
            cursor = addPeriod(cursor, frequency: frequency, calendar: calendar)
            guardCount += 1
        }
        return isoString(from: cursor, calendar: calendar)
    }

    static func daysSince(_ iso: String, calendar: Calendar = .current) -> Int? {
        guard let date = parseISODate(iso, calendar: calendar) else { return nil }
        let today = calendar.startOfDay(for: Date())
        let days = calendar.dateComponents([.day], from: date, to: today).day ?? 0
        return days
    }

    static func daysUntil(_ iso: String, calendar: Calendar = .current) -> Int? {
        guard let since = daysSince(iso, calendar: calendar) else { return nil }
        return -since
    }
}
