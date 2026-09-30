# App Store Connect listing & submission checklist

Draft metadata to paste into App Store Connect, plus the manual steps that
can't live in code. Character limits are Apple's.

## App information

| Field | Value |
|---|---|
| Name (30) | SubTrakt |
| Subtitle (30) | Track subscriptions & renewals |
| Bundle ID | com.mattheriault.SubTrakt |
| Primary category | Finance |
| Secondary category | Productivity |
| Privacy Policy URL | https://matthewtheriault.github.io/SubTrakt/privacy.html |
| Support URL | https://matthewtheriault.github.io/SubTrakt/support.html |
| Content rights | Does not contain, show, or access third-party content |
| Age rating | Answer "None" to every questionnaire item → 4+ |
| Price | Free (or your choice) |

## Version 1.0 text

**Promotional text (170)**
See every subscription in one place, get a reminder before each charge, and spot the ones you've stopped using. No account needed. Your data stays on your phone.

**Description (4000)**

SubTrakt helps you keep track of every subscription you pay for, so you're never surprised by a charge.

• All your subscriptions in one list: streaming, software, gaming, cloud storage, loans, and anything else that renews.
• Reminders before each charge and before a free trial converts, a set number of days ahead.
• Monthly and yearly totals, broken down by category.
• Cancel candidates: SubTrakt flags subscriptions you haven't used in a while.
• Price history, so you can see when a service raised its price.
• Multiple currencies with your own exchange rates, all converted to one base currency.
• Bi-weekly, monthly, semi-annual, and yearly billing.
• One tap to mark a charge as paid and move it to the next billing date.

Private by design: SubTrakt has no account, no ads, and no tracking. Everything you enter is stored only on your device.

**Keywords (100, comma-separated, no spaces needed)**
subscription,tracker,bills,renewal,budget,reminder,trial,recurring,expenses,manager,spending,cancel

**What's New**: leave blank for 1.0.

## App Privacy ("nutrition label")

Data collection → **No, we do not collect data from this app.**
(Matches `PrivacyInfo.xcprivacy`: no tracking, no collected data types.)

## Export compliance

Already answered in the build (`ITSAppUsesNonExemptEncryption = NO`), so
upload won't prompt.

## Screenshots (required)

- **iPhone 6.9"** (1320×2868 or 1290×2796): 3–10 images. Take them with the
  iPhone 17 Pro Max simulator (⌘S saves to Desktop).
- **iPad 13"** (2064×2752): required because the app supports iPad
  (`TARGETED_DEVICE_FAMILY = 1,2`). To skip iPad, set that to `'1'` in
  `generate_project.rb` and regenerate.
- Suggested shots: dashboard with totals, subscription list, add/edit form,
  trial reminder / cancel candidate, settings with currencies.
- Use made-up but realistic data. Don't show real brand logos in
  screenshots.

## Review notes (App Review Information)

> SubTrakt is fully offline with no login. To test, tap + to add a
> subscription with a payment date a few days out. Reminders are local
> notifications. The permission prompt appears after the first subscription
> is added.

Contact info (name/phone/email) is required here but is only shown to Apple.

## Before each upload

1. Bump `CURRENT_PROJECT_VERSION` in `generate_project.rb` (and
   `MARKETING_VERSION` for a new public version), then
   `ruby ios/generate_project.rb`.
2. Xcode → Product → Archive → Distribute App → App Store Connect.
3. Test the build on a real device via TestFlight before submitting.

## One-time setup

- Enable GitHub Pages: repo Settings → Pages → Deploy from branch → `main`,
  folder `/docs`. Pages on a free plan needs a **public** repo. If the repo
  stays private, host `docs/privacy.html` and `docs/support.html` somewhere
  else and update the URLs in `Models/Constants.swift` and above.
- Open both URLs in a browser before submitting. App Review checks them.
