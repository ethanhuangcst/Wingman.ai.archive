import XCTest
@testable import WingmanCore

class MenuBarDarkModeTests: XCTestCase {
    
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
    
    func testMenuBarIconSupportsDarkMode() {
        // Test that the menu bar service can set up dark mode support
        XCTAssertNoThrow(menuBarService.setMenuBarIcon())
    }
    
    func testMenuBarItemCanBeCreatedWithDarkModeSupport() {
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
    }
}
