import SwiftUI

enum Theme {
    static let cardRadius: CGFloat = 16
}

private struct CardBackground: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color("Surface1"))
            .clipShape(RoundedRectangle(cornerRadius: Theme.cardRadius))
            .overlay(RoundedRectangle(cornerRadius: Theme.cardRadius).strokeBorder(Color("BorderColor")))
    }
}

private struct AccentGlow: ViewModifier {
    func body(content: Content) -> some View {
        content.shadow(color: Color("Accent").opacity(0.45), radius: 12, y: 4)
    }
}

// On iPad, sheets default to a small centered form sheet; `.page` sizes them
// like a full-height page instead. No effect on iPhone.
private struct PageSheetSizing: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 18.0, *) {
            content.presentationSizing(.page)
        } else {
            content
        }
    }
}

extension View {
    func pageSheetSizing() -> some View {
        modifier(PageSheetSizing())
    }

    func cardBackground() -> some View {
        modifier(CardBackground())
    }

    func accentGlow() -> some View {
        modifier(AccentGlow())
    }
}

// Page background with a soft ember glow bleeding in from one edge — the
// app's signature backdrop for the dashboard hero and onboarding.
struct GlowBackground: View {
    var edge: VerticalEdge = .bottom

    var body: some View {
        GeometryReader { proxy in
            ZStack {
                Color("Page")
                RadialGradient(
                    colors: [Color("Glow"), Color("Glow").opacity(0)],
                    center: edge == .bottom ? .bottom : .top,
                    startRadius: 0,
                    endRadius: max(proxy.size.width, proxy.size.height) * (edge == .bottom ? 0.6 : 0.45)
                )
            }
        }
        .ignoresSafeArea()
    }
}

// Bold headline split across two lines: a primary line and a muted second line.
struct TwoToneTitle: View {
    let primary: String
    let secondary: String
    var alignment: TextAlignment = .center
    var size: CGFloat = 34

    var body: some View {
        (Text(primary).foregroundStyle(Color("TextPrimary"))
            + Text("\n" + secondary).foregroundStyle(Color("TextMuted")))
            .font(.system(size: size, weight: .bold))
            .multilineTextAlignment(alignment)
            .lineSpacing(2)
    }
}

// Full-width capsule button. `.primary` inverts the page (white on dark,
// black on light); `.secondary` is a quiet text-only action.
struct PillButtonStyle: ButtonStyle {
    enum Kind { case primary, secondary }
    var kind: Kind = .primary

    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .font(.body.weight(.semibold))
            .frame(maxWidth: .infinity)
            .frame(height: 52)
            .foregroundStyle(kind == .primary ? Color("Page") : Color("TextSecondary"))
            .background(Capsule().fill(kind == .primary ? Color("TextPrimary") : Color.clear))
            .opacity(configuration.isPressed ? 0.75 : 1)
    }
}
