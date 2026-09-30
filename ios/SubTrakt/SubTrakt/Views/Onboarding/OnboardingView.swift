import SwiftUI

// First-launch intro. The last page is where notification permission is
// asked for, so the system prompt appears with context rather than cold.
struct OnboardingView: View {
    @EnvironmentObject private var store: AppStore
    @State private var page: Int

    private let pageCount = 4

    init(initialPage: Int = 0) {
        _page = State(initialValue: initialPage)
    }

    var body: some View {
        ZStack {
            GlowBackground(edge: .bottom)

            VStack(spacing: 0) {
                TabView(selection: $page) {
                    welcomePage.tag(0)
                    featuresPage.tag(1)
                    privacyPage.tag(2)
                    remindersPage.tag(3)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
                .animation(.easeInOut, value: page)

                pageDots
                    .padding(.bottom, 20)

                actions
                    .padding(.horizontal, 24)
                    .padding(.bottom, 12)
            }
            .frame(maxWidth: 520)
        }
    }

    // MARK: Pages

    private var welcomePage: some View {
        pageLayout(
            primary: "Every subscription.",
            secondary: "In one place.",
            message: "Track what you pay, when it renews, and what you've stopped using."
        ) {
            Image("AppLogo")
                .resizable()
                .frame(width: 104, height: 104)
                .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
                .shadow(color: Color("Accent").opacity(0.5), radius: 30, y: 10)
        }
    }

    private var featuresPage: some View {
        pageLayout(
            primary: "Know before",
            secondary: "you're charged.",
            message: nil,
            titleFirst: true
        ) {
            VStack(alignment: .leading, spacing: 14) {
                featureRow(symbol: "bell.badge", text: "A reminder before every renewal and trial end")
                featureRow(symbol: "chart.bar", text: "Monthly and yearly totals, by category")
                featureRow(symbol: "scissors", text: "Flags the ones you've stopped using")
                featureRow(symbol: "chart.line.uptrend.xyaxis", text: "Price history when a service gets pricier")
            }
            .padding(.horizontal, 8)
        }
    }

    private var privacyPage: some View {
        pageLayout(
            primary: "Yours alone.",
            secondary: "Kept on this device.",
            message: "No account, no ads, no tracking. SubTrakt never sends your data anywhere."
        ) {
            symbolBadge("lock.shield")
        }
    }

    private var remindersPage: some View {
        pageLayout(
            primary: "Stay ahead",
            secondary: "of renewals.",
            message: "Turn on notifications to get a heads-up a few days before each charge."
        ) {
            symbolBadge("bell")
        }
    }

    private func pageLayout<Art: View>(
        primary: String,
        secondary: String,
        message: String?,
        titleFirst: Bool = false,
        @ViewBuilder art: () -> Art
    ) -> some View {
        VStack(spacing: 28) {
            Spacer(minLength: 0)
            if titleFirst {
                TwoToneTitle(primary: primary, secondary: secondary)
                art()
            } else {
                art()
                TwoToneTitle(primary: primary, secondary: secondary)
            }
            if let message {
                Text(message)
                    .font(.body)
                    .foregroundStyle(Color("TextSecondary"))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 12)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 24)
    }

    private func featureRow(symbol: String, text: String) -> some View {
        HStack(spacing: 14) {
            Image(systemName: symbol)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(Color("Accent"))
                .frame(width: 40, height: 40)
                .background(Circle().fill(Color("Surface2")))
            Text(text)
                .font(.callout)
                .foregroundStyle(Color("TextPrimary"))
            Spacer(minLength: 0)
        }
    }

    private func symbolBadge(_ symbol: String) -> some View {
        Image(systemName: symbol)
            .font(.system(size: 44, weight: .semibold))
            .foregroundStyle(Color("Accent"))
            .frame(width: 112, height: 112)
            .background(Circle().fill(.ultraThinMaterial))
            .overlay(Circle().strokeBorder(Color("BorderColor")))
    }

    // MARK: Controls

    private var pageDots: some View {
        HStack(spacing: 8) {
            ForEach(0..<pageCount, id: \.self) { index in
                Capsule()
                    .fill(index == page ? Color("TextPrimary") : Color("TextMuted").opacity(0.4))
                    .frame(width: index == page ? 20 : 8, height: 8)
            }
        }
        .animation(.easeInOut(duration: 0.2), value: page)
        .accessibilityHidden(true)
    }

    @ViewBuilder
    private var actions: some View {
        if page < pageCount - 1 {
            Button(page == 0 ? "Get started" : "Continue") {
                page += 1
            }
            .buttonStyle(PillButtonStyle())
            // Keeps both layouts the same height so the dots don't jump.
            Button("Skip") { store.completeOnboarding() }
                .buttonStyle(PillButtonStyle(kind: .secondary))
        } else {
            Button("Turn on reminders") {
                Task {
                    await store.requestNotificationPermission()
                    store.completeOnboarding()
                }
            }
            .buttonStyle(PillButtonStyle())
            Button("Not now") { store.completeOnboarding() }
                .buttonStyle(PillButtonStyle(kind: .secondary))
        }
    }
}
