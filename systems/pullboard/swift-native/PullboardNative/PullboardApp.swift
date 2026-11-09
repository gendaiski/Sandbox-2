import SwiftUI

@main
struct PullboardApp: App {
    @StateObject private var board = BoardStore()
    var body: some Scene {
        WindowGroup { WorkspaceView().environmentObject(board) }
    }
}
