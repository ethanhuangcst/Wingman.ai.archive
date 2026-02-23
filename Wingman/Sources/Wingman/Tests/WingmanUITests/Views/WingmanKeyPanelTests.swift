import XCTest
import AppKit
import WingmanUI

class WingmanKeyPanelTests: XCTestCase {
    
    func testWingmanKeyPanelInitialization() {
        // Test that WingmanKeyPanel can be initialized
        let contentRect = NSRect(x: 0, y: 0, width: 400, height: 300)
        let styleMask: NSWindow.StyleMask = [.titled, .closable]
        
        XCTAssertNoThrow {
            let _ = WingmanKeyPanel(
                contentRect: contentRect,
                styleMask: styleMask,
                backing: .buffered,
                defer: false
            )
        }
    }
    
    func testCanBecomeKey() {
        // Test that canBecomeKey returns true
        let contentRect = NSRect(x: 0, y: 0, width: 400, height: 300)
        let styleMask: NSWindow.StyleMask = [.titled, .closable]
        
        let panel = WingmanKeyPanel(
            contentRect: contentRect,
            styleMask: styleMask,
            backing: .buffered,
            defer: false
        )
        
        XCTAssertTrue(panel.canBecomeKey)
    }
    
    func testCanBecomeMain() {
        // Test that canBecomeMain returns true
        let contentRect = NSRect(x: 0, y: 0, width: 400, height: 300)
        let styleMask: NSWindow.StyleMask = [.titled, .closable]
        
        let panel = WingmanKeyPanel(
            contentRect: contentRect,
            styleMask: styleMask,
            backing: .buffered,
            defer: false
        )
        
        XCTAssertTrue(panel.canBecomeMain)
    }
}
