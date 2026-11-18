import SwiftUI

/// Native visualization of exported source coordinates; no execution engine.
struct WorkflowGraph: View {
    let workflow: Workflow
    let onSelect: (WorkflowNode) -> Void
    private var nodes: [WorkflowNode] { workflow.nodes.filter { !$0.annotation && $0.position.count >= 2 } }
    private var minX: Double { (nodes.map { $0.position[0] }.min() ?? 0) - 40 }
    private var minY: Double { (nodes.map { $0.position[1] }.min() ?? 0) - 40 }
    private func point(_ node: WorkflowNode) -> CGPoint { CGPoint(x: node.position[0] - minX + 105, y: node.position[1] - minY + 40) }
    var body: some View {
        let width = max(700, (nodes.map { $0.position[0] }.max() ?? 0) - minX + 260)
        let height = max(500, (nodes.map { $0.position[1] }.max() ?? 0) - minY + 160)
        ScrollView([.horizontal, .vertical]) {
            ZStack(alignment: .topLeading) {
                Canvas { context, _ in
                    for edge in workflow.edges {
                        if let a = nodes.first(where: { $0.name == edge.source }), let b = nodes.first(where: { $0.name == edge.target }) {
                            var path = Path(); path.move(to: point(a)); path.addLine(to: point(b)); context.stroke(path, with: .color(.secondary.opacity(0.5)), lineWidth: 2)
                        }
                    }
                }
                ForEach(nodes) { node in
                    Button { onSelect(node) } label: { VStack { Text(node.name).font(.caption.bold()).lineLimit(2); Text(node.type.components(separatedBy: ".").last ?? "").font(.caption2).foregroundStyle(.secondary) }.frame(width: 190, height: 60).padding(8).background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12)).overlay(RoundedRectangle(cornerRadius: 12).stroke(.mint.opacity(0.7))) }.buttonStyle(.plain).position(point(node))
                }
            }.frame(width: width, height: height)
        }.safeAreaInset(edge: .bottom) { Text("Scroll to explore · tap a node · source graph only").font(.caption).padding(8) }
    }
}
