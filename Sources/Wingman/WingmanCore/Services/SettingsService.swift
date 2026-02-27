import Foundation

public class SettingsService {
    
    // Singleton instance
    @MainActor public static let shared = SettingsService()
    
    // Settings keys
    private enum SettingsKey {
        static let startAtLogin = "startAtLogin"
    }
    
    // Default settings values
    private let defaultSettings: [String: Any] = {
        return [
            SettingsKey.startAtLogin: false
        ]
    }()
    
    // UserDefaults instance
    private let userDefaults: UserDefaults
    
    // Initializer
    public init() {
        self.userDefaults = UserDefaults.standard
        initializeDefaults()
    }
    
    // For testing purposes
    public init(userDefaults: UserDefaults) {
        self.userDefaults = userDefaults
        initializeDefaults()
    }
    
    // Initialize default settings if they don't exist
    private func initializeDefaults() {
        for (key, value) in defaultSettings {
            if userDefaults.object(forKey: key) == nil {
                userDefaults.set(value, forKey: key)
            }
        }
    }
    
    // MARK: - Start at Login setting
    public var startAtLogin: Bool {
        get {
            return userDefaults.bool(forKey: SettingsKey.startAtLogin)
        }
        set {
            userDefaults.set(newValue, forKey: SettingsKey.startAtLogin)
        }
    }
    
    // MARK: - Save settings
    public func saveSettings() {
        userDefaults.synchronize()
    }
    
    // MARK: - Reset to defaults
    public func resetToDefaults() {
        for (key, value) in defaultSettings {
            userDefaults.set(value, forKey: key)
        }
        saveSettings()
    }
    
    // MARK: - Load settings
    public func loadSettings() {
        // Settings are automatically loaded from UserDefaults
    }
}
