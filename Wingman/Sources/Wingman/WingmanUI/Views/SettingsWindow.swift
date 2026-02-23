import SwiftUI
import AppKit
import WingmanCore

@MainActor public class SettingsWindow {
    
    private var window: NSWindow?
    private let settingsService: SettingsService
    
    public init() {
        self.settingsService = SettingsService.shared
    }
    
    // For testing purposes
    public init(settingsService: SettingsService) {
        self.settingsService = settingsService
    }
    
    public func createWindow() {
        // Check if window already exists, if so, just show it
        if window != nil {
            show()
            return
        }
        
        // Create window with appropriate size
        let windowRect = NSRect(x: 0, y: 0, width: 400, height: 200)
        
        // Create window with style mask that includes title bar
        let styleMask: NSWindow.StyleMask = [.titled, .closable, .resizable]
        
        // Create window
        window = NSWindow(
            contentRect: windowRect,
            styleMask: styleMask,
            backing: .buffered,
            defer: false
        )
        
        // Configure window properties
        if let window = window {
            // Set window title
            window.title = "Settings"
            
            // Disable toolbar
            window.toolbar = nil
            
            // Set window to appear on all desktops
            window.collectionBehavior = [.canJoinAllSpaces]
            
            // Set window to be in front of all other windows
            window.level = .floating
            
            // Set window content view
            let contentView = NSHostingView(rootView: SettingsView(
                settingsService: settingsService,
                onSave: {
                    self.hide()
                },
                onCancel: {
                    self.hide()
                }
            ))
            window.contentView = contentView
            
            // Position window under menu bar icon
            positionWindowUnderMenuBarIcon()
            
            // Ensure window is ordered front and activated
            show()
        }
    }
    
    // Create window with menu bar icon position
    public func createWindow(menuBarIconPosition: NSPoint) {
        createWindow()
        // Use the same simplified positioning regardless of menu bar icon position
        if let window = window, let screen = NSScreen.main {
            // Calculate position: right edge of window should be 1220px to the right edge of the screen
            // In macOS, origin is at bottom-left, y increases upwards
            let windowX = screen.frame.width - 1220 - window.frame.width
            let menuBarHeight: CGFloat = 22 // Typical menu bar height
            // Position top of window 20px below bottom of menu bar
            let windowY = screen.frame.height - menuBarHeight - 20 - window.frame.height
            
            let windowOrigin = NSPoint(x: windowX, y: windowY)
            window.setFrameOrigin(windowOrigin)
        }
    }
    
    // Position window at specified location
    private func positionWindowUnderMenuBarIcon() {
        guard let window = window else { return }
        
        // Get screen frame
        guard let screen = NSScreen.main else {
            // Fallback to center if no screen available
            centerWindowOnScreen()
            return
        }
        
        let screenFrame = screen.frame
        let windowFrame = window.frame
        
        // Calculate position: right edge of window should be 1220px to the right edge of the screen
        // In macOS, origin is at bottom-left, y increases upwards
        let windowX = screenFrame.width - 1220 - windowFrame.width
        let menuBarHeight: CGFloat = 22 // Typical menu bar height
        // Position top of window 20px below bottom of menu bar
        let windowY = screenFrame.height - menuBarHeight - 20 - windowFrame.height
        
        let windowOrigin = NSPoint(x: windowX, y: windowY)
        window.setFrameOrigin(windowOrigin)
    }
    
    // Fallback: center window on screen
    private func centerWindowOnScreen() {
        guard let window = window else { return }
        
        if let screen = NSScreen.main {
            let screenFrame = screen.frame
            let windowFrame = window.frame
            
            let windowOrigin = NSPoint(
                x: (screenFrame.width - windowFrame.width) / 2,
                y: (screenFrame.height - windowFrame.height) / 2
            )
            
            window.setFrameOrigin(windowOrigin)
        }
    }
    
    // For testing purposes - get window frame
    public func getWindowFrame() -> NSRect? {
        return window?.frame
    }
    
    public func show() {
        if let window = window {
            // Activate the application
            NSApp.activate(ignoringOtherApps: true)
            
            // Order the window front and make it key
            window.makeKeyAndOrderFront(nil)
        }
    }
    
    public func hide() {
        window?.orderOut(nil)
    }
    
    public func isVisible() -> Bool {
        return window?.isVisible ?? false
    }
}

public struct SettingsView: View {
    private let settingsService: SettingsService
    private var onSave: () -> Void
    private var onCancel: () -> Void
    
    @State private var startAtLogin: Bool
    
    public init(
        settingsService: SettingsService,
        onSave: @escaping () -> Void,
        onCancel: @escaping () -> Void
    ) {
        self.settingsService = settingsService
        self.onSave = onSave
        self.onCancel = onCancel
        self._startAtLogin = State(initialValue: settingsService.startAtLogin)
    }
    
    public var body: some View {
        VStack(spacing: 20) {
            // Header
            Text("Wingman Settings")
                .font(.title)
                .fontWeight(.bold)
                .padding(.top, 20)
            
            // Settings content
            VStack(alignment: .leading, spacing: 15) {
                // Start at login checkbox
                HStack {
                    Toggle("Start at login", isOn: $startAtLogin)
                        .toggleStyle(SwitchToggleStyle())
                    Spacer()
                }
            }
            .padding(.horizontal, 30)
            
            // Button row
            HStack(spacing: 10) {
                Spacer()
                
                // Cancel button
                Button(action: onCancel) {
                    Text("Cancel")
                        .frame(width: 80, height: 28)
                        .foregroundColor(.black)
                        .font(.system(size: 14))
                        .padding(8)
                }
                .buttonStyle(PlainButtonStyle())
                
                // Save button
                Button(action: {
                    settingsService.startAtLogin = startAtLogin
                    settingsService.saveSettings()
                    onSave()
                }) {
                    Text("Save")
                        .frame(width: 80, height: 28)
                        .foregroundColor(.black)
                        .font(.system(size: 14))
                        .padding(8)
                }
                .buttonStyle(PlainButtonStyle())
            }
            .padding(.horizontal, 30)
            .padding(.bottom, 20)
        }
        .frame(width: 400, height: 200)
    }
}

// Custom button style to match macOS design
struct NSButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .background(
                RoundedRectangle(cornerRadius: 4)
                    .background(configuration.isPressed ? Color.gray.opacity(0.2) : Color.clear)
            )
    }
}

// Extension to make Save button default
extension View {
    func defaultFocus() -> some View {
        self
    }
}
