// Per-subscription logo resolution.
//
// No third-party logo artwork is bundled (trademark risk; see App Review
// guideline 5.2.1 — the iOS app follows the same rule). Known brands get a
// tile in their brand color with the subscription's initials.
//
// Tier 1 ("color"): curated brand name -> brand color table. Colors are
// commonly-cited brand colors, approximate for the handful without a single
// canonical hex (Peacock, MasterClass, Babbel).
// Tier 2 ("hash"): a deterministic color from the app's existing categorical
// palette, same technique as `categoryColors.ts`, for anything unrecognized.
// Tier 0 ("custom"): a user-uploaded image always wins.

interface Brand {
  id: string;
  label: string;
  hex: string;
  keywords: string[];
}

function brand(id: string, label: string, hex: string, keywords: string[]): Brand {
  return { id, label, hex, keywords };
}

// Ordered most-specific-first: earlier entries are tested first so e.g.
// "YouTube Music" matches before the generic "YouTube" entry. `id`s are
// persisted as `logoOverrideId` and must match the iOS app's BrandIcons.swift.
const BRANDS: Brand[] = [
  brand("youtubemusic", "YouTube Music", "#FF0000", ["youtube music"]),
  brand("youtubetv", "YouTube TV", "#FF0000", ["youtube tv"]),
  brand("youtube", "YouTube", "#FF0000", ["youtube"]),
  brand("githubcopilot", "GitHub Copilot", "#000000", ["github copilot", "copilot"]),
  brand("github", "GitHub", "#181717", ["github"]),
  brand("netflix", "Netflix", "#E50914", ["netflix"]),
  brand("spotify", "Spotify", "#1ED760", ["spotify"]),
  brand("hbomax", "HBO Max", "#000000", ["hbo max", "hbo"]),
  brand("twitch", "Twitch", "#9146FF", ["twitch"]),
  brand("crunchyroll", "Crunchyroll", "#FF5E00", ["crunchyroll"]),
  brand("notion", "Notion", "#000000", ["notion"]),
  brand("figma", "Figma", "#F24E1E", ["figma"]),
  brand("dropbox", "Dropbox", "#0061FF", ["dropbox"]),
  brand("1password", "1Password", "#145FE4", ["1password", "1 password"]),
  brand("icloud", "iCloud", "#3693F3", ["icloud", "i cloud"]),
  brand("playstation", "PlayStation", "#0070D1", ["playstation", "ps plus", "ps+"]),
  brand("steam", "Steam", "#000000", ["steam"]),
  brand("epicgames", "Epic Games", "#313131", ["epic games", "epic"]),
  brand("peloton", "Peloton", "#181A1D", ["peloton"]),
  brand("headspace", "Headspace", "#F47D31", ["headspace"]),
  brand("nordvpn", "NordVPN", "#4687FF", ["nordvpn", "nord vpn"]),
  brand("expressvpn", "ExpressVPN", "#DA3940", ["expressvpn", "express vpn"]),
  brand("protonvpn", "Proton VPN", "#66DEB1", ["proton vpn", "protonvpn"]),
  brand("protonmail", "Proton Mail", "#6D4AFF", ["proton mail", "protonmail"]),
  brand("zoom", "Zoom", "#0B5CFF", ["zoom"]),
  brand("grammarly", "Grammarly", "#027E6F", ["grammarly"]),
  brand("evernote", "Evernote", "#00A82D", ["evernote"]),
  brand("todoist", "Todoist", "#E44332", ["todoist"]),
  brand("strava", "Strava", "#FC4C02", ["strava"]),
  brand("skillshare", "Skillshare", "#00FF84", ["skillshare"]),
  brand("coursera", "Coursera", "#0056D2", ["coursera"]),
  brand("audible", "Audible", "#F8991C", ["audible"]),
  brand("patreon", "Patreon", "#000000", ["patreon"]),
  brand("newyorktimes", "New York Times", "#000000", ["new york times", "nytimes", "nyt"]),
  brand("soundcloud", "SoundCloud", "#FF5500", ["soundcloud"]),
  brand("cloudflare", "Cloudflare", "#F38020", ["cloudflare"]),
  brand("vercel", "Vercel", "#000000", ["vercel"]),
  brand("duolingo", "Duolingo", "#58CC02", ["duolingo"]),
  brand("tidal", "TIDAL", "#000000", ["tidal"]),
  brand("discord", "Discord", "#5865F2", ["discord"]),
  brand("linear", "Linear", "#5E6AD2", ["linear"]),
  brand("wordpress", "WordPress", "#21759B", ["wordpress"]),
  brand("squarespace", "Squarespace", "#000000", ["squarespace"]),
  brand("wix", "Wix", "#0C6EFC", ["wix"]),
  brand("shopify", "Shopify", "#7AB55C", ["shopify"]),
  brand("mailchimp", "MailChimp", "#FFE01B", ["mailchimp", "mail chimp"]),
  brand("namecheap", "Namecheap", "#DE3723", ["namecheap"]),
  brand("godaddy", "GoDaddy", "#1BDBDB", ["godaddy", "go daddy"]),
  brand("digitalocean", "DigitalOcean", "#0080FF", ["digital ocean", "digitalocean"]),
  brand("netlify", "Netlify", "#00C7B7", ["netlify"]),
  brand("anthropic", "Anthropic", "#191919", ["anthropic"]),
  brand("claude", "Claude", "#D97757", ["claude"]),
  brand("perplexity", "Perplexity", "#1FB8CD", ["perplexity"]),
  brand("applearcade", "Apple Arcade", "#000000", ["apple arcade"]),
  brand("applemusic", "Apple Music", "#FA243C", ["apple music"]),
  brand("appletv", "Apple TV", "#000000", ["apple tv"]),
  brand("googledrive", "Google Drive", "#4285F4", ["google drive", "google one"]),
  brand("googleplay", "Google Play", "#414141", ["google play"]),
  brand("fitbit", "Fitbit", "#00B0B9", ["fitbit"]),
  brand("disney-plus", "Disney+", "#113CCF", ["disney"]),
  brand("hulu", "Hulu", "#1CE783", ["hulu"]),
  brand("peacock", "Peacock", "#000000", ["peacock"]),
  brand("prime-video", "Prime Video", "#00A8E1", ["prime video", "amazon prime", "prime"]),
  brand("xbox-game-pass", "Xbox Game Pass", "#107C10", ["xbox", "game pass"]),
  brand("adobe-cc", "Adobe Creative Cloud", "#DA1F26", ["adobe"]),
  brand("microsoft-365", "Microsoft 365", "#0078D4", ["microsoft 365", "office 365", "microsoft office"]),
  brand("linkedin", "LinkedIn", "#0A66C2", ["linkedin"]),
  brand("chatgpt", "ChatGPT", "#10A37F", ["chatgpt", "openai"]),
  brand("aws", "AWS", "#FF9900", ["aws", "amazon web services"]),
  brand("calm", "Calm", "#3E7CB1", ["calm"]),
  brand("masterclass", "MasterClass", "#C6A15B", ["masterclass"]),
  brand("babbel", "Babbel", "#0AA090", ["babbel"]),
  brand("slack", "Slack", "#4A154B", ["slack"]),
  brand("canva", "Canva", "#00C4CC", ["canva"]),
  brand("heroku", "Heroku", "#430098", ["heroku"]),
];

export interface BrandOption {
  id: string;
  label: string;
}

export const ALL_BRAND_OPTIONS: BrandOption[] = BRANDS.map((b) => ({ id: b.id, label: b.label })).sort((a, b) =>
  a.label.localeCompare(b.label),
);

const HASH_SLOTS = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
  "var(--series-4)",
  "var(--series-5)",
  "var(--series-6)",
  "var(--series-7)",
  "var(--series-8)",
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function findByKeyword(name: string): Brand | undefined {
  const lower = name.toLowerCase();
  return BRANDS.find((entry) => entry.keywords.some((k) => lower.includes(k)));
}

function findById(id: string): Brand | undefined {
  return BRANDS.find((b) => b.id === id);
}

export type LogoResolution =
  | { kind: "custom"; src: string }
  | { kind: "color"; hex: string; initials: string }
  | { kind: "hash"; color: string; initials: string };

export interface LogoSubject {
  name: string;
  logoOverrideId?: string;
  customLogoDataUrl?: string;
}

export function resolveLogo(sub: LogoSubject): LogoResolution {
  if (sub.customLogoDataUrl) {
    return { kind: "custom", src: sub.customLogoDataUrl };
  }

  const override = sub.logoOverrideId ? findById(sub.logoOverrideId) : undefined;
  const matched = override ?? findByKeyword(sub.name);

  if (matched) {
    return { kind: "color", hex: matched.hex, initials: initialsFor(sub.name) };
  }

  const color = HASH_SLOTS[hashString(sub.name) % HASH_SLOTS.length];
  return { kind: "hash", color, initials: initialsFor(sub.name) };
}
