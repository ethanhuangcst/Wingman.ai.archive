// swift-tools-version: 6.2
// The swift-tools-version declares the minimum version of Swift required to build this package.

import PackageDescription

let package = Package(
    name: "Wingman",
    platforms: [
        .macOS(.v14)
    ],
    dependencies: [],
    targets: [
        // Targets are the basic building blocks of a package, defining a module or a test suite.
        // Targets can depend on other targets in this package and products from dependencies.
        .executableTarget(
            name: "Wingman",
            dependencies: ["WingmanCore", "WingmanUI", "WingmanController"],
            path: "Sources/Wingman/App"
        ),
        .target(
            name: "WingmanController",
            dependencies: ["WingmanCore", "WingmanUI"],
            path: "Sources/Wingman/WingmanController"
        ),
        .target(
            name: "WingmanCore",
            dependencies: [],
            path: "Sources/Wingman/WingmanCore",
            resources: [
                .process("Resources")
            ]
        ),
        .target(
            name: "WingmanUI",
            dependencies: ["WingmanCore"],
            path: "Sources/Wingman/WingmanUI"
        ),

        .testTarget(
            name: "WingmanCoreTests",
            dependencies: ["WingmanCore"],
            path: "Sources/Wingman/Tests/WingmanCoreTests"
        ),
        .testTarget(
            name: "WingmanUITests",
            dependencies: ["WingmanUI"],
            path: "Sources/Wingman/Tests/WingmanUITests"
        ),

    ]
)
