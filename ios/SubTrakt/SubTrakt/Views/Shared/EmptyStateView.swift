import SwiftUI

struct EmptyStateView: View {
    let title: String
    let message: String

    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.subheadline.weight(.medium))
                .foregroundStyle(Color("TextSecondary"))
            Text(message)
                .font(.caption)
                .foregroundStyle(Color("TextMuted"))
                .multilineTextAlignment(.center)
        }
        .padding(40)
        .frame(maxWidth: .infinity)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .strokeBorder(Color("BorderColor"), style: StrokeStyle(lineWidth: 1, dash: [4, 4]))
        )
    }
}
