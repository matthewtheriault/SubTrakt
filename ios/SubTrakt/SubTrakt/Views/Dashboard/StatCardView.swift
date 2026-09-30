import SwiftUI

struct StatCardView: View {
    let label: String
    let value: String
    var hint: String? = nil
    var accent: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label.uppercased())
                .font(.caption2.weight(.medium))
                .foregroundStyle(Color("TextMuted"))
            Text(value)
                .font(accent ? .title.weight(.semibold) : .title2.weight(.semibold))
                .foregroundStyle(accent ? Color("Accent") : Color("TextPrimary"))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            if let hint {
                Text(hint)
                    .font(.caption)
                    .foregroundStyle(Color("TextSecondary"))
                    .lineLimit(1)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color("Surface1"))
        .clipShape(RoundedRectangle(cornerRadius: Theme.cardRadius))
        .overlay(
            RoundedRectangle(cornerRadius: Theme.cardRadius)
                .strokeBorder(accent ? Color.clear : Color("BorderColor"))
        )
        .shadow(color: accent ? Color("Accent").opacity(0.45) : .clear, radius: accent ? 12 : 0, y: accent ? 4 : 0)
    }
}
