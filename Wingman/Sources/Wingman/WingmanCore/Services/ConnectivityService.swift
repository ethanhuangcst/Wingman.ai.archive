import Foundation

public class ConnectivityService {
    
    public enum ConnectivityStatus {
        case pass
        case fail
    }
    
    public init() {
        // Initialize with empty implementation
    }
    
    private func getWingmanWebUrl() -> URL {
        // Load config to get WingmanWeb URL
        if let config = ConfigManager.loadConfig(), let url = URL(string: config.wingmanWeb.url) {
            print("Using WingmanWeb URL for connectivity test: \(url)")
            return url
        }
        
        // Fallback to localhost if config fails
        let fallbackUrl = URL(string: "http://localhost:3000")!
        print("Using fallback URL for connectivity test: \(fallbackUrl)")
        return fallbackUrl
    }
    
    public func testConnectivity(completion: @escaping (ConnectivityStatus) -> Void) {
        // Get WingmanWeb URL from config
        let wingmanWebUrl = getWingmanWebUrl()
        let task = URLSession.shared.dataTask(with: wingmanWebUrl) { (data, response, error) in
            if let error = error {
                print("Connectivity test failed: \(error.localizedDescription)")
                completion(.fail)
                return
            }
            
            if let response = response as? HTTPURLResponse, response.statusCode == 200 {
                print("Connectivity test passed")
                completion(.pass)
            } else {
                print("Connectivity test failed: invalid response")
                completion(.fail)
            }
        }
        task.resume()
    }
    
    public func testConnectivity() -> ConnectivityStatus {
        // Synchronous version for testing and initial app launch
        let semaphore = DispatchSemaphore(value: 0)
        var status: ConnectivityStatus = .fail
        
        testConnectivity { result in
            status = result
            semaphore.signal()
        }
        
        semaphore.wait(timeout: .now() + 5)
        return status
    }
}
