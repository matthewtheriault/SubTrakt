import SwiftUI
import UserNotifications

final class NotificationDelegate: NSObject, UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification
    ) async -> UNNotificationPresentationOptions {
        [.banner, .sound, .list]
    }
}

@main
struct SubTraktApp: App {
    @StateObject private var store = AppStore()
    private let notificationDelegate = NotificationDelegate()

    init() {
        UNUserNotificationCenter.current().delegate = notificationDelegate
    }

    var body: some Scene {
        WindowGroup {
            RootTabView()
                .environmentObject(store)
                .task {
                    await store.load()
                }
                .fullScreenCover(isPresented: Binding(
                    get: { !store.isLoading && !store.settings.hasCompletedOnboarding },
                    set: { _ in }
                )) {
                    OnboardingView()
                        .environmentObject(store)
                }
                .onChange(of: store.settings.appearance, initial: true) { _, appearance in
                    applyAppearance(appearance)
                }
        }
    }

    // Set on the window rather than via .preferredColorScheme, which doesn't
    // reliably switch back to following the system once it's been forced,
    // and doesn't reach sheets presented from other windows.
    private func applyAppearance(_ appearance: Appearance) {
        for scene in UIApplication.shared.connectedScenes {
            guard let windowScene = scene as? UIWindowScene else { continue }
            for window in windowScene.windows {
                window.overrideUserInterfaceStyle = appearance.interfaceStyle
            }
        }
    }
}
