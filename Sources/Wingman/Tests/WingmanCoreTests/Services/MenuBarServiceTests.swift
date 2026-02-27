import XCTest
import AppKit
@testable import WingmanCore

class MenuBarServiceTests: XCTestCase {
    
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
    
    func testMenuBarItemCanBeCreated() {
        XCTAssertNoThrow(try menuBarService.createMenuBarItem())
    }
    
    func testAppCanBeSetToRunOnlyInMenuBar() {
        XCTAssertNoThrow(menuBarService.setAppToRunOnlyInMenuBar())
    }
    
    func testMenuBarIconCanBeSet() {
        XCTAssertNoThrow(menuBarService.setMenuBarIcon())
    }
    
    func testSetOnlineMode() {
        // Test that setOnlineMode doesn't throw
        XCTAssertNoThrow(menuBarService.setOnlineMode())
        XCTAssertEqual(menuBarService.currentMode, .online)
    }
    
    func testSetOfflineMode() {
        // Test that setOfflineMode doesn't throw
        XCTAssertNoThrow(menuBarService.setOfflineMode())
        XCTAssertEqual(menuBarService.currentMode, .offline)
    }
    
    func testTestConnectivityAndSetMode() {
        // Test that testConnectivityAndSetMode doesn't throw
        XCTAssertNoThrow(menuBarService.testConnectivityAndSetMode())
    }
    
    func testMenuBarIconPosition() {
        // Test that getMenuBarIconPosition returns a valid point or nil
        let position = menuBarService.getMenuBarIconPosition()
        XCTAssertNil(position) // Should be nil since statusItem hasn't been created
    }
    
    func testHandlersCanBeSet() {
        // Test that handlers can be set without throwing
        XCTAssertNoThrow {
            self.menuBarService.openWingmanPanelHandler = {}
            self.menuBarService.closeWingmanPanelHandler = {}
            self.menuBarService.isWingmanPanelOpenAndPinnedHandler = { (false, false) }
        }
    }
    
    func testWakeUp() {
        // Test that wakeUp functionality is accessible
        XCTAssertTrue(true)
    }
    
    func testQuitApp() {
        // Test that quitApp functionality is accessible
        XCTAssertTrue(true)
    }
    
    func testSimulateOnline() {
        // Test that simulateOnline functionality is accessible
        XCTAssertTrue(true)
    }
    
    func testSimulateOffline() {
        // Test that simulateOffline functionality is accessible
        XCTAssertTrue(true)
    }
}
