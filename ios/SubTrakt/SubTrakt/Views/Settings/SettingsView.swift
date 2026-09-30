import SwiftUI
import UserNotifications

struct SettingsView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @Environment(\.openURL) private var openURL

    @State private var notificationsDenied = false

    @State private var baseCurrency = "USD"
    @State private var reminderDaysBeforeText = "3"
    @State private var staleAfterDaysText = "30"
    @State private var rateTexts: [String: String] = [:]

    private var currenciesInUse: [String] {
        Array(Set(store.subscriptions.map(\.currency))).sorted()
    }

    private var foreignCurrencies: [String] {
        currenciesInUse.filter { $0 != baseCurrency }
    }

    private var currencyOptions: [String] {
        Array(Set(Constants.commonCurrencies + [baseCurrency])).sorted()
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Appearance", selection: Binding(
                        get: { store.settings.appearance },
                        set: { store.setAppearance($0) }
                    )) {
                        ForEach(Appearance.allCases) { Text($0.label).tag($0) }
                    }
                    .pickerStyle(.segmented)
                    .listRowBackground(Color.clear)
                    .listRowInsets(EdgeInsets())
                } header: {
                    Text("Appearance")
                }

                Section {
                    Picker("Base currency", selection: $baseCurrency) {
                        ForEach(currencyOptions, id: \.self) { Text($0).tag($0) }
                    }
                } footer: {
                    Text("Totals and the category chart are converted into this currency.")
                }

                if !foreignCurrencies.isEmpty {
                    Section {
                        ForEach(foreignCurrencies, id: \.self) { code in
                            HStack {
                                Text("1 \(code) =")
                                    .foregroundStyle(Color("TextMuted"))
                                TextField("rate", text: Binding(
                                    get: { rateTexts[code] ?? "" },
                                    set: { rateTexts[code] = $0 }
                                ))
                                .keyboardType(.decimalPad)
                                .multilineTextAlignment(.trailing)
                                Text(baseCurrency).foregroundStyle(Color("TextMuted"))
                            }
                        }
                    } header: {
                        Text("Exchange rates to \(baseCurrency)")
                    } footer: {
                        Text("Leave blank to treat as 1:1 until you set a rate.")
                    }
                }

                Section {
                    HStack {
                        TextField("3", text: $reminderDaysBeforeText)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                        Text("days ahead")
                    }
                } header: {
                    Text("Remind me before a charge / trial ends")
                } footer: {
                    if notificationsDenied {
                        Button("Notifications are off for DueDate. Turn them on in Settings.") {
                            if let url = URL(string: UIApplication.openNotificationSettingsURLString) {
                                openURL(url)
                            }
                        }
                        .font(.footnote)
                    }
                }

                Section {
                    HStack {
                        TextField("30", text: $staleAfterDaysText)
                            .keyboardType(.numberPad)
                            .frame(width: 60)
                        Text("days unused")
                    }
                } header: {
                    Text("Flag as a cancel candidate after")
                }

                Section {
                    LabeledContent("Version", value: appVersion)
                    Link("Privacy Policy", destination: Constants.privacyPolicyURL)
                    Link("Support", destination: Constants.supportURL)
                } header: {
                    Text("About")
                } footer: {
                    Text("Your subscriptions are stored only on this device. DueDate has no account and sends nothing off your phone.")
                }
            }
            .scrollContentBackground(.hidden)
            .background(Color("Page"))
            .navigationTitle("Settings")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                }
            }
            .onAppear(perform: populate)
            .task {
                let status = await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
                notificationsDenied = status == .denied
            }
        }
        .pageSheetSizing()
    }

    private var appVersion: String {
        let info = Bundle.main.infoDictionary
        let version = info?["CFBundleShortVersionString"] as? String ?? "?"
        let build = info?["CFBundleVersion"] as? String ?? "?"
        return "\(version) (\(build))"
    }

    private func populate() {
        let settings = store.settings
        baseCurrency = settings.baseCurrency
        reminderDaysBeforeText = String(settings.reminderDaysBefore)
        staleAfterDaysText = String(settings.staleAfterDays)
        rateTexts = settings.exchangeRates.mapValues { String($0) }
    }

    private func save() {
        var exchangeRates: [String: Double] = [:]
        for code in foreignCurrencies {
            if let value = Double(rateTexts[code] ?? ""), value > 0 {
                exchangeRates[code] = value
            }
        }
        let next = AppSettings(
            baseCurrency: baseCurrency,
            exchangeRates: exchangeRates,
            reminderDaysBefore: max(0, Int(reminderDaysBeforeText) ?? 0),
            staleAfterDays: max(1, Int(staleAfterDaysText) ?? 30),
            appearance: store.settings.appearance,
            hasCompletedOnboarding: store.settings.hasCompletedOnboarding
        )
        store.updateSettings(next)
        dismiss()
    }
}
