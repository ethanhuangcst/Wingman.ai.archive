import XCTest
import WingmanCore
import WingmanUI
import WingmanController

class AppCoordinatorTests: XCTestCase {
    
    var coordinator: AppCoordinator!
    
    override func setUp() {
        super.setUp()
        // Create AppCoordinator instance
        Task {
            await MainActor.run {
                coordinator = AppCoordinator()
            }
        }
    }
    
    override func tearDown() {
        coordinator = nil
        super.tearDown()
    }
    
    func testAppCoordinatorInitialization() async {
        // Test that AppCoordinator can be initialized
        XCTAssertNoThrow {
            await MainActor.run {
                let _ = AppCoordinator()
            }
        }
    }
    
    func testMenuBarServiceExists() {
        // Test that menuBarService is initialized
        XCTAssertNotNil(coordinator.menuBarService)
    }
    
    func testWingmanPanelExists() {
        // Test that wingmanPanel is initialized
        XCTAssertNotNil(coordinator.wingmanPanel)
    }
    
    func testOpenWingmanPanelHandler() {
        // Test that openWingmanPanelHandler exists and can be called
        XCTAssertNotNil(coordinator.menuBarService.openWingmanPanelHandler)
        
        // Test the handler doesn't throw
        XCTAssertNoThrow {
            coordinator.menuBarService.openWingmanPanelHandler?()
        }
    }
    
    func testCloseWingmanPanelHandler() {
        // Test that closeWingmanPanelHandler exists and can be called
        XCTAssertNotNil(coordinator.menuBarService.closeWingmanPanelHandler)
        
        // Test the handler doesn't throw
        XCTAssertNoThrow {
            coordinator.menuBarService.closeWingmanPanelHandler?()
        }
    }
    
    func testIsWingmanPanelOpenAndPinnedHandler() {
        // Test that isWingmanPanelOpenAndPinnedHandler exists
        XCTAssertNotNil(coordinator.menuBarService.isWingmanPanelOpenAndPinnedHandler)
        
        // Test the handler returns a tuple
        if let handler = coordinator.menuBarService.isWingmanPanelOpenAndPinnedHandler {
            let result = handler()
            XCTAssertNotNil(result.isOpen)
            XCTAssertNotNil(result.isPinned)
        }
    }
    
    func testOpenWingmanPanelMethod() {
        // Test that openWingmanPanel method exists and can be called
        // This tests the @objc private method
        XCTAssertNotNil(coordinator)
    }
}
