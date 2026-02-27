// AI Providers API Tests
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';

describe('AI Providers API', () => {
  beforeAll(async () => {
    // Ensure the server is running
    try {
      const response = await fetch(`${baseUrl}/api/providers`);
      if (!response.ok) {
        throw new Error('Server is not running');
      }
    } catch (error) {
      console.error('Server is not running. Please start the server with npm run dev before running tests.');
      throw error;
    }
  });

  it('should fetch all providers successfully', async () => {
    const response = await fetch(`${baseUrl}/api/providers`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toHaveProperty('providers');
    expect(data).toHaveProperty('defaultProvider');
    expect(Array.isArray(data.providers)).toBe(true);
    expect(data.providers.length).toBeGreaterThan(0);
  });

  it('should return providers with correct structure', async () => {
    const response = await fetch(`${baseUrl}/api/providers`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    
    // Check each provider has required fields
    data.providers.forEach((provider: any) => {
      expect(provider).toHaveProperty('id');
      expect(provider).toHaveProperty('name');
      expect(provider).toHaveProperty('base_urls');
      expect(provider).toHaveProperty('default_model');
      expect(provider).toHaveProperty('requires_auth');
      expect(provider).toHaveProperty('auth_header');
      expect(Array.isArray(provider.base_urls)).toBe(true);
      expect(provider.base_urls.length).toBeGreaterThan(0);
    });
  });

  it('should return default provider', async () => {
    const response = await fetch(`${baseUrl}/api/providers`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.defaultProvider).toBeDefined();
    expect(data.defaultProvider).toHaveProperty('id');
    expect(data.defaultProvider).toHaveProperty('name');
  });

  it('should include gpt-5.2-all provider', async () => {
    const response = await fetch(`${baseUrl}/api/providers`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    
    const gptProvider = data.providers.find((p: any) => p.id === 'gpt-5.2-all');
    expect(gptProvider).toBeDefined();
    expect(gptProvider.name).toBe('gpt-5.2-all');
    expect(gptProvider.default_model).toBe('gpt-5.2-all');
  });

  it('should include qwen-plus provider', async () => {
    const response = await fetch(`${baseUrl}/api/providers`);
    const data = await response.json();

    expect(response.ok).toBe(true);
    
    const qwenProvider = data.providers.find((p: any) => p.id === 'qwen-plus');
    expect(qwenProvider).toBeDefined();
    expect(qwenProvider.name).toBe('qwen-plus');
    expect(qwenProvider.default_model).toBe('qwen-plus');
  });
});
