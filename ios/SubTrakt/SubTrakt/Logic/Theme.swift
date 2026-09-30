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
