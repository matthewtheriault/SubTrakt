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

extension View {
    func cardBackground() -> some View {
        modifier(CardBackground())
    }

    func accentGlow() -> some View {
        modifier(AccentGlow())
    }
}
