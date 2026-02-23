import Foundation
import AppKit

public class MenuBarService {
    
    // Make statusItem public for accessing button frame
    public var statusItem: NSStatusItem?    
    private let connectivityService: ConnectivityService
    // Closure to open WingmanPanel (will be set from outside to avoid circular dependency)
    public var openWingmanPanelHandler: (() -> Void)? = nil
    // Closure to close WingmanPanel (will be set from outside to avoid circular dependency)
    public var closeWingmanPanelHandler: (() -> Void)? = nil
    // Closure to check WingmanPanel state (will be set from outside to avoid circular dependency)
    public var isWingmanPanelOpenAndPinnedHandler: (() -> (isOpen: Bool, isPinned: Bool))? = nil
    // Menu property to hold the created menu
    private var menu: NSMenu? = nil
    
    // App mode enum
    public enum AppMode {
        case online
        case offline
    }
    
    // Current app mode
    public var currentMode: AppMode = .offline // Default to offline mode
    
    public init() {
        connectivityService = ConnectivityService()
    }
    
    // For testing purposes
    public init(connectivityService: ConnectivityService) {
        self.connectivityService = connectivityService
    }
    
    // Test connectivity and set app mode accordingly
    public func testConnectivityAndSetMode() {
        let status = connectivityService.testConnectivity()
        switch status {
        case .pass:
            setOnlineMode() // Default to online mode
        case .fail:
            setOfflineMode()
        }
    }
    
    // Set app mode to online
    public func setOnlineMode() {
        currentMode = .online
        updateMenu()
        setMenuBarIcon()
        printDebugInfo()
    }
    
    // Set app mode to offline
    public func setOfflineMode() {
        currentMode = .offline
        updateMenu()
        setMenuBarIcon()
        printDebugInfo()
    }
    
    // Print debug info about current status
    private func printDebugInfo() {
        // Determine connectivity test result based on current mode
        let connectivityResult: String
        switch currentMode {
        case .online:
            connectivityResult = "PASS"
        case .offline:
            connectivityResult = "FAIL"
        }
        
        // Determine app mode
        let appMode: String
        switch currentMode {
        case .online:
            appMode = "online"
        case .offline:
            appMode = "offline"
        }
        
        // Print debug info in specified format
        print("***********************     Internect Connectivity Test:     \(connectivityResult)    ***********************")
        print("***********************     App Mode:    \(appMode)     *********************** ")
    }
    
    // Update the menu based on current app mode
    private func updateMenu() {
        guard let statusItem = statusItem else { return }
        createMenu()
    }
    
    public func createMenuBarItem() throws {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.squareLength)
        
        guard let statusItem = statusItem else {
            throw MenuBarError.failedToCreateStatusItem
        }
        
        // Set up left-click behavior
        if let button = statusItem.button {
            // Set target and action for left-click
            button.target = self
            button.action = #selector(handleLeftClick)
        }
        
        setMenuBarIcon()
        createMenu()
    }
    
    @objc private func handleLeftClick(_ sender: Any?) {
        // Detect if this is a right-click
        let event = NSApp.currentEvent
        let isRightClick = event?.type == .rightMouseDown || (event?.type == .leftMouseDown && event?.modifierFlags.contains(.control) ?? false)
        
        if isRightClick {
            // For right-click, always show the menu
            if let menu = menu, let button = statusItem?.button {
                menu.popUp(positioning: nil, at: NSPoint(x: 0, y: button.bounds.height), in: button)
            }
            return
        }
        
        // For left-click, always toggle WingmanPanel regardless of mode
        if let (isOpen, isPinned) = isWingmanPanelOpenAndPinnedHandler?() {
            if !isOpen {
                // If not open, open it
                print("Opening WingmanPanel...")
                openWingmanPanelHandler?()
            } else if !isPinned {
                // If open and not pinned, close it
                print("Closing WingmanPanel...")
                closeWingmanPanelHandler?()
            } else {
                // If open and pinned, keep it open
                print("WingmanPanel is pinned, keeping it open...")
            }
        } else {
            // Fallback: if state handler not available, just open it
            print("Opening WingmanPanel...")
            openWingmanPanelHandler?()
        }
    }
    
    public func setAppToRunOnlyInMenuBar() {
        // Hide dock icon
        if NSApp != nil {
            NSApp.setActivationPolicy(.accessory)
            
            // Prevent window from appearing on launch
            NSApp.windows.forEach { $0.close() }
        }
    }
    
    public func setMenuBarIcon() {
        guard let statusItem = statusItem else { return }
        
        if let button = statusItem.button {
            // Determine which icon to use based on current mode
            let iconPath: String
            switch currentMode {
            case .online:
                iconPath = "/Users/ethanhuang/Documents/Ethan's Workspace/code/trae/Wingman.ai/Wingman/Resources/icon.png"
            case .offline:
                iconPath = "/Users/ethanhuang/Documents/Ethan's Workspace/code/trae/Wingman.ai/Wingman/Resources/icon_offline.png"
            }
            print("Attempting to load icon from path: \(iconPath)")
            
            // Check if file exists
            let fileManager = FileManager.default
            if fileManager.fileExists(atPath: iconPath) {
                print("Icon file exists at the specified path")
                
                // Try to load the image
                if let icon = NSImage(contentsOfFile: iconPath) {
                    print("Successfully loaded icon")
                    // Set the image to use system template for dark mode support
                    icon.isTemplate = true
                    button.image = icon
                    button.image?.size = NSSize(width: 24, height: 24)
                    return
                } else {
                    print("Failed to load icon from file - may be invalid image format")
                }
            } else {
                print("Icon file does not exist at the specified path")
            }
            
            // Fallback to a default icon
            print("Using fallback default icon")
            let defaultIcon = NSImage(systemSymbolName: "globe", accessibilityDescription: "Wingman")
            // System symbols automatically support dark mode
            button.image = defaultIcon
            button.image?.size = NSSize(width: 24, height: 24)
        }
    }
    
    private func createMenu() {
        let menu = NSMenu()
        
        // Add menu items based on current app mode
        switch currentMode {
        case .offline:
            // Offline mode - show I'm offline, wake me up! and Exit
            let wakeUpItem = NSMenuItem(title: "I'm offline, wake me up!", action: #selector(wakeUp), keyEquivalent: "")
            wakeUpItem.target = self
            menu.addItem(wakeUpItem)
            
            menu.addItem(NSMenuItem.separator())
            
        case .online:
            // Online mode - only show Exit (simplified requirements)
            menu.addItem(NSMenuItem.separator())
        }
        

        
        // Add Exit menu item (always appears)
        let exitItem = NSMenuItem(title: "Exit", action: #selector(quitApp), keyEquivalent: "q")
        exitItem.target = self
        menu.addItem(exitItem)
        
        // Store the menu instead of setting it directly on statusItem
        self.menu = menu
        
        // Set up right-click to show menu
        if let button = statusItem?.button {
            button.sendAction(on: [.leftMouseDown, .rightMouseDown])
        }
    }
    

    
    @objc private func wakeUp() {
        // Implementation will be added later
        print("Waking up from stand-by mode...")
    }
    
    @objc private func openAccount() {
        // Implementation will be added later
        print("Opening account/log-in...")
    }
    
    @objc private func quitApp() {
        NSApp.terminate(nil)
    }
    
    // Debug menu methods
    @objc private func testConnectivityPass() {
        print("Debug: Setting connectivity to PASS")
        setOnlineMode()
    }
    
    @objc private func testConnectivityFail() {
        print("Debug: Setting connectivity to FAIL")
        setOfflineMode()
    }
    
    @objc private func runManualConnectivityTest() {
        print("Debug: Running manual connectivity test")
        testConnectivityAndSetMode()
    }
    
    // Simulate online mode for testing
    @objc private func simulateOnline() {
        print("Debug: Simulating online mode")
        setOnlineMode()
    }
    
    // Simulate offline mode for testing
    @objc private func simulateOffline() {
        print("Debug: Simulating offline mode")
        setOfflineMode()
    }
    
    // Get menu bar icon position
    public func getMenuBarIconPosition() -> NSPoint? {
        guard let button = statusItem?.button else { return nil }
        
        // Get button frame in screen coordinates
        let buttonFrame = button.convert(button.bounds, to: nil)
        let screenFrame = button.window?.screen?.frame ?? NSScreen.main?.frame ?? .zero
        
        // Calculate position relative to screen
        let screenY = screenFrame.height - buttonFrame.origin.y - buttonFrame.height
        let screenX = buttonFrame.origin.x
        
        return NSPoint(x: screenX, y: screenY)
    }
}

enum MenuBarError: Error {
    case failedToCreateStatusItem
    case failedToSetIcon
}
