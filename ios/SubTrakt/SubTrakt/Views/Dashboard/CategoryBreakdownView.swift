import SwiftUI

struct CategoryDatum: Identifiable {
    var category: String
    var monthly: Double
    var color: Color
    var id: String { category }
}

struct CategoryBreakdownView: View {
    let data: [CategoryDatum]
    let baseCurrency: String

    private var maxValue: Double {
        data.map(\.monthly).max() ?? 0
    }

    var body: some View {
        if data.isEmpty {
            Text("Add a subscription to see your spending by category.")
                .font(.subheadline)
                .foregroundStyle(Color("TextMuted"))
        } else {
            VStack(alignment: .leading, spacing: 12) {
                ForEach(data) { datum in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack(alignment: .firstTextBaseline) {
                            Text(datum.category)
                                .font(.subheadline.weight(.medium))
                                .foregroundStyle(Color("TextPrimary"))
                            Spacer()
                            (Text(Currency.formatMoney(datum.monthly, currency: baseCurrency))
                                .foregroundStyle(Color("TextSecondary"))
                                + Text(" /mo").foregroundStyle(Color("TextMuted")))
                                .font(.subheadline)
                        }
                        GeometryReader { geo in
                            let pct = maxValue > 0 ? max(datum.monthly / maxValue, 0.03) : 0
                            ZStack(alignment: .leading) {
                                RoundedRectangle(cornerRadius: 999).fill(Color("Surface2"))
                                RoundedRectangle(cornerRadius: 999).fill(datum.color)
                                    .frame(width: geo.size.width * pct)
                            }
                        }
                        .frame(height: 10)
                    }
                }
            }
        }
    }
}
