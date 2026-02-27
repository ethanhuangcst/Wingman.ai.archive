// AI Connection Service - Centralized service for AI provider connections

import { getAllProviders, getDefaultProvider as getDefaultProviderFromDb, getProviderById } from '../../../lib/db';

// Default timeout for AI connection tests
export const DEFAULT_TIMEOUT = 420000; // 7 minutes

export interface AIConnectionResult {
  success: boolean;
  response?: string;
  error?: string;
  usedUrl?: string;
  model?: string;
  attempts?: number;
}

export interface TestConnectionResult {
  result: 'PASS' | 'FAIL';
  response?: string;
  error?: string;
  usedUrl?: string;
  attempts?: number;
}

/**
 * Centralized AI connection service with improved reliability
 */
export class AIConnectionService {
  private static instance: AIConnectionService;
  private readonly MAX_RETRIES = 0;
  private readonly RETRY_DELAY = 100;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of AIConnectionService
   */
  public static getInstance(): AIConnectionService {
    if (!AIConnectionService.instance) {
      AIConnectionService.instance = new AIConnectionService();
    }
    return AIConnectionService.instance;
  }

  /**
   * Establish connection to AI provider with failover and retry logic
   */
  public async connectToAI(
    provider: string,
    apiKey: string,
    messages: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<AIConnectionResult> {
    try {
      // Validate provider
      const providerConfig = await this.getProviderConfig(provider);
      if (!providerConfig) {
        return {
          success: false,
          error: `Provider ${provider} is not configured`
        };
      }

      console.log(`Starting connection to ${provider} with ${providerConfig.base_urls.length} endpoints`);

      // Filter and prioritize endpoints based on accessibility
      const accessibleEndpoints = await this.getAccessibleEndpoints(providerConfig.base_urls);
      const allEndpoints = accessibleEndpoints.length > 0 ? accessibleEndpoints : providerConfig.base_urls;

      console.log(`Using endpoints in order: ${allEndpoints.map(url => url).join(', ')}`);

      // Try each base URL in order
      let totalAttempts = 0;
      let lastError: string = '';
      
      for (const baseUrl of allEndpoints) {
        totalAttempts++;
        
        try {
          console.log(`Attempt ${totalAttempts} for ${provider} using URL: ${baseUrl}`);
          console.log(`Connection details:`);
          console.log(`  Provider: ${provider}`);
          console.log(`  Model: ${providerConfig.default_model}`);
          console.log(`  Base URL: ${baseUrl}`);
          console.log(`  API Key: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
          console.log(`  Messages count: ${messages.length}`);
          console.log(`  First message: ${JSON.stringify(messages[0]).substring(0, 100)}${JSON.stringify(messages[0]).length > 100 ? '...' : ''}`);
          
          // Make API call
          const response = await this.makeApiCall(
            baseUrl,
            apiKey,
            providerConfig,
            messages
          );
          
          if (response.success) {
            console.log(`Successfully connected to ${provider} using URL: ${response.endpointUrl || baseUrl}`);
            return {
              ...response,
              usedUrl: response.endpointUrl || baseUrl,
              attempts: totalAttempts
            };
          }
          
          console.log(`Failed to connect to ${provider} using URL: ${baseUrl}`);
          console.log(`Error details: ${response.error}`);
          lastError = response.error || '';
          
        } catch (error) {
          console.error(`Error connecting to ${provider} using URL ${baseUrl}:`, error);
          lastError = (error as Error).message;
        }
      }

      // All URLs failed
      console.error(`All ${totalAttempts} attempts to connect to ${provider} failed`);
      return {
        success: false,
        error: `Failed to connect to ${provider} using all configured URLs. Last error: ${lastError}. Please check your network connectivity or API key.`,
        attempts: totalAttempts
      };
    } catch (error) {
      console.error('Unexpected error in connectToAI:', error);
      return {
        success: false,
        error: `Unexpected error: ${(error as Error).message}`
      };
    }
  }

  /**
   * Test endpoints for accessibility and return them in order of responsiveness
   */
  private async getAccessibleEndpoints(endpoints: string[]): Promise<string[]> {
    const endpointTests = endpoints.map(async (endpoint) => {
      try {
        const startTime = Date.now();
        // Test basic connectivity
        const response = await fetch(endpoint, {
          method: 'HEAD',
          timeout: 5000
        });
        const endTime = Date.now();
        return {
          endpoint,
          accessible: true,
          latency: endTime - startTime,
          status: response.status
        };
      } catch (error) {
        console.warn(`Endpoint ${endpoint} is not accessible:`, error.message);
        return {
          endpoint,
          accessible: false,
          latency: Infinity,
          status: 0
        };
      }
    });

    const results = await Promise.all(endpointTests);
    return results
      .filter(result => result.accessible)
      .sort((a, b) => a.latency - b.latency)
      .map(result => result.endpoint);
  }

  /**
   * Make API call to AI provider with timeout and detailed error handling
   */
  private async makeApiCall(
    baseUrl: string,
    apiKey: string,
    providerConfig: any,
    messages: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<AIConnectionResult & {endpointUrl?: string}> {
    try {
      // Prepare request data based on provider
      const requestData = this.prepareRequestData(providerConfig, messages);
      
      // Prepare headers
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        'User-Agent': 'Wingman AI Agent'
      };
      
      // Add auth header if required
      if (providerConfig.requires_auth && providerConfig.auth_header) {
        headers[providerConfig.auth_header] = `Bearer ${apiKey}`;
      }
      
      // For OpenAI-compatible APIs, append /chat/completions to the base URL if not already present
      let endpointUrl = baseUrl;
      // Remove trailing slash if present
      endpointUrl = endpointUrl.replace(/\/$/, '');
      // Check if /chat/completions is already in the URL
      if (!endpointUrl.includes('/chat/completions')) {
        endpointUrl += '/chat/completions';
      }
      
      console.log(`Making API call to ${endpointUrl} with provider ${providerConfig.name}`);
      console.log(`Headers: ${JSON.stringify(headers)}`);
      console.log(`Request body length: ${JSON.stringify(requestData).length} characters`);
      
      // Use shorter timeout for better responsiveness
      const timeout = 30000; // 30 seconds instead of 7 minutes
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const startTime = Date.now();
        
        // Enhanced fetch with better error handling
        const response = await fetch(endpointUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(requestData),
          signal: controller.signal,
          credentials: 'omit',
          redirect: 'follow',
          referrerPolicy: 'no-referrer'
        });
        
        const endTime = Date.now();
        clearTimeout(timeoutId);
        
        console.log(`API response status: ${response.status} (${endTime - startTime}ms)`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('API error data:', errorData);
          return {
            success: false,
            error: `API request failed: ${response.status} ${response.statusText}, ${JSON.stringify(errorData)}`,
            endpointUrl
          };
        }
        
        const data = await response.json();
        console.log(`API response received (${endTime - startTime}ms): ${JSON.stringify(data).substring(0, 500)}${JSON.stringify(data).length > 500 ? '...' : ''}`);
        
        // Process response based on provider
        const result = this.processResponse(providerConfig, data);
        return {
          ...result,
          endpointUrl
        };
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error in fetch request:', error);
        console.error('Error cause:', (error as any).cause);
        
        if (error instanceof DOMException && error.name === 'AbortError') {
          return {
            success: false,
            error: `Request timed out after ${timeout}ms`
          };
        }
        
        // Handle different error types
        if ((error as any).code === 'UND_ERR_CONNECT_TIMEOUT' || ((error as any).cause && (error as any).cause.code === 'UND_ERR_CONNECT_TIMEOUT')) {
          return {
            success: false,
            error: `Connection timeout: Unable to connect to ${endpointUrl} within ${timeout}ms`
          };
        }
        
        if ((error as any).code === 'ECONNREFUSED' || ((error as any).cause && (error as any).cause.code === 'ECONNREFUSED')) {
          return {
            success: false,
            error: `Connection refused: ${endpointUrl} is not accepting connections`
          };
        }
        
        // Handle fetch failed errors
        if ((error as Error).message === 'fetch failed' && (error as any).cause) {
          return {
            success: false,
            error: `API call failed: ${(error as any).cause.code || (error as any).cause.message || 'Network error'}`
          };
        }
        
        return {
          success: false,
          error: `API call failed: ${(error as Error).message}`
        };
      }
    } catch (error) {
      console.error('Error in makeApiCall:', error);
      return {
        success: false,
        error: `API call failed: ${(error as Error).message}`
      };
    }
  }

  /**
   * Prepare request data based on provider
   */
  private prepareRequestData(providerConfig: any, messages: Array<{role: 'user' | 'assistant', content: string}>): any {
    // Determine provider type based on default_model
    const model = providerConfig.default_model;
    
    // Both Qwen (compatible-mode) and gpt-5.2-all use OpenAI-compatible format
    return {
      model: model,
      messages: messages,
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.9,
      frequency_penalty: 0,
      presence_penalty: 0
    };
  }

  /**
   * Process response based on provider
   */
  private processResponse(providerConfig: any, data: any): AIConnectionResult {
    // Determine provider type based on default_model
    const model = providerConfig.default_model;
    
    // Both Qwen (compatible-mode) and gpt-5.2-all use OpenAI-compatible response format
    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      return {
        success: true,
        response: data.choices[0].message.content,
        model: model
      };
    } else if (data.error) {
      return {
        success: false,
        error: `${model.includes('qwen') ? 'Qwen' : 'gpt-5.2-all'} API error: ${data.error.message} (code: ${data.error.code || 'unknown'})`,
        model: model
      };
    }

    return {
      success: false,
      error: 'Invalid response from AI provider',
      model: model
    };
  }

  /**
   * Test connection to AI provider
   */
  public async testConnection(
    provider: string,
    apiKey: string
  ): Promise<TestConnectionResult> {
    try {
      // Simple test prompt
      const testMessages = [{
        role: 'user' as const,
        content: "Hello, this is a test to verify API connectivity. Please respond with 'API test successful'."
      }];
      
      const result = await this.connectToAI(provider, apiKey, testMessages);
      
      if (result.success && result.response) {
        return {
          result: 'PASS',
          response: result.response,
          usedUrl: result.usedUrl,
          attempts: result.attempts
        };
      } else {
        return {
          result: 'FAIL',
          error: result.error,
          usedUrl: result.usedUrl,
          attempts: result.attempts
        };
      }
    } catch (error) {
      console.error('Error in testConnection:', error);
      return {
        result: 'FAIL',
        error: `Unexpected error: ${(error as Error).message}`
      };
    }
  }

  /**
   * Get all configured providers
   */
  public async getProviders(): Promise<Array<{ id: string; name: string }>> {
    try {
      const providers = await getAllProviders();
      return providers.map(provider => ({
        id: provider.id,
        name: provider.name
      }));
    } catch (error) {
      console.error('Error getting providers:', error);
      return [];
    }
  }

  /**
   * Get provider configuration
   */
  public async getProviderConfig(provider: string) {
    try {
      return await getProviderById(provider);
    } catch (error) {
      console.error('Error getting provider config:', error);
      return null;
    }
  }

  /**
   * Get default provider ID
   */
  public async getDefaultProvider(): Promise<string> {
    try {
      const defaultProvider = await getDefaultProviderFromDb();
      return defaultProvider?.id || 'qwen-plus';
    } catch (error) {
      console.error('Error getting default provider:', error);
      return 'qwen-plus';
    }
  }

  /**
   * Delay execution for a specified time
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance as AI_API_CONNECTION
export const AI_API_CONNECTION = AIConnectionService.getInstance();