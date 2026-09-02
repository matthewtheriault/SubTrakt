import SwiftUI

struct SubscriptionFormView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss

    let existing: Subscription?

    @State private var name = ""
    @State private var category = ""
    @State private var amountText = ""
    @State private var currency = "USD"
    @State private var frequency: Frequency = .monthly
    @State private var paymentDate: Date?
    @State private var hasPaymentDate = false
    @State private var account = ""
    @State private var lastUsedDate: Date?
    @State private var hasLastUsedDate = false
    @State private var isTrial = false
    @State private var trialEndDate = Date()
    @State private var notes = ""
    @State private var errorMessage: String?

    private var knownCategories: [String] {
        KnownCategories.known(from: store.subscriptions)
    }

    private var currencyOptions: [String] {
        Array(Set(Constants.commonCurrencies + [currency])).sorted()
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Name") {
                    TextField("e.g. Xbox Game Pass", text: $name)
                }

                Section("Category") {
                    CategoryPickerField(category: $category, knownCategories: knownCategories)
                }

                Section("Amount") {
                    HStack {
                        TextField("0.00", text: $amountText)
                            .keyboardType(.decimalPad)
                        Picker("Currency", selection: $currency) {
                            ForEach(currencyOptions, id: \.self) { Text($0).tag($0) }
                        }
                        .pickerStyle(.menu)
                    }
                }

                Section("Payment date") {
                    Toggle("Has a scheduled payment date", isOn: $hasPaymentDate)
                    if hasPaymentDate {
                        DatePicker("Payment date", selection: Binding(get: { paymentDate ?? Date() }, set: { paymentDate = $0 }), displayedComponents: .date)
                            .labelsHidden()
                    }
                }

                Section("Billing frequency") {
                    FrequencySegmentedControl(value: $frequency)
                }

                Section("Bank account / card") {
                    TextField("e.g. Chase Sapphire, •••• 4821", text: $account)
                }

                Section {
                    Toggle("Has a \"last used\" date", isOn: $hasLastUsedDate)
                    if hasLastUsedDate {
                        DatePicker("Last used", selection: Binding(get: { lastUsedDate ?? Date() }, set: { lastUsedDate = $0 }), displayedComponents: .date)
                            .labelsHidden()
                    }
                } header: {
                    Text("Last used (optional)")
                } footer: {
                    Text("Track when you actually used this, to spot subscriptions worth cutting.")
                }

                Section {
                    Toggle("This is a free trial", isOn: $isTrial)
                    if isTrial {
                        DatePicker("Trial ends / converts to paid on", selection: $trialEndDate, displayedComponents: .date)
                    }
                }

                Section("Notes (optional)") {
                    TextField("Anything worth remembering about this one", text: $notes, axis: .vertical)
                        .lineLimit(2...4)
                }

                if let errorMessage {
                    Section {
                        Text(errorMessage).foregroundStyle(Color("StatusCritical"))
                    }
                }
            }
            .navigationTitle(existing == nil ? "Add Subscription" : "Edit Subscription")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button(existing == nil ? "Add" : "Save") { submit() }
                }
            }
            .onAppear(perform: populateIfEditing)
        }
    }

    private func populateIfEditing() {
        guard let existing else {
            currency = store.settings.baseCurrency
            return
        }
        name = existing.name
        category = existing.category
        amountText = String(existing.amount)
        currency = existing.currency
        frequency = existing.frequency
        if let raw = existing.paymentDate, let date = DateMath.parseISODate(raw) {
            paymentDate = date
            hasPaymentDate = true
        }
        account = existing.account
        if let raw = existing.lastUsedDate, let date = DateMath.parseISODate(raw) {
            lastUsedDate = date
            hasLastUsedDate = true
        }
        isTrial = existing.isTrial
        if let raw = existing.trialEndDate, let date = DateMath.parseISODate(raw) {
            trialEndDate = date
        }
        notes = existing.notes ?? ""
    }

    private func submit() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedCategory = category.trimmingCharacters(in: .whitespacesAndNewlines)
        let trimmedAccount = account.trimmingCharacters(in: .whitespacesAndNewlines)
        let amount = Double(amountText) ?? .nan

        guard !trimmedName.isEmpty else {
            errorMessage = "Give the subscription a name."
            return
        }
        guard !trimmedCategory.isEmpty else {
            errorMessage = "Pick or type a category."
            return
        }
        guard amount.isFinite, amount > 0 else {
            errorMessage = "Amount must be a number greater than 0."
            return
        }
        guard !trimmedAccount.isEmpty else {
            errorMessage = "Note which account or card this is paid from."
            return
        }
        if isTrial {
            // trialEndDate always has a value via the DatePicker default; nothing further to validate.
        }

        var draft = SubscriptionDraft()
        draft.name = trimmedName
        draft.category = trimmedCategory
        draft.amount = amount
        draft.currency = currency
        draft.frequency = frequency
        draft.paymentDate = hasPaymentDate ? DateMath.isoString(from: paymentDate ?? Date()) : nil
        draft.account = trimmedAccount
        draft.notes = notes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? nil : notes
        draft.isTrial = isTrial
        draft.trialEndDate = isTrial ? DateMath.isoString(from: trialEndDate) : nil
        draft.lastUsedDate = hasLastUsedDate ? DateMath.isoString(from: lastUsedDate ?? Date()) : nil

        if let existing {
            store.updateSubscription(id: existing.id, with: draft)
        } else {
            store.addSubscription(draft)
        }
        dismiss()
    }
}
