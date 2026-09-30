import SwiftUI

// Per-subscription logo resolution — Swift port of src/lib/brandIcons.ts,
// minus the bundled brand glyphs: the iOS build ships no third-party logo
// artwork (App Review guideline 5.2.1), only brand-colored initials tiles.
//
// Tier 1 ("color"): curated brand-color table for well-known subscriptions.
// Tier 2 ("hash"): a deterministic color from the app's existing categorical
// palette (same technique as CategoryColors), for anything unrecognized.
// Tier 0 ("custom"): a user-uploaded image always wins.
enum BrandIcons {
    struct Entry {
        let id: String
        let label: String
        let hex: String
        let keywords: [String]
    }

    struct Option: Identifiable, Hashable {
        let id: String
        let label: String
    }

    // Ordered most-specific-first: earlier entries are tested first so e.g.
    // "YouTube Music" matches before the generic "YouTube" entry. Keep the
    // `id` values in sync with src/lib/brandIcons.ts — they're persisted as
    // `logoOverride`. Colors are commonly-cited brand colors, approximate for
    // the handful without a single canonical hex (Peacock, MasterClass, Babbel).
    private static let brands: [Entry] = [
        Entry(id: "youtubemusic", label: "YouTube Music", hex: "#FF0000", keywords: ["youtube music"]),
        Entry(id: "youtubetv", label: "YouTube TV", hex: "#FF0000", keywords: ["youtube tv"]),
        Entry(id: "youtube", label: "YouTube", hex: "#FF0000", keywords: ["youtube"]),
        Entry(id: "githubcopilot", label: "GitHub Copilot", hex: "#000000", keywords: ["github copilot", "copilot"]),
        Entry(id: "github", label: "GitHub", hex: "#181717", keywords: ["github"]),
        Entry(id: "netflix", label: "Netflix", hex: "#E50914", keywords: ["netflix"]),
        Entry(id: "spotify", label: "Spotify", hex: "#1ED760", keywords: ["spotify"]),
        Entry(id: "hbomax", label: "HBO Max", hex: "#000000", keywords: ["hbo max", "hbo"]),
        Entry(id: "twitch", label: "Twitch", hex: "#9146FF", keywords: ["twitch"]),
        Entry(id: "crunchyroll", label: "Crunchyroll", hex: "#FF5E00", keywords: ["crunchyroll"]),
        Entry(id: "notion", label: "Notion", hex: "#000000", keywords: ["notion"]),
        Entry(id: "figma", label: "Figma", hex: "#F24E1E", keywords: ["figma"]),
        Entry(id: "dropbox", label: "Dropbox", hex: "#0061FF", keywords: ["dropbox"]),
        Entry(id: "1password", label: "1Password", hex: "#145FE4", keywords: ["1password", "1 password"]),
        Entry(id: "icloud", label: "iCloud", hex: "#3693F3", keywords: ["icloud", "i cloud"]),
        Entry(id: "playstation", label: "PlayStation", hex: "#0070D1", keywords: ["playstation", "ps plus", "ps+"]),
        Entry(id: "steam", label: "Steam", hex: "#000000", keywords: ["steam"]),
        Entry(id: "epicgames", label: "Epic Games", hex: "#313131", keywords: ["epic games", "epic"]),
        Entry(id: "peloton", label: "Peloton", hex: "#181A1D", keywords: ["peloton"]),
        Entry(id: "headspace", label: "Headspace", hex: "#F47D31", keywords: ["headspace"]),
        Entry(id: "nordvpn", label: "NordVPN", hex: "#4687FF", keywords: ["nordvpn", "nord vpn"]),
        Entry(id: "expressvpn", label: "ExpressVPN", hex: "#DA3940", keywords: ["expressvpn", "express vpn"]),
        Entry(id: "protonvpn", label: "Proton VPN", hex: "#66DEB1", keywords: ["proton vpn", "protonvpn"]),
        Entry(id: "protonmail", label: "Proton Mail", hex: "#6D4AFF", keywords: ["proton mail", "protonmail"]),
        Entry(id: "zoom", label: "Zoom", hex: "#0B5CFF", keywords: ["zoom"]),
        Entry(id: "grammarly", label: "Grammarly", hex: "#027E6F", keywords: ["grammarly"]),
        Entry(id: "evernote", label: "Evernote", hex: "#00A82D", keywords: ["evernote"]),
        Entry(id: "todoist", label: "Todoist", hex: "#E44332", keywords: ["todoist"]),
        Entry(id: "strava", label: "Strava", hex: "#FC4C02", keywords: ["strava"]),
        Entry(id: "skillshare", label: "Skillshare", hex: "#00FF84", keywords: ["skillshare"]),
        Entry(id: "coursera", label: "Coursera", hex: "#0056D2", keywords: ["coursera"]),
        Entry(id: "audible", label: "Audible", hex: "#F8991C", keywords: ["audible"]),
        Entry(id: "patreon", label: "Patreon", hex: "#000000", keywords: ["patreon"]),
        Entry(id: "newyorktimes", label: "New York Times", hex: "#000000", keywords: ["new york times", "nytimes", "nyt"]),
        Entry(id: "soundcloud", label: "SoundCloud", hex: "#FF5500", keywords: ["soundcloud"]),
        Entry(id: "cloudflare", label: "Cloudflare", hex: "#F38020", keywords: ["cloudflare"]),
        Entry(id: "vercel", label: "Vercel", hex: "#000000", keywords: ["vercel"]),
        Entry(id: "duolingo", label: "Duolingo", hex: "#58CC02", keywords: ["duolingo"]),
        Entry(id: "tidal", label: "TIDAL", hex: "#000000", keywords: ["tidal"]),
        Entry(id: "discord", label: "Discord", hex: "#5865F2", keywords: ["discord"]),
        Entry(id: "linear", label: "Linear", hex: "#5E6AD2", keywords: ["linear"]),
        Entry(id: "wordpress", label: "WordPress", hex: "#21759B", keywords: ["wordpress"]),
        Entry(id: "squarespace", label: "Squarespace", hex: "#000000", keywords: ["squarespace"]),
        Entry(id: "wix", label: "Wix", hex: "#0C6EFC", keywords: ["wix"]),
        Entry(id: "shopify", label: "Shopify", hex: "#7AB55C", keywords: ["shopify"]),
        Entry(id: "mailchimp", label: "MailChimp", hex: "#FFE01B", keywords: ["mailchimp", "mail chimp"]),
        Entry(id: "namecheap", label: "Namecheap", hex: "#DE3723", keywords: ["namecheap"]),
        Entry(id: "godaddy", label: "GoDaddy", hex: "#1BDBDB", keywords: ["godaddy", "go daddy"]),
        Entry(id: "digitalocean", label: "DigitalOcean", hex: "#0080FF", keywords: ["digital ocean", "digitalocean"]),
        Entry(id: "netlify", label: "Netlify", hex: "#00C7B7", keywords: ["netlify"]),
        Entry(id: "anthropic", label: "Anthropic", hex: "#191919", keywords: ["anthropic"]),
        Entry(id: "claude", label: "Claude", hex: "#D97757", keywords: ["claude"]),
        Entry(id: "perplexity", label: "Perplexity", hex: "#1FB8CD", keywords: ["perplexity"]),
        Entry(id: "applearcade", label: "Apple Arcade", hex: "#000000", keywords: ["apple arcade"]),
        Entry(id: "applemusic", label: "Apple Music", hex: "#FA243C", keywords: ["apple music"]),
        Entry(id: "appletv", label: "Apple TV", hex: "#000000", keywords: ["apple tv"]),
        Entry(id: "googledrive", label: "Google Drive", hex: "#4285F4", keywords: ["google drive", "google one"]),
        Entry(id: "googleplay", label: "Google Play", hex: "#414141", keywords: ["google play"]),
        Entry(id: "fitbit", label: "Fitbit", hex: "#00B0B9", keywords: ["fitbit"]),
        Entry(id: "disney-plus", label: "Disney+", hex: "#113CCF", keywords: ["disney"]),
        Entry(id: "hulu", label: "Hulu", hex: "#1CE783", keywords: ["hulu"]),
        Entry(id: "peacock", label: "Peacock", hex: "#000000", keywords: ["peacock"]),
        Entry(id: "prime-video", label: "Prime Video", hex: "#00A8E1", keywords: ["prime video", "amazon prime", "prime"]),
        Entry(id: "xbox-game-pass", label: "Xbox Game Pass", hex: "#107C10", keywords: ["xbox", "game pass"]),
        Entry(id: "adobe-cc", label: "Adobe Creative Cloud", hex: "#DA1F26", keywords: ["adobe"]),
        Entry(id: "microsoft-365", label: "Microsoft 365", hex: "#0078D4", keywords: ["microsoft 365", "office 365", "microsoft office"]),
        Entry(id: "linkedin", label: "LinkedIn", hex: "#0A66C2", keywords: ["linkedin"]),
        Entry(id: "chatgpt", label: "ChatGPT", hex: "#10A37F", keywords: ["chatgpt", "openai"]),
        Entry(id: "aws", label: "AWS", hex: "#FF9900", keywords: ["aws", "amazon web services"]),
        Entry(id: "calm", label: "Calm", hex: "#3E7CB1", keywords: ["calm"]),
        Entry(id: "masterclass", label: "MasterClass", hex: "#C6A15B", keywords: ["masterclass"]),
        Entry(id: "babbel", label: "Babbel", hex: "#0AA090", keywords: ["babbel"]),
        Entry(id: "slack", label: "Slack", hex: "#4A154B", keywords: ["slack"]),
        Entry(id: "canva", label: "Canva", hex: "#00C4CC", keywords: ["canva"]),
        Entry(id: "heroku", label: "Heroku", hex: "#430098", keywords: ["heroku"]),
    ]

    static let allOptions: [Option] = brands
        .map { Option(id: $0.id, label: $0.label) }
        .sorted { $0.label < $1.label }

    private static func find(id: String) -> Entry? {
        brands.first { $0.id == id }
    }

    private static func find(matching name: String) -> Entry? {
        let lower = name.lowercased()
        return brands.first(where: { entry in entry.keywords.contains { lower.contains($0) } })
    }

    static func initials(for name: String) -> String {
        let words = name.trimmingCharacters(in: .whitespacesAndNewlines)
            .split(separator: " ")
            .map(String.init)
        if words.isEmpty { return "?" }
        if words.count == 1 { return String(words[0].prefix(2)).uppercased() }
        return (String(words[0].prefix(1)) + String(words[1].prefix(1))).uppercased()
    }

    private static let hashSlotNames = ["Series1", "Series2", "Series3", "Series4", "Series5", "Series6", "Series7", "Series8"]

    private static func hash(_ value: String) -> Int {
        var hash: Int32 = 0
        for scalar in value.unicodeScalars {
            hash = hash &* 31 &+ Int32(scalar.value)
        }
        return abs(Int(hash))
    }

    enum Resolution {
        case custom(Data)
        case color(hex: String, initials: String)
        case hash(colorName: String, initials: String)
    }

    static func resolve(name: String, logoOverride: String?, customLogoData: Data?) -> Resolution {
        if let customLogoData {
            return .custom(customLogoData)
        }

        let matched = logoOverride.flatMap(find(id:)) ?? find(matching: name)
        if let matched {
            return .color(hex: matched.hex, initials: initials(for: name))
        }

        let slot = hashSlotNames[hash(name) % hashSlotNames.count]
        return .hash(colorName: slot, initials: initials(for: name))
    }
}
