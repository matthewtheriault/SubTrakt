import Foundation

struct PersistenceController {
    static let shared = PersistenceController()

    private let directoryURL: URL
    private let subscriptionsURL: URL
    private let settingsURL: URL

    init(fileManager: FileManager = .default) {
        let base = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? fileManager.temporaryDirectory
        let bundleID = Bundle.main.bundleIdentifier ?? "SubTrakt"
        directoryURL = base.appendingPathComponent(bundleID, isDirectory: true)
        subscriptionsURL = directoryURL.appendingPathComponent("subscriptions.json")
        settingsURL = directoryURL.appendingPathComponent("settings.json")
        try? fileManager.createDirectory(at: directoryURL, withIntermediateDirectories: true)
    }

    // Decodes element-by-element so one unreadable record doesn't take the
    // rest down with it. Whenever anything is dropped, the original file is
    // copied aside first — the next save overwrites subscriptions.json, and
    // without the backup that data would be gone for good.
    func loadSubscriptions() -> [Subscription] {
        guard let data = try? Data(contentsOf: subscriptionsURL) else { return [] }
        guard let elements = try? JSONDecoder().decode([Lossy<Subscription>].self, from: data) else {
            backUpUnreadable(subscriptionsURL)
            return []
        }
        let subscriptions = elements.compactMap(\.value)
        if subscriptions.count != elements.count {
            backUpUnreadable(subscriptionsURL)
        }
        return subscriptions
    }

    func loadSettings() -> AppSettings {
        guard let data = try? Data(contentsOf: settingsURL) else { return .default }
        guard let settings = try? JSONDecoder().decode(AppSettings.self, from: data) else {
            backUpUnreadable(settingsURL)
            return .default
        }
        return settings
    }

    // Copies e.g. subscriptions.json to subscriptions.unreadable-<timestamp>.json
    // in the same directory, leaving the original in place.
    private func backUpUnreadable(_ url: URL) {
        let stamp = ISO8601DateFormatter().string(from: Date()).replacingOccurrences(of: ":", with: "-")
        let name = url.deletingPathExtension().lastPathComponent
        let backupURL = directoryURL.appendingPathComponent("\(name).unreadable-\(stamp).json")
        try? FileManager.default.copyItem(at: url, to: backupURL)
    }

    func saveSubscriptions(_ subscriptions: [Subscription]) throws {
        let data = try JSONEncoder().encode(subscriptions)
        try data.write(to: subscriptionsURL, options: .atomic)
    }

    func saveSettings(_ settings: AppSettings) throws {
        let data = try JSONEncoder().encode(settings)
        try data.write(to: settingsURL, options: .atomic)
    }
}

// Decodes to nil instead of throwing, so a single bad array element can be
// skipped without failing the whole array.
private struct Lossy<Wrapped: Decodable>: Decodable {
    let value: Wrapped?

    init(from decoder: Decoder) throws {
        value = try? Wrapped(from: decoder)
    }
}
