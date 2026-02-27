import SwiftUI
import AppKit
import WebKit
import WingmanCore

// Configuration for WingmanPanel
public struct WingmanPanelConfig {
    // Panel size
    public static let panelWidth: CGFloat = 1200
    public static let panelHeight: CGFloat = 860
    
    // Positioning
    public static let screenGap: CGFloat = 20.0
    public static let menubarHeight: CGFloat = 22.0
    
    // UI elements
    public static let cornerRadius: CGFloat = 12.0
    public static let shadowRadius: CGFloat = 10.0
    public static let buttonSize: CGFloat = 14.0
    public static let headerHeight: CGFloat = 18.0
    
    // Animation
    public static let focusDelay: TimeInterval = 0.1
}

// WingmanPanelController class for managing the panel and outside click monitoring
@MainActor public class WingmanPanelController: NSObject, ObservableObject, NSWindowDelegate {
    
    @Published var isPinned: Bool = false {
        didSet { updateOutsideClickMonitoring() }
    }
    
    private(set) var panel: WingmanKeyPanel?
    private weak var webView: WKWebView?
    
    func setWebView(_ view: WKWebView) {
        webView = view
    }
    
    private var globalMonitor: Any?
    private var localMonitor: Any?
    
    @MainActor
    func focusWebView() {
        guard let panel = panel, let webView = webView else {
            logError("Cannot focus webView: panel or webView is nil")
            return
        }
        
        logInfo("Focusing WKWebView")
        logDebug("Before activation - App isActive: \(NSApp.isActive)")
        logDebug("Before activation - Panel isKeyWindow: \(panel.isKeyWindow)")
        logDebug("App activationPolicy: \(NSApp.activationPolicy())")
        
        do {
            // Temporarily change activation policy to .regular to allow keyboard input
            NSApp.setActivationPolicy(.regular)
            
            // Create main menu with Edit menu for keyboard shortcuts
            createMainMenu()
            
            // Force the app to become active
            NSApp.activate(ignoringOtherApps: true)
            
            // Ensure the panel is properly configured
            panel.makeKeyAndOrderFront(nil)
            panel.initialFirstResponder = webView
            
            // Set the webView as first responder
            panel.makeFirstResponder(webView)
            
            logDebug("After activation - App isActive: \(NSApp.isActive)")
            logDebug("After activation - Panel isKeyWindow: \(panel.isKeyWindow)")
            logDebug("WebView is first responder: \(webView == panel.firstResponder)")
            logDebug("After activation - App activationPolicy: \(NSApp.activationPolicy())")
            
            if webView == panel.firstResponder {
                logInfo("Successfully focused WKWebView")
            } else {
                logWarning("Failed to set WKWebView as first responder")
            }
        } catch {
            logError("Error focusing webView: \(error.localizedDescription)")
        }
    }
    
    // Helper logging methods
    private func logInfo(_ message: String) {
        print("[INFO] WingmanPanel: \(message)")
    }
    
    private func logDebug(_ message: String) {
        print("[DEBUG] WingmanPanel: \(message)")
    }
    
    private func logWarning(_ message: String) {
        print("[WARNING] WingmanPanel: \(message)")
    }
    
    private func logError(_ message: String) {
        print("[ERROR] WingmanPanel: \(message)")
    }
    
    private func createMainMenu() {
        // Create main menu
        let mainMenu = NSMenu()
        
        // Create Edit menu
        let editMenu = NSMenu(title: "Edit")
        
        // Add standard edit items with keyboard shortcuts
        let undoItem = NSMenuItem(title: "Undo", action: Selector("undo:"), keyEquivalent: "z")
        undoItem.target = nil
        editMenu.addItem(undoItem)
        
        let redoItem = NSMenuItem(title: "Redo", action: Selector("redo:"), keyEquivalent: "Z")
        redoItem.target = nil
        editMenu.addItem(redoItem)
        
        editMenu.addItem(NSMenuItem.separator())
        
        let cutItem = NSMenuItem(title: "Cut", action: Selector("cut:"), keyEquivalent: "x")
        cutItem.target = nil
        editMenu.addItem(cutItem)
        
        let copyItem = NSMenuItem(title: "Copy", action: Selector("copy:"), keyEquivalent: "c")
        copyItem.target = nil
        editMenu.addItem(copyItem)
        
        let pasteItem = NSMenuItem(title: "Paste", action: Selector("paste:"), keyEquivalent: "v")
        pasteItem.target = nil
        editMenu.addItem(pasteItem)
        
        let deleteItem = NSMenuItem(title: "Delete", action: Selector("delete:"), keyEquivalent: "\u{8}")
        deleteItem.target = nil
        editMenu.addItem(deleteItem)
        
        editMenu.addItem(NSMenuItem.separator())
        
        let selectAllItem = NSMenuItem(title: "Select All", action: Selector("selectAll:"), keyEquivalent: "a")
        selectAllItem.target = nil
        editMenu.addItem(selectAllItem)
        
        // Add Edit menu to main menu
        let editMenuItem = NSMenuItem(title: "Edit", action: nil, keyEquivalent: "")
        editMenuItem.submenu = editMenu
        mainMenu.addItem(editMenuItem)
        
        // Set main menu for the application
        NSApp.mainMenu = mainMenu
    }

    func closePanel() {
        logInfo("Closing WingmanPanel")
        
        do {
            // Change activation policy back to .accessory when closing the panel
            NSApp.setActivationPolicy(.accessory)
            panel?.orderOut(nil)
            stopOutsideClickMonitoring()
            logInfo("Successfully closed WingmanPanel")
        } catch {
            logError("Error closing panel: \(error.localizedDescription)")
        }
    }

    func showPanel(contentView: NSView, size: CGSize) {
        logInfo("Showing WingmanPanel with size: \(size)")
        
        do {
            if panel == nil {
                logDebug("Creating new WingmanKeyPanel")
                let p = WingmanKeyPanel(
                    contentRect: NSRect(x: 0, y: 0, width: size.width, height: size.height),
                    styleMask: [.fullSizeContentView, .borderless],
                    backing: .buffered,
                    defer: false
                )
                p.isFloatingPanel = true
                p.level = .floating
                p.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
                p.hidesOnDeactivate = false
                p.isReleasedWhenClosed = false
                p.delegate = self
                p.backgroundColor = .clear
                p.isOpaque = false
                p.hasShadow = true
                p.contentView = contentView
                
                // Configure content view for transparency
                if let contentView = p.contentView {
                    contentView.wantsLayer = true
                    contentView.layer?.backgroundColor = NSColor.clear.cgColor
                }
                
                // Enable activation and keyboard events
                p.ignoresMouseEvents = false
                p.becomesKeyOnlyIfNeeded = false
                p.isMovableByWindowBackground = true
                panel = p
                logInfo("Successfully created new WingmanKeyPanel")
            } else {
                logDebug("Updating existing WingmanKeyPanel")
                panel?.setContentSize(size)
                panel?.backgroundColor = .clear
                panel?.isOpaque = false
                panel?.hasShadow = true
                panel?.contentView = contentView
                
                // Configure content view for transparency
                if let contentView = panel?.contentView {
                    contentView.wantsLayer = true
                    contentView.layer?.backgroundColor = NSColor.clear.cgColor
                }
                
                logInfo("Successfully updated existing WingmanKeyPanel")
            }
            
            // Reset pin state to false when showing panel
            isPinned = false
            
            // Position window at top right corner with 20px gap to screen edge and system menubar
            if let panel = panel, let screen = NSScreen.main {
                // Calculate position
                let screenFrame = screen.frame
                let windowFrame = panel.frame
                
                // Position at top right corner with screen gap
                let gap: CGFloat = WingmanPanelConfig.screenGap
                
                // Calculate horizontal position (right edge with gap)
                let windowX = screenFrame.width - windowFrame.width - gap
                
                // Calculate vertical position (accounting for system menubar height)
                let menubarHeight: CGFloat = WingmanPanelConfig.menubarHeight
                let windowY = screenFrame.height - windowFrame.height - gap - menubarHeight
                
                // Create window origin point
                let windowOrigin = NSPoint(
                    x: windowX,
                    y: windowY
                )
                
                // Set window position
                panel.setFrameOrigin(windowOrigin)
                logDebug("Positioned WingmanPanel at: \(windowOrigin)")
            } else if NSScreen.main == nil {
                logWarning("No main screen found, using default position")
            }
            
            // Temporarily change activation policy to .regular to allow keyboard input
            NSApp.setActivationPolicy(.regular)
            
            // Activate the application and make the panel key
            NSApp.activate(ignoringOtherApps: true)
            panel?.makeKeyAndOrderFront(nil)
            
            // Create main menu with Edit menu for keyboard shortcuts
            createMainMenu()
            
            // Focus the webview every time the panel is shown
            if let webView = webView {
                logInfo("Focusing webView when showing panel")
                // Ensure the webview is the first responder
                panel?.makeFirstResponder(webView)
            }
            
            updateOutsideClickMonitoring()
            logInfo("Successfully showed WingmanPanel")
        } catch {
            logError("Error showing panel: \(error.localizedDescription)")
        }
    }
    
    func isVisible() -> Bool {
        return panel?.isVisible ?? false
    }
    
    public func windowWillClose(_ notification: Notification) {
        stopOutsideClickMonitoring()
    }
    
    private func updateOutsideClickMonitoring() {
        guard let panel = panel else { return }
        
        if isPinned {
            stopOutsideClickMonitoring()
            return
        }
        
        if !panel.isVisible {
            stopOutsideClickMonitoring()
            return
        }
        
        startOutsideClickMonitoringIfNeeded()
    }
    
    private func startOutsideClickMonitoringIfNeeded() {
        guard globalMonitor == nil, localMonitor == nil else { return }
        
        let handler: (NSEvent) -> Void = { [weak self] event in
            guard let self = self else { return }
            
            // Skip right-clicks to allow menu to open
            if event.type == .rightMouseDown {
                return
            }
            
            Task {
                await MainActor.run {
                    guard let panel = self.panel else { return }
                    guard panel.isVisible else { return }
                    guard self.isPinned == false else { return }
                    
                    // Check if there's an attached sheet (e.g., file picker)
                    if panel.attachedSheet != nil {
                        print("Skipping outside click - attached sheet is present")
                        return
                    }
                    
                    // Check if any modal window is active
                    if NSApp.modalWindow != nil {
                        print("Skipping outside click - modal window is active")
                        return
                    }
                    
                    let clickPoint = NSEvent.mouseLocation
                    if panel.frame.contains(clickPoint) {
                        return
                    }
                    
                    self.closePanel()
                }
            }
        }
        
        globalMonitor = NSEvent.addGlobalMonitorForEvents(
            matching: [.leftMouseDown, .rightMouseDown, .otherMouseDown],
            handler: handler
        )
        
        localMonitor = NSEvent.addLocalMonitorForEvents(
            matching: [.leftMouseDown, .rightMouseDown, .otherMouseDown],
            handler: { event in
                handler(event)
                return event
            }
        )
    }
    
    private func stopOutsideClickMonitoring() {
        if let m = globalMonitor {
            NSEvent.removeMonitor(m)
            globalMonitor = nil
        }
        if let m = localMonitor {
            NSEvent.removeMonitor(m)
            localMonitor = nil
        }
    }
}

@MainActor public class WingmanPanel {
    
    private let controller = WingmanPanelController()
    private var appMode: MenuBarService.AppMode = .offline
    
    public init() {
        // Initialize with empty implementation
    }
    
    public func setAppMode(_ mode: MenuBarService.AppMode) {
        appMode = mode
    }
    
    private var onWakeUpHandler: (() -> Void)?
    
    public func setOnWakeUpHandler(_ handler: @escaping () -> Void) {
        onWakeUpHandler = handler
    }
    
    public func createWindow() {
        // Create window content view
        let contentView = NSHostingView(rootView: WingmanPanelView(
            controller: controller,
            onClose: { [weak self] in
                self?.hide()
            },
            onWakeUp: { [weak self] in
                self?.onWakeUpHandler?()
            },
            appMode: appMode
        ))
        
        // Show panel with content view
        controller.showPanel(contentView: contentView, size: CGSize(width: WingmanPanelConfig.panelWidth, height: WingmanPanelConfig.panelHeight))
    }
    
    public func show() {
        if let panel = controller.panel {
            NSApp.activate(ignoringOtherApps: true)
            panel.makeKeyAndOrderFront(nil)
        } else {
            createWindow()
        }
    }
    
    public func hide() {
        controller.closePanel()
    }
    
    public func isVisible() -> Bool {
        return controller.isVisible()
    }
    
    public func isPinned() -> Bool {
        return controller.isPinned
    }
}



public struct WingmanPanelView: View {
    @ObservedObject var controller: WingmanPanelController
    var onClose: () -> Void
    var onWakeUp: () -> Void
    var appMode: MenuBarService.AppMode
    @Environment(\.colorScheme) var colorScheme
    
    // Load WingmanWeb URL from config
    private var wingmanWebUrl: URL {
        if let config = ConfigManager.loadConfig(), let url = URL(string: config.wingmanWeb.url) {
            return url
        }
        // Fallback to localhost if config fails
        return URL(string: "http://localhost:3000")!
    }
    
    public var body: some View {
        VStack {
            // Header with pin and close buttons
            HStack (spacing: 0){
                Spacer()
                
                // Button container
                HStack(spacing: 0) {
                    // Pin button
                    Button(action: {
                        controller.isPinned.toggle()
                    }) {
                        Image(systemName: controller.isPinned ? "pin.fill" : "pin")
                            .foregroundColor(colorScheme == .dark ? .white : .black)
                            .font(.system(size: WingmanPanelConfig.buttonSize)) // Ensure consistent icon size
                            .padding(4)
                    }
                    .buttonStyle(PlainButtonStyle())

                    // Close button (enabled by default)
                    Button(action: onClose) {
                        Image(systemName: "xmark")
                            .foregroundColor(colorScheme == .dark ? .white : .black)
                            .font(.system(size: WingmanPanelConfig.buttonSize)) // Ensure consistent icon size
                            .padding(4)
                    }
                    .buttonStyle(PlainButtonStyle())
                    // Enabled by default as per requirement
                }
                .padding(.top, 10)
                .padding(.bottom, 0)
                .padding(.horizontal, 12)
            }
            .frame(height: WingmanPanelConfig.headerHeight) // Set bar height
            
            // Main content - WebView for WingmanWeb or offline message
            if appMode == .online {
                WebViewWrapper(url: wingmanWebUrl, controller: controller)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                // Offline mode content
                VStack(spacing: 30) {
                    Text("Cloud service is not available, Wingman is now offline")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(colorScheme == .dark ? .white : .black)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 40)
                    
                    Button(action: onWakeUp) {
                        Text("Wake me up!")
                            .font(.system(size: 16, weight: .medium))
                            .foregroundColor(.black)
                            .padding(.horizontal, 30)
                            .padding(.vertical, 12)
                            .background(Color.clear)
                            .cornerRadius(8)
                    }
                    .shadow(radius: 2)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(colorScheme == .dark ? Color.black : Color.white)
                .onAppear {
                    // Ensure no button has focus when panel opens in offline mode
                    DispatchQueue.main.async {
                        if let panel = controller.panel {
                            panel.makeFirstResponder(nil)
                        }
                    }
                }
            }
        }
        .frame(width: WingmanPanelConfig.panelWidth, height: WingmanPanelConfig.panelHeight)
        .background(colorScheme == .dark ? Color.black : Color.white)
        .cornerRadius(WingmanPanelConfig.cornerRadius)
        .shadow(radius: WingmanPanelConfig.shadowRadius) // Add shadow for better visibility
    }
}


