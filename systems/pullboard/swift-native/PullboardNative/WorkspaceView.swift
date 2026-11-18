import SwiftUI

struct WorkspaceView: View {
    @EnvironmentObject private var board: BoardStore
    @State private var screen: Screen? = .home
    @State private var query = ""
    @State private var filter = "All"
    @State private var original = false
    @State private var editing: LocalItem?
    @State private var inspected: String?
    @AppStorage("pullboard.native.appearance") private var appearance = "System"

    var body: some View {
        NavigationSplitView {
            List(Screen.allCases, selection: $screen) { entry in
                Label(entry.rawValue, systemImage: entry.symbol).tag(entry)
            }
            .navigationTitle("Pullboard")
            .safeAreaInset(edge: .bottom) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("OFFLINE · v0.9.3 reference").font(.caption.monospaced())
                    Picker("Snapshot", selection: $board.source) {
                        Text("Recorded tour").tag("tour")
                        Text("Official sample").tag("sample")
                    }.labelsHidden()
                    Text("Native adaptation · no agents running").font(.caption).foregroundStyle(.secondary)
                }.padding()
            }
        } detail: {
            NavigationStack {
                Group {
                    switch screen ?? .home {
                    case .home: home
                    case .items: items
                    case .shouts: records("shouts", title: "Shouts", subtitle: "No shouts in this snapshot.")
                    case .spec: records("spec", title: "Specification", subtitle: "No specification rows.")
                    case .doctrine: records("practice", title: "Doctrine", subtitle: "No doctrine rows.")
                    case .activity: records("events", title: "Activity", subtitle: "No recorded events.")
                    case .roadmap: records("milestones", title: "Roadmap", subtitle: "No milestones in this snapshot.")
                    case .settings: settings
                    }
                }
                .navigationTitle((screen ?? .home).rawValue)
                .toolbar { Button("Original UI", systemImage: "rectangle.on.rectangle") { original = true } }
                .safeAreaInset(edge: .bottom) {
                    Text("Local prototype. Snapshot evidence is read-only; your drafts stay on this device.")
                        .font(.caption).foregroundStyle(.secondary).frame(maxWidth: .infinity).padding(8).background(.bar)
                }
            }
        }
        .preferredColorScheme(appearance == "Dark" ? .dark : appearance == "Light" ? .light : nil)
        .sheet(isPresented: $original) { NavigationStack {
            OriginalUIView().navigationTitle("Original Pullboard UI")
                .toolbar { Button("Done") { original = false } }
        } }
        .sheet(item: $editing) { item in ItemEditor(item: item).environmentObject(board) }
        .sheet(isPresented: Binding(get: { inspected != nil }, set: { if !$0 { inspected = nil } })) {
            NavigationStack { ScrollView { Text(inspected ?? "").font(.system(.body, design: .monospaced)).textSelection(.enabled).padding() }
                .navigationTitle("Snapshot record").toolbar { Button("Done") { inspected = nil } }
            }
        }
        .alert("Local data", isPresented: Binding(get: { board.error != nil }, set: { if !$0 { board.error = nil } })) {
            Button("OK") { board.error = nil }
        } message: { Text(board.error ?? "") }
    }

    private var home: some View {
        List {
            Section {
                Text(board.state["root"] as? String ?? "Pullboard").font(.largeTitle.bold())
                Text("Nothing ships until a second agent verifies it.").font(.title3)
                Text(board.source == "tour" ? "Recorded official scripted tour. Real Git operations; scripted seats, no model inference." : "Upstream's authored sample snapshot. Viewing sample data does not execute a task.")
                    .foregroundStyle(.secondary)
            }
            Section("Board at a glance") {
                LabeledContent("Items", value: "\(board.rows("items").count)")
                LabeledContent("Verified", value: "\(board.rows("items").filter { board.text($0, "status") == "verified" }.count)")
                LabeledContent("Registered seats", value: "\(board.rows("agents").count)")
                LabeledContent("Recorded events", value: "\(board.rows("events").count)")
            }
            Section("Explore") {
                Button("Inspect work items") { screen = .items }
                Button("Read the acceptance specification") { screen = .spec }
                Button("See the event history") { screen = .activity }
                Button("Create a device-only draft", systemImage: "plus") { newItem() }
            }
            Section("Agents in the snapshot") {
                ForEach(Array(board.rows("agents").enumerated()), id: \.offset) { _, row in
                    LabeledContent(board.text(row, "displayName"), value: board.text(row, "agent_lane"))
                }
            }
        }
    }
    private var items: some View {
        List {
            Section {
                Picker("Status", selection: $filter) { ForEach(["All", "open", "claimed", "submitted", "verified", "withdrawn"], id: \.self) { Text($0) } }
                Button("New local draft", systemImage: "plus") { newItem() }
            }
            Section("Recorded work · read-only") {
                ForEach(Array(filteredItems.enumerated()), id: \.offset) { _, row in
                    Button { inspect(row) } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("#\(board.text(row, "id"))  \(board.text(row, "title"))").font(.headline)
                            Text("\(board.text(row, "lane")) · \(board.text(row, "status"))").font(.caption).foregroundStyle(.secondary)
                            Text(board.text(row, "criterion")).font(.subheadline).foregroundStyle(.primary)
                        }.padding(.vertical, 4)
                    }
                }
                if filteredItems.isEmpty { Text("No matching recorded items.").foregroundStyle(.secondary) }
            }
            Section("Your local drafts · no Git execution") {
                ForEach(board.localItems.filter { query.isEmpty || $0.title.localizedCaseInsensitiveContains(query) }) { item in
                    Button { editing = item } label: {
                        VStack(alignment: .leading) { Text(item.title); Text("\(item.lane) · \(item.status)").font(.caption).foregroundStyle(.secondary) }
                    }
                }
            }
        }.searchable(text: $query, prompt: "Find an item")
    }
    private var filteredItems: [[String: Any]] {
        board.rows("items").filter { row in
            (filter == "All" || board.text(row, "status") == filter) &&
            (query.isEmpty || board.text(row, "title").localizedCaseInsensitiveContains(query))
        }
    }
    private func records(_ key: String, title: String, subtitle: String) -> some View {
        List {
            Section("Recorded snapshot · tap to inspect") {
                ForEach(Array(board.rows(key).enumerated()), id: \.offset) { _, row in
                    Button { inspect(row) } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text(board.text(row, "title").isEmpty ? (board.text(row, "event_kind").isEmpty ? board.text(row, "id") : board.text(row, "event_kind")) : board.text(row, "title")).font(.headline)
                            Text(board.text(row, "text").isEmpty ? board.text(row, "event_detail") : board.text(row, "text")).lineLimit(5).foregroundStyle(.primary)
                            Text(["status", "event_by", "event_at", "gate"].map { board.text(row, $0) }.filter { !$0.isEmpty }.joined(separator: " · ")).font(.caption).foregroundStyle(.secondary)
                        }.padding(.vertical, 4)
                    }
                }
                if board.rows(key).isEmpty { Text(subtitle).foregroundStyle(.secondary) }
            }
        }
    }
    private var settings: some View {
        Form {
            Section("Appearance") { Picker("Theme", selection: $appearance) { ForEach(["System", "Light", "Dark"], id: \.self) { Text($0) } } }
            Section("Runtime") {
                LabeledContent("Network", value: "Disabled")
                LabeledContent("Backend", value: "None")
                LabeledContent("Models / API keys", value: "Not configured")
                LabeledContent("Storage", value: "Device preferences")
            }
            Section("Interface provenance") {
                Text("SwiftUI screens are an independent native adaptation of Pullboard v0.9.3's information structure. Original UI opens the unchanged official export using Apple's WebKit. The native screens are not an official Pullboard release.")
                Text("Local drafts cannot claim, verify, merge or execute real work. Snapshot rows remain unchanged.")
            }
        }
    }
    private func newItem() { editing = LocalItem(title: "", lane: "app", status: "open", criterion: "", note: "") }
    private func inspect(_ row: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: row, options: [.prettyPrinted, .sortedKeys]), let text = String(data: data, encoding: .utf8) else { return }
        inspected = text
    }
}

struct ItemEditor: View {
    @EnvironmentObject private var board: BoardStore
    @Environment(\.dismiss) private var dismiss
    @State var item: LocalItem
    var body: some View {
        NavigationStack {
            Form {
                Section("Local draft") {
                    TextField("Title", text: $item.title)
                    TextField("Lane", text: $item.lane)
                    TextField("Acceptance criterion", text: $item.criterion, axis: .vertical)
                    TextField("Notes", text: $item.note, axis: .vertical)
                }
                Section { Text("Saving stores a draft on this device. No agent is started and no verification or merge is recorded.").foregroundStyle(.secondary) }
            }.navigationTitle("Draft item")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) { Button("Cancel") { dismiss() } }
                    ToolbarItem(placement: .confirmationAction) { Button("Save") { board.save(item); dismiss() }.disabled(item.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty) }
                }
        }
    }
}
