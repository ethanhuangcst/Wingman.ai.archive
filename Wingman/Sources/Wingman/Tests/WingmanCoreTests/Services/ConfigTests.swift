import XCTest
import Foundation
@testable import WingmanCore

class ConfigTests: XCTestCase {
    
    func testWingmanConfigInitialization() {
        // Test that WingmanConfig can be initialized
        let config = WingmanConfig(
            wingmanWeb: WingmanConfig.WingmanWeb(url: "http://localhost:3000")
        )
        XCTAssertNotNil(config)
        XCTAssertEqual(config.wingmanWeb.url, "http://localhost:3000")
    }
    
    func testWingmanConfigEncoding() {
        // Test that WingmanConfig can be encoded to JSON
        let config = WingmanConfig(
            wingmanWeb: WingmanConfig.WingmanWeb(url: "http://localhost:3000")
        )
        
        XCTAssertNoThrow {
            let data = try JSONEncoder().encode(config)
            XCTAssertNotNil(data)
            XCTAssertGreaterThan(data.count, 0)
        }
    }
    
    func testWingmanConfigDecoding() {
        // Test that WingmanConfig can be decoded from JSON
        let jsonString = "{\"wingmanWeb\":{\"url\":\"http://localhost:3000\"}}"
        let jsonData = jsonString.data(using: .utf8)! 
        
        XCTAssertNoThrow {
            let config = try JSONDecoder().decode(WingmanConfig.self, from: jsonData)
            XCTAssertNotNil(config)
            XCTAssertEqual(config.wingmanWeb.url, "http://localhost:3000")
        }
    }
    
    func testConfigManagerLoadConfig() {
        // Test that ConfigManager.loadConfig() returns a valid config
        let config = ConfigManager.loadConfig()
        XCTAssertNotNil(config)
        XCTAssertNotNil(config?.wingmanWeb.url)
        XCTAssertFalse(config!.wingmanWeb.url.isEmpty)
    }
    
    func testConfigManagerReturnsDefaultConfig() {
        // Test that ConfigManager returns default config when file not found
        let config = ConfigManager.loadConfig()
        XCTAssertNotNil(config)
        // Default config should have localhost:3000
        XCTAssertEqual(config?.wingmanWeb.url, "http://localhost:3000")
    }
}
