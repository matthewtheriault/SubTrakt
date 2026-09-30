import SwiftUI

struct RootTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "chart.bar") }
                .tag(0)

            NavigationStack {
                SubscriptionsListView(initialFilter: .all)
            }
            .tabItem { Label("Subscriptions", systemImage: "list.bullet") }
            .tag(1)
        }
        .tint(Color("Accent"))
        #if DEBUG
        .modifier(ScreenshotRouting(selectedTab: $selectedTab))
        #endif
    }
}

#if DEBUG
// App Store screenshot support, compiled out of Release builds. Launching
// with `-screenshot <screen>` opens that screen directly, since simctl can't
// tap. Screens: dashboard, list, edit, settings. See ios/take_screenshots.sh.
private struct ScreenshotRouting: ViewModifier {
    @EnvironmentObject private var store: AppStore
    @Binding var selectedTab: Int
    @State private var editing: Subscription?
    @State private var settingsOpen = false

    private let screen = UserDefaults.standard.string(forKey: "screenshot")
    private let editName = UserDefaults.standard.string(forKey: "screenshotEdit")

    func body(content: Content) -> some View {
        content
            .onAppear {
                if screen == "list" { selectedTab = 1 }
            }
            .onChange(of: store.isLoading) { _, isLoading in
                guard !isLoading else { return }
                if screen == "settings" { settingsOpen = true }
                if screen == "edit" {
                    editing = store.subscriptions.first { $0.name == editName } ?? store.subscriptions.first
                }
            }
            .sheet(item: $editing) { sub in
                SubscriptionFormView(existing: sub).environmentObject(store)
            }
            .sheet(isPresented: $settingsOpen) {
                SettingsView().environmentObject(store)
            }
    }
}
#endif
