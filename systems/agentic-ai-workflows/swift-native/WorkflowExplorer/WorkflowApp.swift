import SwiftUI
@main struct WorkflowExplorerApp: App {
    @StateObject private var store = CatalogStore()
    var body: some Scene { WindowGroup { WorkspaceView().environmentObject(store) } }
}
