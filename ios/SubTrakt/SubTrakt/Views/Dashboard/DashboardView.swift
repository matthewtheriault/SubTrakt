import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var store: AppStore
    @State private var settingsOpen = false
    @State private var addOpen = false

    private var totals: (monthly: Double, yearly: Double, biweekly: Double) {
        let subs = store.subscriptions
        let settings = store.settings
        let monthly = subs.reduce(0) { $0 + Currency.toBaseCurrency($1.frequency.toMonthly($1.amount), currency: $1.currency, settings: settings) }
        let yearly = subs.reduce(0) { $0 + Currency.toBaseCurrency($1.frequency.toYearly($1.amount), currency: $1.currency, settings: settings) }
        let biweekly = subs.reduce(0) { $0 + Currency.toBaseCurrency($1.frequency.toBiWeekly($1.amount), currency: $1.currency, settings: settings) }
        return (monthly, yearly, biweekly)
    }

    private var nextPayment: Subscription? {
        let withDates: [Subscription] = store.subscriptions.filter { sub -> Bool in
            guard let date = sub.paymentDate else { return false }
            return !date.isEmpty
        }
        let sortedByDate: [Subscription] = withDates.sorted { (a: Subscription, b: Subscription) -> Bool in
            (a.paymentDate ?? "") < (b.paymentDate ?? "")
        }
        return sortedByDate.first
    }

    private var categoryBreakdown: [CategoryDatum] {
        let settings = store.settings
        let colorMap = CategoryColors.colorMap(for: store.subscriptions)
        var totalsByCategory: [String: Double] = [:]
        for sub in store.subscriptions {
            let monthly = Currency.toBaseCurrency(sub.frequency.toMonthly(sub.amount), currency: sub.currency, settings: settings)
            totalsByCategory[sub.category, default: 0] += monthly
        }
        return totalsByCategory
            .map { CategoryDatum(category: $0.key, monthly: $0.value, color: colorMap[$0.key] ?? Color("TextMuted")) }
            .sorted { $0.monthly > $1.monthly }
    }

    private var trialsEndingCount: Int {
        store.subscriptions.filter { SubscriptionQuery.isTrialEnding($0, settings: store.settings) }.count
    }

    private var cancelCandidatesCount: Int {
        store.subscriptions.filter { SubscriptionQuery.isCancelCandidate($0, settings: store.settings) }.count
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                        StatCardView(label: "Monthly", value: Currency.formatMoney(totals.monthly, currency: store.settings.baseCurrency), accent: true)
                        StatCardView(label: "Yearly", value: Currency.formatMoney(totals.yearly, currency: store.settings.baseCurrency))
                        StatCardView(label: "Bi-Weekly", value: Currency.formatMoney(totals.biweekly, currency: store.settings.baseCurrency))
                        StatCardView(
                            label: "Next Payment",
                            value: nextPayment.map { Currency.formatMoney($0.amount, currency: $0.currency) } ?? "—",
                            hint: nextPayment.map { "\($0.name) · \(Format.formatDate($0.paymentDate))" } ?? "Nothing scheduled"
                        )
                    }

                    VStack(spacing: 8) {
                        NavigationLink {
                            SubscriptionsListView(initialFilter: .trialsEnding)
                        } label: {
                            shortcutRow(title: "Trials ending soon", count: trialsEndingCount, tint: Color("StatusWarning"))
                        }
                        NavigationLink {
                            SubscriptionsListView(initialFilter: .cancelCandidates)
                        } label: {
                            shortcutRow(title: "Cancel candidates", count: cancelCandidatesCount, tint: Color("StatusSerious"))
                        }
                    }

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Spend by category")
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(Color("TextPrimary"))
                        CategoryBreakdownView(data: categoryBreakdown, baseCurrency: store.settings.baseCurrency)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .cardBackground()
                }
                .padding(16)
            }
            .background(Color("Page"))
            .navigationTitle("SubTrakt")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        settingsOpen = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        addOpen = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
            .sheet(isPresented: $settingsOpen) {
                SettingsView()
            }
            .sheet(isPresented: $addOpen) {
                SubscriptionFormView(existing: nil)
            }
        }
    }

    private func shortcutRow(title: String, count: Int, tint: Color) -> some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundStyle(Color("TextPrimary"))
            Spacer()
            if count > 0 {
                Text("\(count)")
                    .font(.caption.weight(.semibold))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Capsule().fill(tint))
                    .foregroundStyle(Color("AccentInk"))
            }
            Image(systemName: "chevron.right")
                .font(.caption)
                .foregroundStyle(Color("TextMuted"))
        }
        .padding(12)
        .cardBackground()
    }
}
