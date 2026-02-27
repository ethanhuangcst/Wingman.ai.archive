import XCTest
@testable import WingmanCore

class MenuBarAppModeTests: XCTestCase {
    
    var menuBarService: MenuBarService!    
    
    override func setUp() {
        super.setUp()
        menuBarService = MenuBarService()
    }
    
    override func tearDown() {
        menuBarService = nil
        super.tearDown()
    }
    
    func testMenuBarServiceExists() {
        XCTAssertNotNil(menuBarService)
    }
    
    func testInitialAppModeIsOffline() {
        switch menuBarService.currentMode {
        case .offline:
            XCTAssertTrue(true)
        default:
            XCTAssertFalse(true, "Initial app mode should be offline")
        }
    }
    
    func testSetOnlineMode() {
        menuBarService.setOnlineMode()
        
        switch menuBarService.currentMode {
        case .online:
            XCTAssertTrue(true)
        default:
            XCTAssertFalse(true, "App mode should be online")
        }
    }
    
    func testSetOfflineMode() {
        // First set to online mode
        menuBarService.setOnlineMode()
        
        // Then set to offline mode
        menuBarService.setOfflineMode()
        
        switch menuBarService.currentMode {
        case .offline:
            XCTAssertTrue(true)
        default:
            XCTAssertFalse(true, "App mode should be offline")
        }
    }
    
    func testMenuBarItemCanBeCreatedInOfflineMode() {
        menuBarService.setOfflineMode()
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
    }
    
    func testMenuBarItemCanBeCreatedInOnlineMode() {
        menuBarService.setOnlineMode()
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
    }
    
    func testAppModeChangesUpdateMenu() {
        // Create menu bar item first
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
        
        // Change app mode to online
        XCTAssertNoThrow(menuBarService.setOnlineMode())
        
        // Change app mode to offline
        XCTAssertNoThrow(menuBarService.setOfflineMode())
    }
    
    func testSetOfflineModeCallsCloseWingmanPanelHandler() {
        // Test that setOfflineMode() calls closeWingmanPanelHandler
        var closeWingmanPanelCalled = false
        
        menuBarService.closeWingmanPanelHandler = {
            closeWingmanPanelCalled = true
        }
        
        // Call setOfflineMode
        menuBarService.setOfflineMode()
        
        // Verify closeWingmanPanelHandler was called
        XCTAssertTrue(closeWingmanPanelCalled)
    }
}
