import Foundation

enum Format {
    private static let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US")
        f.dateFormat = "MMM d, yyyy"
        return f
    }()

    static func formatDate(_ iso: String?) -> String {
        guard let iso, !iso.isEmpty, let date = DateMath.parseISODate(iso) else { return "—" }
        return dateFormatter.string(from: date)
    }
}
