import XCTest
@testable import WingmanCore

@MainActor
class ConnectivityServiceTests: XCTestCase {
    
    var connectivityService: ConnectivityService!
    
    override func setUp() {
        super.setUp()
        connectivityService = ConnectivityService()
    }
    
    override func tearDown() {
        connectivityService = nil
        super.tearDown()
    }
    
    func testConnectivityServiceExists() {
        XCTAssertNotNil(connectivityService)
    }
    
    func testConnectivityStatusEnumExists() {
        // Test that we can create ConnectivityStatus values
        let passStatus: ConnectivityService.ConnectivityStatus = .pass
        let failStatus: ConnectivityService.ConnectivityStatus = .fail
        XCTAssertNotNil(passStatus)
        XCTAssertNotNil(failStatus)
    }
    
    func testTestConnectivityReturnsPass() {
        let status = connectivityService.testConnectivity()
        XCTAssertEqual(status, .pass)
    }
    
    func testTestConnectivityWithCompletion() {
        let expectation = self.expectation(description: "Connectivity test completion")
        
        connectivityService.testConnectivity { status in
            XCTAssertNotNil(status)
            expectation.fulfill()
        }
        
        waitForExpectations(timeout: 5, handler: nil)
    }
}
