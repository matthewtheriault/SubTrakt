import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem { Label("Dashboard", systemImage: "chart.bar") }

            NavigationStack {
                SubscriptionsListView(initialFilter: .all)
            }
            .tabItem { Label("Subscriptions", systemImage: "list.bullet") }
        }
        .tint(Color("Accent"))
    }
}
