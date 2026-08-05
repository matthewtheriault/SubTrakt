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
