import SwiftUI
import WebKit
import WingmanCore
import WingmanUI
import AppKit

@MainActor public class AppCoordinator {
    public let menuBarService: MenuBarService
    public let wingmanPanel: WingmanPanel
    
    public init() {
        menuBarService = MenuBarService()
        wingmanPanel = WingmanPanel()
        
        // Configure app to run only in menu bar
        menuBarService.setAppToRunOnlyInMenuBar()
        
        // Create menu bar item
        do {
            try menuBarService.createMenuBarItem()
        } catch {
            print("Error creating menu bar item: \(error)")
        }
        

        
        // Set up WingmanPanel handler
        menuBarService.openWingmanPanelHandler = {
            Task {
                await MainActor.run {
                    self.wingmanPanel.createWindow()
                    self.wingmanPanel.show()
                }
            }
        }
        
        // Set up close WingmanPanel handler
        menuBarService.closeWingmanPanelHandler = {
            Task {
                await MainActor.run {
                    self.wingmanPanel.hide()
                }
            }
        }
        
        // Set up WingmanPanel state handler
        menuBarService.isWingmanPanelOpenAndPinnedHandler = {
            return (
                isOpen: self.wingmanPanel.isVisible(),
                isPinned: self.wingmanPanel.isPinned()
            )
        }
        

        
        // Test connectivity and set app mode
        menuBarService.testConnectivityAndSetMode()
        
        // Set initial app mode on WingmanPanel
        wingmanPanel.setAppMode(menuBarService.currentMode)
        
        // Set wake up handler for WingmanPanel
        wingmanPanel.setOnWakeUpHandler {
            Task {
                await MainActor.run {
                    // Re-test connectivity
                    self.menuBarService.testConnectivityAndSetMode()
                    
                    // Update app mode on WingmanPanel
                    self.wingmanPanel.setAppMode(self.menuBarService.currentMode)
                    
                    // Recreate window to reflect new mode
                    self.wingmanPanel.createWindow()
                    self.wingmanPanel.show()
                }
            }
        }
    }
    
    // Open WingmanPanel on main thread
    @objc private func openWingmanPanel() {
        wingmanPanel.createWindow()
        wingmanPanel.show()
    }
}