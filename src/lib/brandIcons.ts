// Per-subscription logo resolution.
//
// Tier 1 ("icon"): real brand glyphs from `simple-icons` (CC0-1.0 — public
// domain, explicitly published for representing third-party brands/products).
// Tier 2 ("color"): a small curated table of brand name -> official brand
// color for well-known subscriptions simple-icons doesn't ship (colors
// aren't copyrightable; no artwork is reproduced).
// Tier 3 ("hash"): a deterministic color from the app's existing categorical
// palette, same technique as `categoryColors.ts`, for anything unrecognized.
// Tier 0 ("custom"): a user-uploaded image always wins.
import {
  siNetflix,
  siSpotify,
  siYoutube,
  siYoutubemusic,
  siYoutubetv,
  siHbomax,
  siTwitch,
  siCrunchyroll,
  siGithub,
  siGithubcopilot,
  siNotion,
  siFigma,
  siDropbox,
  si1password,
  siIcloud,
  siPlaystation,
  siSteam,
  siEpicgames,
  siPeloton,
  siHeadspace,
  siNordvpn,
  siExpressvpn,
  siProtonvpn,
  siProtonmail,
  siZoom,
  siGrammarly,
  siEvernote,
  siTodoist,
  siStrava,
  siSkillshare,
  siCoursera,
  siAudible,
  siPatreon,
  siNewyorktimes,
  siSoundcloud,
  siCloudflare,
  siVercel,
  siDuolingo,
  siTidal,
  siDiscord,
  siLinear,
  siWordpress,
  siSquarespace,
  siWix,
  siShopify,
  siMailchimp,
  siNamecheap,
  siGodaddy,
  siDigitalocean,
  siNetlify,
  siAnthropic,
  siClaude,
  siPerplexity,
  siApplearcade,
  siApplemusic,
  siAppletv,
  siGoogledrive,
  siGoogleplay,
  siFitbit,
  type SimpleIcon,
} from "simple-icons";

interface BrandIcon {
  matchKind: "icon";
  id: string;
  label: string;
  hex: string;
  path: string;
  keywords: string[];
}

function icon(si: SimpleIcon, ...keywords: string[]): BrandIcon {
  return { matchKind: "icon", id: si.slug, label: si.title, hex: `#${si.hex}`, path: si.path, keywords };
}

// Ordered most-specific-first: earlier entries are tested first so e.g.
// "YouTube Music" matches before the generic "YouTube" entry.
const BRAND_ICONS: BrandIcon[] = [
  icon(siYoutubemusic, "youtube music"),
  icon(siYoutubetv, "youtube tv"),
  icon(siYoutube, "youtube"),
  icon(siGithubcopilot, "github copilot", "copilot"),
  icon(siGithub, "github"),
  icon(siNetflix, "netflix"),
  icon(siSpotify, "spotify"),
  icon(siHbomax, "hbo max", "hbo"),
  icon(siTwitch, "twitch"),
  icon(siCrunchyroll, "crunchyroll"),
  icon(siNotion, "notion"),
  icon(siFigma, "figma"),
  icon(siDropbox, "dropbox"),
  icon(si1password, "1password", "1 password"),
  icon(siIcloud, "icloud", "i cloud"),
  icon(siPlaystation, "playstation", "ps plus", "ps+"),
  icon(siSteam, "steam"),
  icon(siEpicgames, "epic games", "epic"),
  icon(siPeloton, "peloton"),
  icon(siHeadspace, "headspace"),
  icon(siNordvpn, "nordvpn", "nord vpn"),
  icon(siExpressvpn, "expressvpn", "express vpn"),
  icon(siProtonvpn, "proton vpn", "protonvpn"),
  icon(siProtonmail, "proton mail", "protonmail"),
  icon(siZoom, "zoom"),
  icon(siGrammarly, "grammarly"),
  icon(siEvernote, "evernote"),
  icon(siTodoist, "todoist"),
  icon(siStrava, "strava"),
  icon(siSkillshare, "skillshare"),
  icon(siCoursera, "coursera"),
  icon(siAudible, "audible"),
  icon(siPatreon, "patreon"),
  icon(siNewyorktimes, "new york times", "nytimes", "nyt"),
  icon(siSoundcloud, "soundcloud"),
  icon(siCloudflare, "cloudflare"),
  icon(siVercel, "vercel"),
  icon(siDuolingo, "duolingo"),
  icon(siTidal, "tidal"),
  icon(siDiscord, "discord"),
  icon(siLinear, "linear"),
  icon(siWordpress, "wordpress"),
  icon(siSquarespace, "squarespace"),
  icon(siWix, "wix"),
  icon(siShopify, "shopify"),
  icon(siMailchimp, "mailchimp", "mail chimp"),
  icon(siNamecheap, "namecheap"),
  icon(siGodaddy, "godaddy", "go daddy"),
  icon(siDigitalocean, "digital ocean", "digitalocean"),
  icon(siNetlify, "netlify"),
  icon(siAnthropic, "anthropic"),
  icon(siClaude, "claude"),
  icon(siPerplexity, "perplexity"),
  icon(siApplearcade, "apple arcade"),
  icon(siApplemusic, "apple music"),
  icon(siAppletv, "apple tv"),
  icon(siGoogledrive, "google drive", "google one"),
  icon(siGoogleplay, "google play"),
  icon(siFitbit, "fitbit"),
];

interface BrandColorFallback {
  matchKind: "color";
  id: string;
  label: string;
  hex: string;
  keywords: string[];
}

function colorFallback(id: string, label: string, hex: string, keywords: string[]): BrandColorFallback {
  return { matchKind: "color", id, label, hex, keywords };
}

// Well-known subscriptions with no simple-icons entry (several were removed
// from that project after trademark-holder requests). Colors below are
// commonly-cited brand colors, not traced artwork — approximate for the
// handful without a single canonical hex (Peacock, MasterClass, Babbel).
const BRAND_COLOR_FALLBACKS: BrandColorFallback[] = [
  colorFallback("disney-plus", "Disney+", "#113CCF", ["disney"]),
  colorFallback("hulu", "Hulu", "#1CE783", ["hulu"]),
  colorFallback("peacock", "Peacock", "#000000", ["peacock"]),
  colorFallback("prime-video", "Prime Video", "#00A8E1", ["prime video", "amazon prime", "prime"]),
  colorFallback("xbox-game-pass", "Xbox Game Pass", "#107C10", ["xbox", "game pass"]),
  colorFallback("adobe-cc", "Adobe Creative Cloud", "#DA1F26", ["adobe"]),
  colorFallback("microsoft-365", "Microsoft 365", "#0078D4", ["microsoft 365", "office 365", "microsoft office"]),
  colorFallback("linkedin", "LinkedIn", "#0A66C2", ["linkedin"]),
  colorFallback("chatgpt", "ChatGPT", "#10A37F", ["chatgpt", "openai"]),
  colorFallback("aws", "AWS", "#FF9900", ["aws", "amazon web services"]),
  colorFallback("calm", "Calm", "#3E7CB1", ["calm"]),
  colorFallback("masterclass", "MasterClass", "#C6A15B", ["masterclass"]),
  colorFallback("babbel", "Babbel", "#0AA090", ["babbel"]),
  colorFallback("slack", "Slack", "#4A154B", ["slack"]),
  colorFallback("canva", "Canva", "#00C4CC", ["canva"]),
  colorFallback("heroku", "Heroku", "#430098", ["heroku"]),
];

export interface BrandOption {
  id: string;
  label: string;
}

export const ALL_BRAND_OPTIONS: BrandOption[] = [
  ...BRAND_ICONS.map((b) => ({ id: b.id, label: b.label })),
  ...BRAND_COLOR_FALLBACKS.map((b) => ({ id: b.id, label: b.label })),
].sort((a, b) => a.label.localeCompare(b.label));

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

function findByKeyword(name: string): BrandIcon | BrandColorFallback | undefined {
  const lower = name.toLowerCase();
  for (const entry of BRAND_ICONS) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry;
  }
  for (const entry of BRAND_COLOR_FALLBACKS) {
    if (entry.keywords.some((k) => lower.includes(k))) return entry;
  }
  return undefined;
}

function findById(id: string): BrandIcon | BrandColorFallback | undefined {
  return BRAND_ICONS.find((b) => b.id === id) ?? BRAND_COLOR_FALLBACKS.find((b) => b.id === id);
}

export type LogoResolution =
  | { kind: "custom"; src: string }
  | { kind: "icon"; hex: string; path: string; title: string }
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
    if (matched.matchKind === "icon") {
      return { kind: "icon", hex: matched.hex, path: matched.path, title: matched.label };
    }
    return { kind: "color", hex: matched.hex, initials: initialsFor(sub.name) };
  }

  const color = HASH_SLOTS[hashString(sub.name) % HASH_SLOTS.length];
  return { kind: "hash", color, initials: initialsFor(sub.name) };
}
