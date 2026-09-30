#!/usr/bin/env bash
# Captures App Store screenshots on the iPhone 6.9" and iPad 13" simulators.
#
# Builds a Debug build (the -screenshot launch argument only exists in
# Debug, see RootTabView.swift), seeds sample data relative to today, and
# saves PNGs to ios/screenshots/<device>/.
#
# WARNING: replaces the app's data on those simulators with the sample set.
#
# Usage: ios/take_screenshots.sh [light|dark]   (default: dark)
set -euo pipefail
APPEARANCE="${1:-dark}"

cd "$(dirname "$0")"
BUNDLE_ID="com.mattheriault.SubTrakt"
DERIVED="SubTrakt/build/screenshots"
OUT="screenshots"
DEVICES=("iPhone 17 Pro Max" "iPad Pro 13-inch (M5)")
SCREENS=("onboarding" "dashboard" "list" "edit" "settings")
EDIT_NAME="Headspace"

xcodebuild -project SubTrakt/SubTrakt.xcodeproj -scheme SubTrakt -configuration Debug \
  -destination 'generic/platform=iOS Simulator' -derivedDataPath "$DERIVED" \
  build CODE_SIGNING_ALLOWED=NO -quiet
APP="$DERIVED/Build/Products/Debug-iphonesimulator/SubTrakt.app"

seed_json() {
  python3 - "$1" <<'EOF'
import json, sys, datetime, os
d = sys.argv[1]
today = datetime.date.today()
iso = lambda days: (today + datetime.timedelta(days=days)).isoformat()
now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

def sub(name, category, amount, freq, pay_in, account, used_ago=3, currency="USD",
        history=None, trial_end_in=None, notes=None):
    hist = [{"amount": a, "frequency": freq, "currency": currency, "effectiveFrom": iso(-days)}
            for a, days in (history or [])]
    hist.append({"amount": amount, "frequency": freq, "currency": currency, "effectiveFrom": iso(-120)})
    return {
        "id": name.lower().replace(" ", "-"), "name": name, "category": category,
        "amount": amount, "currency": currency, "frequency": freq,
        "paymentDate": iso(pay_in), "account": account, "notes": notes,
        "isTrial": trial_end_in is not None,
        "trialEndDate": iso(trial_end_in) if trial_end_in is not None else None,
        "lastUsedDate": iso(-used_ago), "priceHistory": hist,
        "createdAt": now, "updatedAt": now,
    }

subs = [
    sub("Netflix", "Entertainment", 17.99, "monthly", 2, "Visa •• 4821", 1, history=[(15.49, 400)]),
    sub("Spotify", "Entertainment", 11.99, "monthly", 6, "Visa •• 4821", 0),
    sub("Headspace", "Health", 69.99, "yearly", 2, "Apple Pay", 4, trial_end_in=2,
        notes="Cancel before the trial converts if I'm not using it."),
    sub("Adobe Creative Cloud", "Tech", 59.99, "monthly", 11, "Amex •• 1009", 2, history=[(54.99, 300)]),
    sub("Xbox Game Pass", "Gaming", 19.99, "monthly", 14, "Amex •• 1009", 61),
    sub("Peloton", "Health", 44.00, "monthly", 19, "Visa •• 4821", 47),
    sub("iCloud+", "Tech", 2.99, "monthly", 8, "Apple Pay", 0),
    sub("ChatGPT", "Tech", 20.00, "monthly", 22, "Amex •• 1009", 1),
    sub("DigitalOcean", "Server", 12.00, "monthly", 4, "Amex •• 1009", 5),
    sub("Car Loan", "Loans", 289.00, "monthly", 13, "Checking", 0),
    sub("Amazon Prime", "Entertainment", 139.00, "yearly", 74, "Visa •• 4821", 3),
    sub("Babbel", "Other", 44.99, "semiannual", 51, "Visa •• 4821", 9, currency="EUR"),
    sub("Gym Membership", "Health", 24.00, "biweekly", 9, "Checking", 2),
]
settings = {"baseCurrency": "USD", "exchangeRates": {"EUR": 1.08},
            "reminderDaysBefore": 3, "staleAfterDays": 30}
os.makedirs(d, exist_ok=True)
json.dump(subs, open(os.path.join(d, "subscriptions.json"), "w"), ensure_ascii=False, indent=2)
json.dump(settings, open(os.path.join(d, "settings.json"), "w"), indent=2)
EOF
}

# iPadOS 26 in "Windowed Apps" mode draws a window-resize arc in the
# bottom-right corner. It's system chrome, not app UI, so paint that corner
# with the neighboring background color (the corner is always plain page).
hide_resize_handle() {
  python3 - "$1" <<'EOF'
import sys
from PIL import Image
path = sys.argv[1]
img = Image.open(path).convert("RGB")
w, h = img.size
box = 64  # the arc sits in the last ~55px; sheets end well before this
fill = img.getpixel((w - 2, h - box - 8))
img.paste(fill, (w - box, h - box, w, h))
img.save(path)
EOF
}

for device in "${DEVICES[@]}"; do
  xcrun simctl boot "$device" 2>/dev/null || true
  xcrun simctl bootstatus "$device" -b >/dev/null
  xcrun simctl ui "$device" appearance "$APPEARANCE"
  xcrun simctl status_bar "$device" override --time "9:41" --batteryState discharging \
    --batteryLevel 100 --cellularBars 4 --wifiBars 3 --dataNetwork wifi 2>/dev/null || true

  xcrun simctl terminate "$device" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl install "$device" "$APP"
  container=$(xcrun simctl get_app_container "$device" "$BUNDLE_ID" data)
  seed_json "$container/Library/Application Support/$BUNDLE_ID"

  # Throwaway launch: the first launch after another app shows a "◀ <app>"
  # back button in the status bar, which mustn't end up in a screenshot.
  xcrun simctl launch "$device" "$BUNDLE_ID" >/dev/null
  sleep 2

  dir="$OUT/$APPEARANCE/$(echo "$device" | tr ' ' '-' | tr -d '()')"
  mkdir -p "$dir"
  i=1
  for screen in "${SCREENS[@]}"; do
    xcrun simctl terminate "$device" "$BUNDLE_ID" 2>/dev/null || true
    xcrun simctl launch "$device" "$BUNDLE_ID" -screenshot "$screen" -screenshotEdit "$EDIT_NAME" >/dev/null
    sleep 4
    xcrun simctl io "$device" screenshot "$dir/$i-$screen.png" >/dev/null
    if [[ "$device" == iPad* ]]; then hide_resize_handle "$dir/$i-$screen.png"; fi
    i=$((i + 1))
  done
  xcrun simctl terminate "$device" "$BUNDLE_ID" 2>/dev/null || true
  xcrun simctl status_bar "$device" clear 2>/dev/null || true
done

echo "Screenshots saved under ios/$OUT/"
