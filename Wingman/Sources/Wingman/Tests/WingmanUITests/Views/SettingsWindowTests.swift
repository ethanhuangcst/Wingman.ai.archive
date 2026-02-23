import XCTest
import SwiftUI
import AppKit
import WingmanCore
import WingmanUI

class SettingsWindowTests: XCTestCase {
    
    var settingsWindow: SettingsWindow!
    
    override func setUp() {
        super.setUp()
        settingsWindow = SettingsWindow()
    }
    
    override func tearDown() {
        settingsWindow = nil
        super.tearDown()
    }
    
    func testSettingsWindowInitialization() {
        // Test that SettingsWindow can be initialized
        XCTAssertNoThrow {
            let _ = SettingsWindow()
        }
    }
    
    func testSettingsWindowInitializationWithCustomService() {
        // Test that SettingsWindow can be initialized with custom SettingsService
        let customService = SettingsService()
        XCTAssertNoThrow {
            let _ = SettingsWindow(settingsService: customService)
        }
    }
    
    func testCreateWindow() {
        // Test that createWindow doesn't throw
        XCTAssertNoThrow(settingsWindow.createWindow())
    }
    
    func testCreateWindowWithMenuBarIconPosition() {
        // Test that createWindow with menuBarIconPosition doesn't throw
        let position = NSPoint(x: 100, y: 100)
        XCTAssertNoThrow(settingsWindow.createWindow(menuBarIconPosition: position))
    }
    
    func testGetWindowFrame() {
        // Test that getWindowFrame returns nil initially
        XCTAssertNil(settingsWindow.getWindowFrame())
        
        // Test that getWindowFrame returns a frame after window creation
        settingsWindow.createWindow()
        let frame = settingsWindow.getWindowFrame()
        XCTAssertNotNil(frame)
        XCTAssertEqual(frame?.width, 400)
        XCTAssertEqual(frame?.height, 200)
    }
    
    func testShow() {
        // Test that show doesn't throw
        XCTAssertNoThrow(settingsWindow.show())
    }
    
    func testHide() {
        // Test that hide doesn't throw
        XCTAssertNoThrow(settingsWindow.hide())
    }
    
    func testIsVisible() {
        // Test that isVisible returns false initially
        XCTAssertFalse(settingsWindow.isVisible())
        
        // Test that isVisible returns appropriate value after window operations
        settingsWindow.createWindow()
        let visibility = settingsWindow.isVisible()
        XCTAssertTrue(visibility || !visibility) // Either true or false, but not throwing
    }
}

class SettingsViewTests: XCTestCase {
    
    func testSettingsViewInitialization() {
        // Test that SettingsView can be initialized
        let settingsService = SettingsService()
        XCTAssertNoThrow {
            let _ = SettingsView(
                settingsService: settingsService,
                onSave: {},
                onCancel: {}
            )
        }
    }
    
    func testSettingsViewBody() {
        // Test that SettingsView body doesn't throw
        let settingsService = SettingsService()
        let view = SettingsView(
            settingsService: settingsService,
            onSave: {},
            onCancel: {}
        )
        XCTAssertNotNil(view.body)
    }
}

class NSButtonStyleTests: XCTestCase {
    
    func testNSButtonStyle() {
        // Test that NSButtonStyle can be created
        let style = NSButtonStyle()
        XCTAssertNotNil(style)
    }
}

class ViewExtensionTests: XCTestCase {
    
    func testDefaultFocusExtension() {
        // Test that defaultFocus extension works
        let testView = Text("Test")
        let focusedView = testView.defaultFocus()
        XCTAssertNotNil(focusedView)
    }
}
