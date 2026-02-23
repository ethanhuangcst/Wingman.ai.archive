import Foundation

// Configuration struct for loading from JSON
public struct WingmanConfig: Codable {
    public struct WingmanWeb: Codable {
        public let url: String
    }
    public let wingmanWeb: WingmanWeb
}

// Configuration manager to load config from file
public class ConfigManager {
    public static func loadConfig() -> WingmanConfig? {
        // Try to find WingmanWebURL.json in the application bundle or current directory
        var configPath: URL?
        
        // First, check if we're in a development environment
        let devConfigPath = URL(fileURLWithPath: "WingmanWebURL.json", relativeTo: URL(fileURLWithPath: FileManager.default.currentDirectoryPath))
        if FileManager.default.fileExists(atPath: devConfigPath.path) {
            configPath = devConfigPath
        }
        
        // If not found, check the main bundle (for production)
        if configPath == nil, let bundlePath = Bundle.main.url(forResource: "WingmanWebURL", withExtension: "json") {
            configPath = bundlePath
        }
        
        // If found, load the config
        if let path = configPath {
            do {
                let data = try Data(contentsOf: path)
                let config = try JSONDecoder().decode(WingmanConfig.self, from: data)
                print("Loaded config from: \(path)")
                print("WingmanWeb URL: \(config.wingmanWeb.url)")
                return config
            } catch {
                print("Error loading config: \(error)")
            }
        } else {
            print("Config file not found")
        }
        
        // Return default config if file not found
        print("Using default config with localhost:3000")
        return WingmanConfig(
            wingmanWeb: WingmanConfig.WingmanWeb(url: "http://localhost:3000")
        )
    }
}