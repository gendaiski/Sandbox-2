import Foundation
import SwiftUI

struct LocalItem: Identifiable, Codable {
    var id: UUID = UUID()
    var title: String
    var lane: String
    var status: String
    var criterion: String
    var note: String
}

enum Screen: String, CaseIterable, Identifiable {
    case home = "Home", items = "Items", shouts = "Shouts", spec = "Spec"
    case doctrine = "Doctrine", activity = "Activity", roadmap = "Roadmap", settings = "Settings"
    var id: String { rawValue }
    var symbol: String {
        switch self {
        case .home: return "house"
        case .items: return "rectangle.3.group"
        case .shouts: return "bubble.left.and.bubble.right"
        case .spec: return "checklist"
        case .doctrine: return "book.closed"
        case .activity: return "clock.arrow.circlepath"
        case .roadmap: return "map"
        case .settings: return "gearshape"
        }
    }
}

@MainActor final class BoardStore: ObservableObject {
    @Published var source = "tour" { didSet { load() } }
    @Published private(set) var state: [String: Any] = [:]
    @Published var localItems: [LocalItem] = [] { didSet { persist() } }
    @Published var error: String?
    private let storageKey = "pullboard.native.local-items.v1"

    init() {
        if let data = UserDefaults.standard.data(forKey: storageKey) {
            do { localItems = try JSONDecoder().decode([LocalItem].self, from: data) }
            catch { self.error = "Saved local items could not be decoded. They have not been overwritten." }
        }
        load()
    }
    func load() {
        guard let url = Bundle.main.url(forResource: source, withExtension: "json") else {
            error = "Bundled snapshot is missing."; state = [:]; return
        }
        do {
            let root = try JSONSerialization.jsonObject(with: Data(contentsOf: url)) as? [String: Any]
            guard let next = root?["state"] as? [String: Any] else {
                throw CocoaError(.fileReadCorruptFile)
            }
            state = next
        } catch { self.error = "Snapshot failed to load: \(error.localizedDescription)"; state = [:] }
    }
    func rows(_ key: String) -> [[String: Any]] { state[key] as? [[String: Any]] ?? [] }
    func text(_ row: [String: Any], _ key: String) -> String {
        guard let value = row[key], !(value is NSNull) else { return "" }
        if let string = value as? String { return string }
        return String(describing: value)
    }
    func persist() {
        do { UserDefaults.standard.set(try JSONEncoder().encode(localItems), forKey: storageKey) }
        catch { self.error = "Local changes could not be saved." }
    }
    func save(_ item: LocalItem) {
        if let index = localItems.firstIndex(where: { $0.id == item.id }) { localItems[index] = item }
        else { localItems.append(item) }
    }
}
