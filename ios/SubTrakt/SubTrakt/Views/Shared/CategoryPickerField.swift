import SwiftUI

struct CategoryPickerField: View {
    @Binding var category: String
    let knownCategories: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            TextField("e.g. Gaming", text: $category)

            if !knownCategories.isEmpty {
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: 6) {
                        ForEach(knownCategories, id: \.self) { option in
                            Button {
                                category = option
                            } label: {
                                Text(option)
                                    .font(.caption)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 5)
                                    .background(
                                        Capsule().fill(category == option ? Color("Accent") : Color("Surface2"))
                                    )
                                    .foregroundStyle(category == option ? Color("AccentInk") : Color("TextSecondary"))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
        }
    }
}
