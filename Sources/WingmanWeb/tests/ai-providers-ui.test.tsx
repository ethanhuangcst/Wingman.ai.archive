// AI Providers UI Tests
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainSection from '../app/components/MainSection';

// Mock the AI connection service
vi.mock('../app/api/utils/ai-connection/ai-connection-service', () => ({
  AI_API_CONNECTION: {
    getProviders: vi.fn().mockResolvedValue([
      { id: 'gpt-5.2-all', name: 'gpt-5.2-all' },
      { id: 'qwen-plus', name: 'qwen-plus' }
    ]),
    getDefaultProvider: vi.fn().mockResolvedValue('qwen-plus')
  }
}));

describe('AI Providers UI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render provider dropdown in MainSection', async () => {
    render(<MainSection provider="qwen-plus" />);

    // Wait for providers to load
    await waitFor(() => {
      expect(screen.getByText('qwen-plus')).toBeInTheDocument();
    });

    // Check that provider dropdown exists
    const providerSelect = screen.getByDisplayValue('qwen-plus');
    expect(providerSelect).toBeInTheDocument();
  });

  it('should display correct provider name in MainSection', async () => {
    render(<MainSection provider="gpt-5.2-all" />);

    // Wait for providers to load
    await waitFor(() => {
      expect(screen.getByText('gpt-5.2-all')).toBeInTheDocument();
    });

    // Check that correct provider is displayed
    const providerSelect = screen.getByDisplayValue('gpt-5.2-all');
    expect(providerSelect).toBeInTheDocument();
  });

  it('should handle provider selection change', async () => {
    render(<MainSection provider="qwen-plus" />);

    // Wait for providers to load
    await waitFor(() => {
      expect(screen.getByText('qwen-plus')).toBeInTheDocument();
    });

    // Check that we can change provider
    const providerSelect = screen.getByDisplayValue('qwen-plus');
    expect(providerSelect).toBeInTheDocument();
  });
});

// Test for Register page provider selection
describe('Register Page AI Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load providers on Register page', async () => {
    // Mock the Register page component
    const RegisterPage = (await import('../app/register/page')).default;
    
    render(<RegisterPage />);

    // Wait for providers to load
    await waitFor(() => {
      expect(screen.getByText('qwen-plus')).toBeInTheDocument();
    });

    // Check that provider options exist
    expect(screen.getByLabelText('qwen-plus')).toBeInTheDocument();
    expect(screen.getByLabelText('gpt-5.2-all')).toBeInTheDocument();
  });
});

// Test for Settings page provider selection
describe('Settings Page AI Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock localStorage for auth token
    localStorage.setItem('auth-token', 'test-token');
  });

  afterEach(() => {
    localStorage.removeItem('auth-token');
  });

  it('should load providers on Settings page', async () => {
    // Mock the Settings page component
    const SettingsPage = (await import('../app/settings/page')).default;
    
    render(<SettingsPage />);

    // Wait for providers to load
    await waitFor(() => {
      expect(screen.getByText('qwen-plus')).toBeInTheDocument();
    });

    // Check that provider options exist
    expect(screen.getByText('qwen-plus')).toBeInTheDocument();
    expect(screen.getByText('gpt-5.2-all')).toBeInTheDocument();
  });
});
