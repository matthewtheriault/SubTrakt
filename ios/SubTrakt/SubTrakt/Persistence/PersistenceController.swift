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

    func loadSubscriptions() -> [Subscription] {
        guard let data = try? Data(contentsOf: subscriptionsURL) else { return [] }
        return (try? JSONDecoder().decode([Subscription].self, from: data)) ?? []
    }

    func loadSettings() -> AppSettings {
        guard let data = try? Data(contentsOf: settingsURL) else { return .default }
        return (try? JSONDecoder().decode(AppSettings.self, from: data)) ?? .default
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
