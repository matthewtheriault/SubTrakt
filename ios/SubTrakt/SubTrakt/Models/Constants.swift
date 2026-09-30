import Foundation

enum Constants {
    static let defaultCategories = [
        "Tech", "Gaming", "Entertainment", "Loans", "Server",
        "Food", "Utilities", "Health", "Finance", "Other",
    ]

    static let commonCurrencies = [
        "USD", "EUR", "GBP", "CAD", "AUD", "JPY", "CHF", "CNY",
        "INR", "MXN", "BRL", "NZD", "SEK", "NOK", "SGD",
    ]

    // Served by GitHub Pages from /docs on main; also entered in App Store
    // Connect as the Privacy Policy URL and Support URL.
    static let privacyPolicyURL = URL(string: "https://matthewtheriault.github.io/SubTrakt/privacy.html")!
    static let supportURL = URL(string: "https://matthewtheriault.github.io/SubTrakt/support.html")!
}
