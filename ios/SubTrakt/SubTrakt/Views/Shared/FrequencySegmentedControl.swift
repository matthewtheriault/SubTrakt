import SwiftUI

struct FrequencySegmentedControl: View {
    @Binding var value: Frequency

    var body: some View {
        Picker("Billing frequency", selection: $value) {
            ForEach(Frequency.allCases) { frequency in
                Text(frequency.label).tag(frequency)
            }
        }
        .pickerStyle(.segmented)
    }
}
