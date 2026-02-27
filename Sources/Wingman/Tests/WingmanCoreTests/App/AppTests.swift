import XCTest
import SwiftUI
@testable import WingmanCore

class AppTests: XCTestCase {
    
    func testWingmanAppInitialization() {
        // Test that WingmanApp can be initialized
        XCTAssertNoThrow {
            let _ = WingmanApp()
        }
    }
    
    func testWingmanAppBody() {
        // Test that WingmanApp body returns an EmptyScene
        let app = WingmanApp()
        XCTAssertNotNil(app.body)
        
        // Verify the body type is EmptyScene
        XCTAssertTrue(type(of: app.body) == EmptyScene.self)
    }
    
    func testEmptySceneBody() {
        // Test that EmptyScene body returns a Scene
        let emptyScene = EmptyScene()
        XCTAssertNotNil(emptyScene.body)
    }
}
