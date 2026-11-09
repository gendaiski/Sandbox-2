import SwiftUI
import WebKit
import UniformTypeIdentifiers

/// Resolves bundled files only, without an HTTP server.
final class BundleScheme: NSObject, WKURLSchemeHandler {
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, url.host == "local",
              let root = Bundle.main.url(forResource: "OriginalUI", withExtension: nil) else {
            task.didFailWithError(URLError(.fileDoesNotExist)); return
        }
        let path = url.path.hasSuffix("/") ? url.path + "index.html" : url.path
        let file = root.appendingPathComponent(String(path.dropFirst())).standardizedFileURL
        guard file.path.hasPrefix(root.standardizedFileURL.path + "/") else {
            task.didFailWithError(URLError(.noPermissionsToReadFile)); return
        }
        do {
            let data = try Data(contentsOf: file)
            let mime = UTType(filenameExtension: file.pathExtension)?.preferredMIMEType ?? "application/octet-stream"
            task.didReceive(URLResponse(url: url, mimeType: mime, expectedContentLength: data.count, textEncodingName: "utf-8"))
            task.didReceive(data); task.didFinish()
        } catch { task.didFailWithError(error) }
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

struct OriginalUIView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(BundleScheme(), forURLScheme: "pullboard")
        config.websiteDataStore = .nonPersistent()
        let policy = "default-src pullboard: 'unsafe-inline' data:; connect-src pullboard:; img-src pullboard: data:; form-action 'none'; frame-src 'none'"
        let script = "const meta = document.createElement('meta'); meta.httpEquiv = 'Content-Security-Policy'; meta.content = \(String(reflecting: policy)); (document.head || document.documentElement).prepend(meta);"
        config.userContentController.addUserScript(WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: false))
        let view = WKWebView(frame: .zero, configuration: config)
        view.navigationDelegate = context.coordinator
        view.load(URLRequest(url: URL(string: "pullboard://local/index.html")!))
        return view
    }
    func updateUIView(_ view: WKWebView, context: Context) {}
    final class Coordinator: NSObject, WKNavigationDelegate {
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            decisionHandler(action.request.url?.scheme == "pullboard" ? .allow : .cancel)
        }
    }
}
