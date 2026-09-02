import Foundation

enum Currency {
    private static var formatterCache: [String: NumberFormatter] = [:]

    static func formatMoney(_ amount: Double, currency: String) -> String {
        if let formatter = formatterCache[currency] {
            return formatter.string(from: NSNumber(value: amount)) ?? fallbackFormat(amount)
        }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "en_US")
        formatter.currencyCode = currency
        if formatter.string(from: NSNumber(value: amount)) == nil {
            // Invalid/unknown ISO code — fall back to USD formatting.
            formatter.currencyCode = "USD"
        }
        formatterCache[currency] = formatter
        return formatter.string(from: NSNumber(value: amount)) ?? fallbackFormat(amount)
    }

    private static func fallbackFormat(_ amount: Double) -> String {
        String(format: "$%.2f", amount)
    }

    // Rate is stored as: 1 unit of `currency` = exchangeRates[currency] units of baseCurrency.
    static func toBaseCurrency(_ amount: Double, currency: String, settings: AppSettings) -> Double {
        if currency == settings.baseCurrency { return amount }
        guard let rate = settings.exchangeRates[currency], rate > 0 else { return amount }
        return amount * rate
    }
}
