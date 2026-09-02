import SwiftUI

struct SubscriptionRowView: View {
    let sub: Subscription
    let color: Color
    let settings: AppSettings
    let onEdit: () -> Void
    let onDelete: () -> Void
    let onMarkUsedToday: () -> Void
    let onMarkPaid: () -> Void

    @State private var historyOpen = false

    private var dueStatus: DueStatus { SubscriptionQuery.dueStatus(for: sub) }
    private var trialDaysLeft: Int? { sub.isTrial ? sub.trialEndDate.flatMap { DateMath.daysUntil($0) } : nil }
    private var unusedDays: Int? { sub.lastUsedDate.flatMap { DateMath.daysSince($0) } }
    private var isCancelCandidate: Bool { SubscriptionQuery.isCancelCandidate(sub, settings: settings) }
    private var hasHistory: Bool { sub.priceHistory.count > 1 }
    private var isDueOrOverdue: Bool { SubscriptionQuery.isDueOrOverdue(sub) }

    private var dueTintColor: Color {
        switch dueStatus.tone {
        case .critical: return Color("StatusCritical")
        case .warning: return Color("StatusWarning")
        case .normal: return Color("TextMuted")
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .top, spacing: 12) {
                Circle().fill(color).frame(width: 10, height: 10).padding(.top, 5)

                VStack(alignment: .leading, spacing: 4) {
                    HStack(spacing: 6) {
                        Text(sub.name)
                            .font(.subheadline.weight(.medium))
                            .foregroundStyle(Color("TextPrimary"))
                        badge(sub.frequency.label, background: Color("Surface2"), foreground: Color("TextSecondary"))
                        if let trialDaysLeft {
                            badge(trialDaysLeft <= 0 ? "Trial · ends today" : "Trial · \(trialDaysLeft)d left", background: Color("StatusWarning"), foreground: Color("AccentInk"))
                        }
                        if isCancelCandidate, let unusedDays {
                            badge("Unused \(unusedDays)d", background: Color("StatusSerious"), foreground: Color("AccentInk"))
                        }
                    }
                    HStack(spacing: 4) {
                        Text(sub.account)
                        if let text = dueStatus.text {
                            Text("·")
                            Text(text).foregroundStyle(dueTintColor)
                        }
                    }
                    .font(.caption)
                    .foregroundStyle(Color("TextMuted"))
                }

                Spacer()

                VStack(alignment: .trailing, spacing: 2) {
                    Text(Currency.formatMoney(sub.amount, currency: sub.currency))
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(Color("TextPrimary"))
                    Text("per \(sub.frequency.perUnitLabel)")
                        .font(.caption2)
                        .foregroundStyle(Color("TextMuted"))
                }
            }
            .padding(12)

            if isDueOrOverdue {
                Button(action: onMarkPaid) {
                    Label("Mark paid", systemImage: "checkmark.circle")
                        .font(.caption.weight(.medium))
                        .foregroundStyle(Color("StatusWarning"))
                }
                .padding(.horizontal, 12)
                .padding(.bottom, 10)
            }

            if hasHistory {
                Button {
                    withAnimation { historyOpen.toggle() }
                } label: {
                    HStack {
                        Text("Price history")
                            .font(.caption2.weight(.medium))
                            .foregroundStyle(Color("TextMuted"))
                        Spacer()
                        Image(systemName: historyOpen ? "chevron.up" : "chevron.down")
                            .font(.caption2)
                            .foregroundStyle(Color("TextMuted"))
                    }
                    .padding(.horizontal, 12)
                    .padding(.bottom, 8)
                }

                if historyOpen {
                    VStack(alignment: .leading, spacing: 6) {
                        ForEach(Array(historyEntries.enumerated()), id: \.offset) { _, item in
                            HStack {
                                Text("since \(Format.formatDate(item.entry.effectiveFrom))")
                                    .foregroundStyle(Color("TextSecondary"))
                                Spacer()
                                HStack(spacing: 4) {
                                    if item.delta == .up {
                                        Image(systemName: "arrow.up").foregroundStyle(Color("StatusSerious"))
                                    } else if item.delta == .down {
                                        Image(systemName: "arrow.down").foregroundStyle(Color("StatusGood"))
                                    }
                                    Text("\(Currency.formatMoney(item.entry.amount, currency: item.entry.currency)) / \(item.entry.frequency.label)")
                                        .foregroundStyle(Color("TextPrimary"))
                                }
                            }
                            .font(.caption)
                        }
                    }
                    .padding(.horizontal, 12)
                    .padding(.bottom, 12)
                }
            }
        }
        .background(Color("Surface1"))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(RoundedRectangle(cornerRadius: 12).strokeBorder(Color("BorderColor")))
        .swipeActions(edge: .trailing) {
            Button(role: .destructive, action: onDelete) {
                Label("Delete", systemImage: "trash")
            }
            Button(action: onEdit) {
                Label("Edit", systemImage: "pencil")
            }
            .tint(Color("Accent"))
        }
        .swipeActions(edge: .leading) {
            Button(action: onMarkUsedToday) {
                Label("Used today", systemImage: "checkmark")
            }
            .tint(Color("StatusGood"))
        }
        .listRowSeparator(.hidden)
        .listRowBackground(Color.clear)
        .listRowInsets(EdgeInsets(top: 4, leading: 12, bottom: 4, trailing: 12))
    }

    private enum Delta { case up, down, none }

    private var historyEntries: [(entry: PriceHistoryEntry, delta: Delta)] {
        let reversed = Array(sub.priceHistory.reversed())
        return reversed.enumerated().map { index, entry in
            guard index + 1 < reversed.count else { return (entry, .none) }
            let prev = reversed[index + 1]
            guard prev.currency == entry.currency else { return (entry, .none) }
            if entry.amount > prev.amount { return (entry, .up) }
            if entry.amount < prev.amount { return (entry, .down) }
            return (entry, .none)
        }
    }

    private func badge(_ text: String, background: Color, foreground: Color) -> some View {
        Text(text)
            .font(.caption2.weight(.medium))
            .padding(.horizontal, 8)
            .padding(.vertical, 2)
            .background(Capsule().fill(background))
            .foregroundStyle(foreground)
    }
}
