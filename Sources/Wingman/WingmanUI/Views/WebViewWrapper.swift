import SwiftUI
import WebKit
import WingmanUI

// WebView wrapper for SwiftUI
struct WebViewWrapper: NSViewRepresentable {
    let url: URL
    let controller: WingmanPanelController
    
    func makeNSView(context: Context) -> WKWebView {
        // Enable JavaScript and setup message handler for communication
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        
        // Configure web view to use actual size and enable JavaScript
        let preferences = WKWebpagePreferences()
        preferences.preferredContentMode = .desktop
        preferences.allowsContentJavaScript = true
        config.defaultWebpagePreferences = preferences
        
        // Add message handler for receiving messages from web app
        let userContentController = WKUserContentController()
        userContentController.add(context.coordinator, name: "wingmanBridge")
        config.userContentController = userContentController
        
        let webViewWithConfig = WKWebView(frame: .zero, configuration: config)
        webViewWithConfig.navigationDelegate = context.coordinator
        print("🔴 Setting uiDelegate to coordinator: \(context.coordinator)")
        webViewWithConfig.uiDelegate = context.coordinator
        
        // Set proper size and constraints
        webViewWithConfig.autoresizingMask = [.width, .height]
        webViewWithConfig.translatesAutoresizingMaskIntoConstraints = true
        
        // Load the URL
        let request = URLRequest(url: url)
        webViewWithConfig.load(request)
        
        // Pass webView reference to controller
        controller.setWebView(webViewWithConfig)
        print("WebView created and set to controller")
        
        // Focus the webView immediately after creation
        DispatchQueue.main.async {
            controller.focusWebView()
        }
        
        return webViewWithConfig
    }
    
    func updateNSView(_ nsView: WKWebView, context: Context) {
        // No update needed
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }
    
    class Coordinator: NSObject, WKNavigationDelegate, WKScriptMessageHandler, WKUIDelegate {
        let parent: WebViewWrapper
        
        init(_ parent: WebViewWrapper) {
            self.parent = parent
        }
        
        // Handle messages from web app
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            if let body = message.body as? [String: Any] {
                print("Message from web app: \(body)")
                // Handle messages from web app here
            }
        }
        
        // Handle navigation events
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
            print("WebView finished loading: \(webView.url?.absoluteString ?? "unknown")")
        }
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            print("WebView failed to load: \(error.localizedDescription)")
        }
        
        // MARK: - WKUIDelegate for file uploads
        @MainActor
        func webView(_ webView: WKWebView, runOpenPanelWith parameters: WKOpenPanelParameters, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable ([URL]?) -> Void) {
            print("🔴 WKUIDelegate runOpenPanelWith called")
            print("File upload requested, opening file picker")
            
            // Create and configure NSOpenPanel
            let openPanel = NSOpenPanel()
            openPanel.allowsMultipleSelection = true
            openPanel.canChooseDirectories = false
            openPanel.canChooseFiles = true
            
            // Present the open panel as a sheet attached to the WingmanPanel window
            if let panel = parent.controller.panel {
                print("Presenting NSOpenPanel as sheet attached to WingmanPanel")
                openPanel.beginSheetModal(for: panel) { (result) in
                    if result == .OK {
                        let urls = openPanel.urls
                        print("Files selected: \(urls)")
                        completionHandler(urls)
                    } else {
                        print("File selection cancelled")
                        completionHandler(nil)
                    }
                }
            } else {
                print("WingmanPanel not available, presenting NSOpenPanel as standalone")
                // Fallback to standalone presentation if panel is not available
                openPanel.begin { (result) in
                    if result == .OK {
                        let urls = openPanel.urls
                        print("Files selected: \(urls)")
                        completionHandler(urls)
                    } else {
                        print("File selection cancelled")
                        completionHandler(nil)
                    }
                }
            }
        }
        
        // MARK: - WKUIDelegate for JavaScript dialogs
        @MainActor
        func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable () -> Void) {
            print("🔴 JavaScript alert: \(message)")
            
            // Create and show alert
            let alert = NSAlert()
            alert.messageText = message
            alert.alertStyle = .informational
            alert.addButton(withTitle: "OK")
            
            // Always present as modal to ensure it shows up
            alert.runModal()
            completionHandler()
        }
        
        @MainActor
        func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable (Bool) -> Void) {
            print("🔴 JavaScript confirm: \(message)")
            
            // Create and show confirm dialog
            let alert = NSAlert()
            alert.messageText = message
            alert.alertStyle = .informational
            alert.addButton(withTitle: "OK")
            alert.addButton(withTitle: "Cancel")
            
            // Present as sheet attached to the webView's window if possible
            if let window = webView.window {
                print("🔴 Presenting confirm as sheet")
                alert.beginSheetModal(for: window) { response in
                    print("🔴 Sheet response: \(response)")
                    let confirmed = response == .alertFirstButtonReturn
                    print("🔴 Confirmed: \(confirmed)")
                    completionHandler(confirmed)
                }
            } else {
                print("🔴 Presenting confirm as modal")
                let response = alert.runModal()
                print("🔴 Modal response: \(response)")
                let confirmed = response == .alertFirstButtonReturn
                print("🔴 Confirmed: \(confirmed)")
                completionHandler(confirmed)
            }
        }
        
        @MainActor
        func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping @MainActor @Sendable (String?) -> Void) {
            print("🔴 JavaScript prompt: \(prompt), default: \(defaultText ?? "")")
            
            // Create and show text input dialog
            let alert = NSAlert()
            alert.messageText = prompt
            alert.alertStyle = .informational
            
            // Add text field
            let textField = NSTextField(frame: NSRect(x: 0, y: 0, width: 300, height: 24))
            textField.stringValue = defaultText ?? ""
            alert.accessoryView = textField
            
            alert.addButton(withTitle: "OK")
            alert.addButton(withTitle: "Cancel")
            
            // Always present as modal to ensure it shows up
            let response = alert.runModal()
            if response == .alertFirstButtonReturn {
                completionHandler(textField.stringValue)
            } else {
                completionHandler(nil)
            }
        }
    }
}