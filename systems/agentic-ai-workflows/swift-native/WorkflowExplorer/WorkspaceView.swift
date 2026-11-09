import SwiftUI
import UniformTypeIdentifiers

struct WorkspaceView: View {
    @EnvironmentObject var store: CatalogStore
    @State private var workflowID: String?
    @State private var tab = "Nodes"
    @State private var query = ""
    @State private var selected: WorkflowNode?
    @State private var export = false
    private var workflow: Workflow? { store.catalog?.workflows.first { $0.id == workflowID } ?? store.catalog?.workflows.first }
    var body: some View {
        NavigationSplitView {
            List(selection: $workflowID) {
                ForEach(store.catalog?.workflows ?? []) { item in
                    VStack(alignment: .leading) { Text(item.title); Text("Inactive n8n template").font(.caption).foregroundStyle(.secondary) }.tag(item.id)
                }
            }.navigationTitle("Workflows")
                .safeAreaInset(edge: .bottom) { Text("Independent frontend\nNo backend · no execution").font(.caption).foregroundStyle(.secondary).padding() }
        } detail: {
            if let workflow {
                NavigationStack {
                    VStack(spacing: 0) {
                        Text("Actual source templates, not an original upstream app. Nothing executes here.").font(.caption).foregroundStyle(.secondary).padding(10)
                        Picker("View", selection: $tab) { ForEach(["Graph", "Nodes", "Readiness", "My notes"], id: \.self) { Text($0) } }.pickerStyle(.segmented).padding(.horizontal)
                        if tab == "Graph" { WorkflowGraph(workflow: workflow) { selected = $0 } }
                        else if tab == "Nodes" {
                            List(workflow.nodes.filter { query.isEmpty || $0.name.localizedCaseInsensitiveContains(query) || $0.type.localizedCaseInsensitiveContains(query) }) { node in
                                Button { selected = node } label: { VStack(alignment: .leading, spacing: 5) { Text(node.name); Text(node.type).font(.caption).foregroundStyle(.secondary); if node.annotation { Text("Source annotation").font(.caption2) } } }
                            }.searchable(text: $query, prompt: "Find a node")
                        } else if tab == "Readiness" {
                            List { Section("Static findings — not execution results") { ForEach(Array(workflow.issues.enumerated()), id: \.offset) { _, finding in VStack(alignment: .leading, spacing: 6) { Text(finding.node).font(.headline); Text(finding.detail).foregroundStyle(.secondary) } } } }
                        } else { NotesView(workflowID: workflow.id).id(workflow.id) }
                    }.navigationTitle(workflow.title)
                        .toolbar { Button("Export review", systemImage: "square.and.arrow.up") { export = true } }
                }
                .fileExporter(isPresented: $export, document: ReviewDocument(text: review(workflow)), contentType: .json, defaultFilename: "\(workflow.id)-review") { _ in }
            } else { ContentUnavailableView("Catalog unavailable", systemImage: "exclamationmark.triangle", description: Text(store.error ?? "No workflows in bundle.")) }
        }
        .onChange(of: workflowID) { _, _ in selected = nil; query = "" }
        .sheet(item: $selected) { node in
            NavigationStack { ScrollView { VStack(alignment: .leading, spacing: 16) {
                Text(node.type).font(.caption).foregroundStyle(.secondary)
                if !node.notes.isEmpty { Text(node.notes) }
                Text("Exported parameters").font(.headline)
                Text(node.parameters).font(.system(.caption, design: .monospaced)).textSelection(.enabled)
                Text("Connections").font(.headline)
                ForEach(workflow?.edges.filter { $0.source == node.name || $0.target == node.name } ?? []) { edge in Text("\(edge.source) → \(edge.target)\n\(edge.kind) · output \(edge.output) → input \(edge.input)").font(.caption) }
            }.frame(maxWidth: .infinity, alignment: .leading).padding() }.navigationTitle(node.name).toolbar { Button("Done") { selected = nil } } }
        }
    }
    private func review(_ workflow: Workflow) -> String {
        let content: [String: Any] = ["repository": store.catalog?.repository ?? "", "commit": store.catalog?.commit ?? "", "workflow": workflow.title, "notes": UserDefaults.standard.string(forKey: "workflow.notes.\(workflow.id)") ?? "", "findings": workflow.issues.map { ["node": $0.node, "detail": $0.detail] }, "notice": "Independent inspection; no workflow executed"]
        guard let data = try? JSONSerialization.data(withJSONObject: content, options: [.prettyPrinted, .sortedKeys]) else { return "{}" }
        return String(decoding: data, as: UTF8.self)
    }
}
struct NotesView: View {
    let workflowID: String
    @State private var text = ""
    var body: some View {
        VStack(alignment: .leading) { Text("Notes stay on this device").font(.caption).foregroundStyle(.secondary); TextEditor(text: $text).accessibilityLabel("Review notes") }.padding()
            .onAppear { text = UserDefaults.standard.string(forKey: "workflow.notes.\(workflowID)") ?? "" }
            .onChange(of: text) { _, value in UserDefaults.standard.set(value, forKey: "workflow.notes.\(workflowID)") }
    }
}
struct ReviewDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var text: String
    init(text: String) { self.text = text }
    init(configuration: ReadConfiguration) throws { text = String(decoding: configuration.file.regularFileContents ?? Data(), as: UTF8.self) }
    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper { FileWrapper(regularFileWithContents: Data(text.utf8)) }
}
