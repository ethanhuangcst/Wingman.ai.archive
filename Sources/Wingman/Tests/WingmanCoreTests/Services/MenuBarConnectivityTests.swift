import XCTest
@testable import WingmanCore

class MenuBarConnectivityTests: XCTestCase {
    
    var menuBarService: MenuBarService!
    var mockConnectivityService: MockConnectivityService!
    
    override func setUp() {
        super.setUp()
        mockConnectivityService = MockConnectivityService()
        menuBarService = MenuBarService(connectivityService: mockConnectivityService)
    }
    
    override func tearDown() {
        menuBarService = nil
        mockConnectivityService = nil
        super.tearDown()
    }
    
    func testMenuBarServiceExists() {
        XCTAssertNotNil(menuBarService)
    }
    
    func testTestConnectivityAndSetModeSetsOnlineWhenConnectivityPasses() {
        // Set mock to return pass
        mockConnectivityService.mockStatus = .pass
        
        // Test connectivity and set mode
        menuBarService.testConnectivityAndSetMode()
        
        // Verify app mode is set to online
        switch menuBarService.currentMode {
        case .online:
            XCTAssertTrue(true)
        default:
            XCTAssertFalse(true, "App mode should be online when connectivity passes")
        }
    }
    
    func testTestConnectivityAndSetModeSetsOfflineWhenConnectivityFails() {
        // Set mock to return fail
        mockConnectivityService.mockStatus = .fail
        
        // Test connectivity and set mode
        menuBarService.testConnectivityAndSetMode()
        
        // Verify app mode is set to offline
        switch menuBarService.currentMode {
        case .offline:
            XCTAssertTrue(true)
        default:
            XCTAssertFalse(true, "App mode should be offline when connectivity fails")
        }
    }
    
    func testAppLaunchProcessPerformsConnectivityTest() {
        // Set mock to return pass
        mockConnectivityService.mockStatus = .pass
        
        // Verify connectivity test is called when testing connectivity
        XCTAssertFalse(mockConnectivityService.testConnectivityCalled)
        menuBarService.testConnectivityAndSetMode()
        XCTAssertTrue(mockConnectivityService.testConnectivityCalled)
    }
    
    // Mock ConnectivityService for testing
    class MockConnectivityService: ConnectivityService {
        var mockStatus: ConnectivityStatus = .pass
        var testConnectivityCalled = false
        
        override func testConnectivity() -> ConnectivityStatus {
            testConnectivityCalled = true
            return mockStatus
        }
        
        override func testConnectivity(completion: @escaping (ConnectivityStatus) -> Void) {
            testConnectivityCalled = true
            completion(mockStatus)
        }
    }
}
