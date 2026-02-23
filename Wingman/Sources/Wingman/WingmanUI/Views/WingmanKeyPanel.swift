import AppKit

// Custom NSPanel subclass to ensure it can become key
final class WingmanKeyPanel: NSPanel {
    override var canBecomeKey: Bool { true }
    override var canBecomeMain: Bool { true }
}