// The Swift Programming Language
// https://docs.swift.org/swift-book

import SwiftUI
import WebKit
import WingmanCore
import WingmanUI
import WingmanController
import AppKit

// AppCoordinator is now in WingmanController/Controllers/AppCoordinator.swift

@main
struct WingmanApp: App {
    private let coordinator: AppCoordinator
    
    init() {
        // Create AppCoordinator only once during initialization
        coordinator = AppCoordinator()
    }
    
    var body: some Scene {
        // Empty scene to prevent default window creation
        // AppCoordinator handles all UI through menu bar
        EmptyScene()
    }
}

// Custom empty scene to prevent default window creation
struct EmptyScene: Scene {
    // Intentionally empty to prevent any window creation
    var body: some Scene {
        // No WindowGroup at all
    }
}

