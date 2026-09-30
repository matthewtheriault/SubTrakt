# SubTrakt

A sleek, native desktop app for tracking every subscription and recurring
payment you have — Xbox Game Pass, VPNs, student loans, streaming, credit
cards, hosting — so you can see what you actually spend per month and per
year, and decide what's worth cutting.

Built with [Tauri](https://tauri.app) (Rust + WebView), **not Electron** —
small, fast, native `.app`/`.dmg` on macOS and `.exe`/`.msi` on Windows.

## Features

- Log a subscription with its name, category, amount, billing frequency
  (Bi-Weekly / Monthly / Yearly), next payment date, and which bank
  account/card it's paid from
- Dashboard with monthly, yearly, and bi-weekly equivalent totals, plus
  the next upcoming payment
- Spend broken down by category (Tech, Gaming, Entertainment, Loans,
  Server, Food, Utilities, Health, Finance, or any custom category)
- Search, filter by category, and sort by date/amount/name
- Everything is stored locally on your machine (no account, no cloud, no
  telemetry) via an encrypted-at-rest-by-your-OS JSON store

## Development

Requirements: [Node.js](https://nodejs.org) 20+, [Rust](https://rustup.rs),
and the [Tauri prerequisites](https://tauri.app/start/prerequisites/) for
your OS.

```bash
npm install
npm run tauri dev
```

## Building a release build locally

```bash
npm run tauri build
```

Outputs land in `src-tauri/target/release/bundle/`.

## Releases

Pushing a tag like `v1.0.1` triggers `.github/workflows/release.yml`, which
builds installers for macOS (universal) and Windows and attaches them as a
draft GitHub Release for review before publishing.

## Tech stack

- [Tauri v2](https://tauri.app) — Rust shell, native webview, no Electron
- React + TypeScript + Vite
- Tailwind CSS v4
- `tauri-plugin-store` for local persistent storage

## In progress: Orbit-inspired redesign + per-subscription logos

Started 2026-09-16. Full plan is at
`.claude/plans/stateful-wiggling-fiddle.md` (or ask Claude to pull it back up
by name if that path/session is gone) — this section is the durable summary.

### Goal

Restyle the UI to feel like the Orbit app (refero.design, app_id 255) —
dark, icon-forward rows, pill-shaped controls, card-driven layout, soft
accent glow — **without** copying Orbit's actual assets/copy/mascot, and
show a real app/company logo next to each tracked subscription. Decisions
made with the user:

- Keep SubTrakt's existing **black/orange** brand — no purple shift.
- Logos: bundled local icon set + curated brand-color fallback + hashed
  initials fallback + custom image upload. **No network calls** — the app
  stays fully offline (this ruled out a Clearbit/favicon-API approach).
- Scope is **both** macOS (Tauri/React) and iOS (native SwiftUI) — these
  are two separate codebases that mirror each other's data model, not one
  codebase targeting both.

### What's done

**Web/Tauri (`src/`)** — builds clean (`npm run build`), visually verified
in a browser (form + both fallback tiers, e.g. "Netflix" → real red icon
tile, "Disney Plus" → blue "DP" initials tile):
- `Subscription` gained `logoOverrideId?` and `customLogoDataUrl?`
  (`src/types.ts`, backfilled in `src/lib/normalize.ts`, threaded through
  `SubscriptionInput` in `src/useSubscriptions.ts`).
- `src/lib/brandIcons.ts` (new) — `resolveLogo()`: custom image → manual
  override → name auto-match against a curated brand-color table (initials
  tile, no logo artwork) → hashed initials. Brand ids match iOS.
- `src/components/LogoBadge.tsx` (new) — renders whichever tier.
- `SubscriptionForm.tsx` — new "Logo" field: live preview, "Choose image…"
  (resizes to 256×256 PNG via canvas before storing), brand-icon datalist
  picker, Remove button.
- `SubscriptionRow.tsx`, `App.tsx` sidebar/header, `StatCard.tsx`,
  `SettingsPanel.tsx`, `ConfirmDialog.tsx`, `FrequencyToggle.tsx` — pill
  shapes, bumped card radii, `--accent-glow` on primary CTAs/hero stat
  (new tokens in `src/index.css`: `--radius-xl/2xl/full`, `--accent-glow`).

**iOS (`ios/SubTrakt/SubTrakt/`)** — written to match existing conventions
but **not yet compiled** (see blocker below):
- `Subscription`/`SubscriptionDraft`/`AppStore` gained matching
  `logoOverride: String?` / `customLogoData: Data?` fields.
- `Logic/BrandIcons.swift` (new) — Swift port of the resolver **minus the
  bundled glyph tier**: known brands get a brand-colored initials tile, so
  the App Store build ships no third-party logo artwork (guideline 5.2.1).
  Brand `id`s must stay in sync with `src/lib/brandIcons.ts` by hand, since
  they're persisted as `logoOverride`.
- `Views/Shared/LogoBadgeView.swift` (new).
- `SubscriptionFormView.swift` — Logo section with `PhotosPicker` (crops
  to a 256×256 PNG) + a brand-icon `Menu` + Remove.
- `SubscriptionRowView.swift` — logo tile replaces the old category dot
  (category color now a small dot overlaid on the tile's corner).
- `Logic/Theme.swift` (new) — `cardBackground()`/`accentGlow()` modifiers,
  used in `DashboardView.swift`/`StatCardView.swift`/`SubscriptionRowView.swift`
  to de-duplicate the repeated card-style code and bump radius 12→16.
- `SettingsView.swift` / `SubscriptionFormView.swift` — `Form` now uses
  `.scrollContentBackground(.hidden)` + `Page` background instead of
  default system list chrome.
- (Removed) An earlier `scripts/generate-brand-icons.mjs` rasterized
  `simple-icons` glyphs into the iOS asset catalog. It was dropped along
  with those assets before App Store submission; the web/Tauri app later
  dropped `simple-icons` too, so neither app bundles third-party logos.

### Blocker: Xcode license not accepted on this Mac

`xcodebuild`, `cargo`/`rustc` (via `cc`), and even `/usr/bin/git` all
currently refuse to run with:

> You have not agreed to the Xcode license agreements. Please run
> `sudo xcodebuild -license` from within a Terminal window...

This is a system-level thing (likely reset by an Xcode update to 27.0),
not caused by this change. It blocked verifying the iOS build and running
the real Tauri desktop shell (`npm run tauri dev`) to test persistence
end-to-end — only the pure logo-resolution logic and the web UI (via plain
`npm run dev` in a browser, which can't hit the Tauri store) were verified.

**To unblock:** run `sudo xcodebuild -license` yourself in Terminal and
accept it. This needs to happen before any of: `git status`/`git commit`
working normally again, `npm run tauri dev`/`npm run tauri build`, or
opening/building `ios/SubTrakt/SubTrakt.xcodeproj`.

### Next steps (pick up here)

1. Run `sudo xcodebuild -license`.
2. `git status` / review the diff — nothing has been committed yet.
3. `npm run tauri dev` — confirm the desktop app persists subscriptions
   (real Tauri store, not the plain-browser dev server) and re-check the
   redesigned UI end-to-end (add/edit/delete, all three logo tiers, custom
   image upload + persistence across a restart).
4. Open `ios/SubTrakt/SubTrakt.xcodeproj` in Xcode, build for a Simulator,
   fix whatever the compiler flags (the Swift was hand-written against the
   existing patterns but never compiled), and manually test the same
   logo/persistence flow there.
5. Once both platforms check out, commit (nothing's committed yet) and
   consider running `/code-review` before opening a PR.
6. Optional polish ideas not yet done: expand the brand-icon coverage
   list further, consider whether `Peacock`/`MasterClass`/`Babbel`/`Calm`
   approximate hex colors need real-world sanity-checking, and decide
   whether the flat 75-option `Menu` picker on iOS should become a
   searchable list if it feels unwieldy in practice.
