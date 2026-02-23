import XCTest
@testable import WingmanCore

class SettingsServiceTests: XCTestCase {
    
    var settingsService: SettingsService!
    var userDefaults: UserDefaults!
    
    override func setUp() {
        super.setUp()
        // Create a fresh UserDefaults instance for testing
        userDefaults = UserDefaults(suiteName: "com.wingman.test")
        userDefaults.removePersistentDomain(forName: "com.wingman.test")
        settingsService = SettingsService(userDefaults: userDefaults)
    }
    
    override func tearDown() {
        userDefaults.removePersistentDomain(forName: "com.wingman.test")
        settingsService = nil
        userDefaults = nil
        super.tearDown()
    }
    
    func testSettingsServiceExists() {
        XCTAssertNotNil(settingsService)
    }
    
    func testDefaultSettingsAreInitialized() {
        // Test that default settings are properly initialized
        XCTAssertFalse(settingsService.startAtLogin)
    }
    
    func testStartAtLoginSettingCanBeChanged() {
        // Test that startAtLogin setting can be changed
        settingsService.startAtLogin = true
        XCTAssertTrue(settingsService.startAtLogin)
        
        settingsService.startAtLogin = false
        XCTAssertFalse(settingsService.startAtLogin)
    }
    
    func testSettingsAreSaved() {
        // Test that settings are saved correctly
        settingsService.startAtLogin = true
        settingsService.saveSettings()
        
        // Create a new instance to verify settings were saved
        let newSettingsService = SettingsService(userDefaults: userDefaults)
        XCTAssertTrue(newSettingsService.startAtLogin)
    }
    
    func testSettingsCanBeResetToDefaults() {
        // Test that settings can be reset to defaults
        settingsService.startAtLogin = true
        XCTAssertTrue(settingsService.startAtLogin)
        
        settingsService.resetToDefaults()
        XCTAssertFalse(settingsService.startAtLogin)
    }
    
    func testSettingsAreLoadedOnInitialization() {
        // Test that settings are loaded on initialization
        // First, set a value
        settingsService.startAtLogin = true
        settingsService.saveSettings()
        
        // Create a new instance
        let newSettingsService = SettingsService(userDefaults: userDefaults)
        
        // Verify the value was loaded
        XCTAssertTrue(newSettingsService.startAtLogin)
    }
}
