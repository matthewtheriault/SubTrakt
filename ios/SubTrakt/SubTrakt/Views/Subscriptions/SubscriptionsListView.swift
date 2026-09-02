import SwiftUI

struct SubscriptionsListView: View {
    @EnvironmentObject private var store: AppStore
    let initialFilter: SubscriptionFilter
    var initialCategory: String? = nil

    @State private var search = ""
    @State private var activeCategory: String?
    @State private var activeFilter: SubscriptionFilter
    @State private var sortKey: SubscriptionSort = .date
    @State private var editingSubscription: Subscription?
    @State private var pendingDelete: Subscription?
    @State private var addOpen = false

    init(initialFilter: SubscriptionFilter = .all, initialCategory: String? = nil) {
        self.initialFilter = initialFilter
        self.initialCategory = initialCategory
        _activeFilter = State(initialValue: initialFilter)
        _activeCategory = State(initialValue: initialCategory)
    }

    private var colorMap: [String: Color] {
        CategoryColors.colorMap(for: store.subscriptions)
    }

    private var knownCategories: [String] {
        KnownCategories.known(from: store.subscriptions)
    }

    private var categoryCounts: [String: Int] {
        KnownCategories.counts(for: store.subscriptions)
    }

    private var visibleSubscriptions: [Subscription] {
        let filteredList = SubscriptionQuery.filtered(
            store.subscriptions,
            filter: activeFilter,
            category: activeCategory,
            search: search,
            settings: store.settings
        )
        return SubscriptionQuery.sorted(filteredList, by: sortKey, settings: store.settings)
    }

    private var listTitle: String {
        switch activeFilter {
        case .cancelCandidates: return "Cancel candidates"
        case .trialsEnding: return "Trials ending soon"
        case .all: return activeCategory ?? "All subscriptions"
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            categoryFilterBar

            if visibleSubscriptions.isEmpty {
                Spacer()
                EmptyStateView(title: emptyTitle, message: emptyMessage)
                    .padding(24)
                Spacer()
            } else {
                List {
                    Section {
                        ForEach(visibleSubscriptions) { sub in
                            SubscriptionRowView(
                                sub: sub,
                                color: colorMap[sub.category] ?? Color("TextMuted"),
                                settings: store.settings,
                                onEdit: { editingSubscription = sub },
                                onDelete: { pendingDelete = sub },
                                onMarkUsedToday: { store.markUsedToday(id: sub.id) },
                                onMarkPaid: { store.markPaid(id: sub.id) }
                            )
                        }
                    } header: {
                        Text("\(listTitle) · \(visibleSubscriptions.count)")
                    }
                }
                .listStyle(.plain)
            }
        }
        .background(Color("Page"))
        .navigationTitle("Subscriptions")
        .searchable(text: $search, prompt: "Search subscriptions, accounts, categories…")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Menu {
                    Picker("Sort", selection: $sortKey) {
                        Text("Upcoming").tag(SubscriptionSort.date)
                        Text("Amount").tag(SubscriptionSort.amount)
                        Text("Name").tag(SubscriptionSort.name)
                    }
                } label: {
                    Image(systemName: "arrow.up.arrow.down")
                }
                Button {
                    addOpen = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(item: $editingSubscription) { sub in
            SubscriptionFormView(existing: sub)
        }
        .sheet(isPresented: $addOpen) {
            SubscriptionFormView(existing: nil)
        }
        .alert("Delete subscription", isPresented: Binding(get: { pendingDelete != nil }, set: { if !$0 { pendingDelete = nil } })) {
            Button("Cancel", role: .cancel) { pendingDelete = nil }
            Button("Delete", role: .destructive) {
                if let sub = pendingDelete { store.deleteSubscription(id: sub.id) }
                pendingDelete = nil
            }
        } message: {
            Text("Delete \"\(pendingDelete?.name ?? "")\"? This can't be undone.")
        }
    }

    private var categoryFilterBar: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                filterChip(title: "All", isActive: activeFilter == .all && activeCategory == nil) {
                    activeFilter = .all
                    activeCategory = nil
                }
                ForEach(knownCategories, id: \.self) { category in
                    filterChip(
                        title: "\(category) (\(categoryCounts[category] ?? 0))",
                        isActive: activeFilter == .all && activeCategory == category,
                        dotColor: colorMap[category]
                    ) {
                        activeFilter = .all
                        activeCategory = category
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
    }

    private func filterChip(title: String, isActive: Bool, dotColor: Color? = nil, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 5) {
                if let dotColor {
                    Circle().fill(dotColor).frame(width: 6, height: 6)
                }
                Text(title).font(.caption)
            }
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(Capsule().fill(isActive ? Color("Accent") : Color("Surface2")))
            .foregroundStyle(isActive ? Color("AccentInk") : Color("TextSecondary"))
        }
        .buttonStyle(.plain)
    }

    private var emptyTitle: String {
        store.subscriptions.isEmpty ? "No subscriptions yet" : "Nothing here"
    }

    private var emptyMessage: String {
        if store.subscriptions.isEmpty {
            return "Add your first subscription to start tracking your spend."
        }
        switch activeFilter {
        case .cancelCandidates: return "Nothing unused past your threshold. Set \"Last used\" dates to track this."
        case .trialsEnding: return "No trials converting soon."
        case .all: return "Try a different search or category."
        }
    }
}
