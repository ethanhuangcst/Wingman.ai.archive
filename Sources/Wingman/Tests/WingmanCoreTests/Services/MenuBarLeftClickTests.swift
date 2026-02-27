import XCTest
@testable import WingmanCore

class MenuBarLeftClickTests: XCTestCase {
    
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
    
    func testLeftClickBehaviorInOfflineMode() {
        // Set app to offline mode
        menuBarService.setOfflineMode()
        
        // Create menu bar item
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
        
        // In offline mode, left-click should behave like right-click
        // This means it should show the same context menu
        // For now, we'll test that the menu is created correctly
        // The actual left-click behavior is handled by the status item
    }
    
    func testLeftClickBehaviorInOnlineMode() {
        // Set app to online mode
        menuBarService.setOnlineMode()
        
        // Create menu bar item
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
        
        // In online mode, left-click should open WingmanPanel
        // We'll test this once the WingmanPanel is implemented
    }
}
