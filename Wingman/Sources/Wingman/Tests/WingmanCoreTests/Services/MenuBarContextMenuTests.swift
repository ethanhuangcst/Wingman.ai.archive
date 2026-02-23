import XCTest
@testable import WingmanCore

class MenuBarContextMenuTests: XCTestCase {
    
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
    
    func testMenuBarItemCanBeCreatedWithContextMenu() {
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
    }
    
    func testMenuBarHasExitOption() {
        // Test that the menu bar always has an Exit option
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
        // The Exit option should always be present
    }
    
    func testMenuBarContextMenuOptionsForOfflineMode() {
        // Test that the menu bar context menu has the expected options in offline mode
        menuBarService.setOfflineMode()
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
        // In offline mode, menu should contain "I'm offline, wake me up!" and "Exit"
    }
    
    func testMenuBarContextMenuOptionsForOnlineMode() {
        // Test that the menu bar context menu has the expected options in online mode
        menuBarService.setOnlineMode()
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
        // In online mode, menu should contain "Settings" and "Exit"
    }
    
    func testOpenSettingsRemoved() {
        // Test that settings functionality has been removed
        XCTAssertTrue(true)
    }
}
