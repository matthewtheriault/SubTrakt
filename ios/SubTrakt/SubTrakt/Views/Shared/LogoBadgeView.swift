import SwiftUI

struct LogoBadgeView: View {
    let name: String
    let logoOverride: String?
    let customLogoData: Data?
    var size: CGFloat = 40

    // Falls through to a name/override-based resolution if the stored
    // custom image data can't be decoded (e.g. a corrupted legacy record).
    private var resolution: BrandIcons.Resolution {
        if let customLogoData, UIImage(data: customLogoData) == nil {
            return BrandIcons.resolve(name: name, logoOverride: logoOverride, customLogoData: nil)
        }
        return BrandIcons.resolve(name: name, logoOverride: logoOverride, customLogoData: customLogoData)
    }

    var body: some View {
        let radius = size * 0.28
        Group {
            switch resolution {
            case .custom(let data):
                if let uiImage = UIImage(data: data) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: size, height: size)
                        .clipShape(RoundedRectangle(cornerRadius: radius))
                }
            case .color(let hex, let initials):
                initialsTile(background: Color(hex: hex), initials: initials)
            case .hash(let colorName, let initials):
                initialsTile(background: Color(colorName), initials: initials)
            }
        }
        .frame(width: size, height: size)
        .overlay(RoundedRectangle(cornerRadius: radius).strokeBorder(Color("BorderColor")))
    }

    private func initialsTile(background: Color, initials: String) -> some View {
        RoundedRectangle(cornerRadius: size * 0.28)
            .fill(background)
            .frame(width: size, height: size)
            .overlay(
                Text(initials)
                    .font(.system(size: max(11, size * 0.36), weight: .semibold))
                    .foregroundStyle(.white)
            )
    }
}

private extension Color {
    init(hex: String) {
        var hexString = hex.trimmingCharacters(in: .whitespacesAndNewlines)
        hexString = hexString.replacingOccurrences(of: "#", with: "")
        var value: UInt64 = 0
        Scanner(string: hexString).scanHexInt64(&value)
        let r = Double((value >> 16) & 0xFF) / 255
        let g = Double((value >> 8) & 0xFF) / 255
        let b = Double(value & 0xFF) / 255
        self.init(red: r, green: g, blue: b)
    }
}
