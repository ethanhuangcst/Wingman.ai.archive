# Wingman App Project Folder Structure

## Overall Structure

```
Wingman/
├── Package.swift                 # Swift Package Manager configuration
├── README.md                     # Project documentation
├── req.txt                       # Requirements and user stories
├── atdd.prompt                   # ATDD prompt for generating user stories
├── TraeGuide.prompt              # Trae CN guide prompt
├── FOLDER_STRUCTURE.md           # Folder structure documentation
├── Sources/
│   ├── Wingman/                  # Main executable target
│   │   ├── Wingman.swift         # App entry point
│   ├── WingmanCore/              # Core functionality
│   │   ├── Models/               # Data models
│   │   ├── Presenters/           # Presenters (MVP pattern)
│   │   ├── Services/             # Business logic and services
│   │   └── Utils/                # Utility functions
│   ├── WingmanUI/                # SwiftUI components
│   │   ├── Views/                # SwiftUI views
│   │   ├── Controllers/          # View controllers
│   │   ├── Components/           # Reusable UI components
│   │   └── Resources/            # UI resources (images, etc.)
│   └── WingmanWeb/               # Web-related code
│       ├── WebViews/             # Web view wrappers
│       ├── Services/             # Web services
│       └── Models/               # Web-related models
├── Tests/
│   ├── WingmanCoreTests/         # Tests for core functionality
│   │   ├── Models/               # Model tests
│   │   ├── Presenters/           # Presenter tests
│   │   └── Services/             # Service tests
│   ├── WingmanUITests/           # SwiftUI UI tests
│   │   ├── Views/                # View tests
│   │   └── Components/           # Component tests
│   └── WingmanWebTests/          # Web-related tests
│       ├── WebViews/             # Web view tests
│       └── Services/             # Web service tests
└── Resources/                    # Shared resources
    ├── Assets.xcassets           # Asset catalog
    └── Localizable.strings       # Localization files
```

## SwiftUI Folder Structure (MVP Pattern)

### Models
- **Purpose**: Data structures and business entities
- **Examples**: `AppSettings.swift`, `UserPreferences.swift`

### Presenters/Controllers
- **Purpose**: Business logic, handle user interactions, connect Models and Views
- **Examples**: `MainWindowPresenter.swift`, `WebViewPresenter.swift`

### Views
- **Purpose**: SwiftUI views for UI presentation
- **Examples**: `ContentView.swift`, `ErrorView.swift`, `LoadingView.swift`

## Web Folder Structure

### WebViews
- **Purpose**: Web view wrappers and integration
- **Examples**: `WebViewWrapper.swift`, `WebViewDelegate.swift`

### Services
- **Purpose**: Web-related services
- **Examples**: `WebAppLoader.swift`, `NetworkMonitor.swift`

### Models
- **Purpose**: Web-specific data models
- **Examples**: `WebAppConfig.swift`, `WebError.swift`

## Test Suite Structure

### Unit Tests
- **Purpose**: Test individual components and business logic
- **Location**: `Tests/WingmanCoreTests/`

### UI Tests
- **Purpose**: Test SwiftUI views and user interactions
- **Location**: `Tests/WingmanUITests/`

### Web Tests
- **Purpose**: Test web-related functionality
- **Location**: `Tests/WingmanWebTests/`

## Key Design Principles

1. **Separation of Concerns**: Clear separation between SwiftUI, Web, and Core functionality
2. **MVP Pattern**: Organized code with Models, Views, and Presenters/Controllers
3. **Testability**: Comprehensive test suite covering all components
4. **Scalability**: Modular structure that can grow with the app
5. **Maintainability**: Consistent folder structure for easy navigation

## Implementation Notes

- The project uses Swift Package Manager for dependency management
- SwiftUI code is organized in `WingmanUI` target
- Web-related code is organized in `WingmanWeb` target
- Core functionality is shared in `WingmanCore` target
- Tests are organized by target for clear coverage

This structure provides a solid foundation for the Wingman app, supporting both SwiftUI and Web-based functionality while following the MVP pattern and including a comprehensive test suite.