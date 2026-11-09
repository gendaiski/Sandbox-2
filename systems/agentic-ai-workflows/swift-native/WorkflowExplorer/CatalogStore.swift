import Foundation
import SwiftUI
struct Catalog: Decodable { let repository: String; let commit: String; let notice: String; let workflows: [Workflow] }
struct Workflow: Decodable, Identifiable {
    let id: String; let title: String; let name: String; let path: String
    let nodes: [WorkflowNode]; let edges: [WorkflowEdge]; let issues: [Finding]
}
struct WorkflowNode: Decodable, Identifiable {
    let id: String; let name: String; let type: String; let position: [Double]
    let parameters: String; let annotation: Bool; let notes: String
}
struct WorkflowEdge: Decodable, Identifiable {
    let id: String; let source: String; let target: String; let kind: String
    let output: Int; let input: Int
}
struct Finding: Decodable { let node: String; let detail: String }
@MainActor final class CatalogStore: ObservableObject {
    @Published var catalog: Catalog?
    @Published var error: String?
    init() {
        do {
            guard let url = Bundle.main.url(forResource: "catalog", withExtension: "json") else { throw CocoaError(.fileNoSuchFile) }
            catalog = try JSONDecoder().decode(Catalog.self, from: Data(contentsOf: url))
        } catch { self.error = error.localizedDescription }
    }
}
