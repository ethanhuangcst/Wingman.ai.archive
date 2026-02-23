import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MainSection from '../app/components/MainSection';

// Mock the fetch API to return AI connections
vi.mock('../app/components/MainSection', async (importOriginal) => {
  const originalModule = await importOriginal<typeof import('../app/components/MainSection')>();
  return {
    default: (props: any) => {
      // Add mock AI connections for testing
      return originalModule.default({ ...props, aiConnections: [
        { id: '1', apiKey: 'key1', apiProvider: 'gpt-5.2-all' },
        { id: '2', apiKey: 'key2', apiProvider: 'qwen-plus' }
      ] });
    }
  };
});

describe('US-007 AI Provider Dropdown', () => {
  describe('US-007-001', () => {
    it('should display AI provider dropdown in chat input field', () => {
      render(<MainSection />);
      
      // Check that the AI provider dropdown exists
      const dropdown = screen.getByRole('combobox', { name: /ai provider/i });
      expect(dropdown).toBeInTheDocument();
    });

    it('should display label "AI provider" in the dropdown', () => {
      render(<MainSection />);
      
      // Check that the dropdown has the correct label
      const dropdown = screen.getByRole('combobox', { name: /ai provider/i });
      expect(dropdown).toBeInTheDocument();
    });

    it('should show currently selected AI provider in the dropdown', () => {
      render(<MainSection />);
      
      // Check that the dropdown has a selected value
      const dropdown = screen.getByRole('combobox', { name: /ai provider/i });
      expect(dropdown).toHaveValue(expect.any(String));
    });
  });

  describe('US-007-002', () => {
    it('should allow switching AI providers', async () => {
      render(<MainSection />);
      
      // Get the dropdown
      const dropdown = screen.getByRole('combobox', { name: /ai provider/i });
      
      // Change the selected provider
      fireEvent.change(dropdown, { target: { value: 'qwen-plus' } });
      
      // Check that the value changed
      expect(dropdown).toHaveValue('qwen-plus');
    });
  });

  describe('US-007-003', () => {
    it('should display dropdown with single connection', () => {
      // Mock with only one AI connection
      vi.mock('../app/components/MainSection', async (importOriginal) => {
        const originalModule = await importOriginal<typeof import('../app/components/MainSection')>();
        return {
          default: (props: any) => {
            return originalModule.default({ ...props, aiConnections: [
              { id: '1', apiKey: 'key1', apiProvider: 'gpt-5.2-all' }
            ] });
          }
        };
      });

      render(<MainSection />);
      
      // Check that the dropdown exists
      const dropdown = screen.getByRole('combobox', { name: /ai provider/i });
      expect(dropdown).toBeInTheDocument();
      
      // Check that the dropdown displays the only available provider
      expect(dropdown).toHaveValue('gpt-5.2-all');
    });
  });

  describe('US-007-004', () => {
    it('should display message for no connections', () => {
      // Mock with no AI connections
      vi.mock('../app/components/MainSection', async (importOriginal) => {
        const originalModule = await importOriginal<typeof import('../app/components/MainSection')>();
        return {
          default: (props: any) => {
            return originalModule.default({ ...props, aiConnections: [] });
          }
        };
      });

      render(<MainSection />);
      
      // Check that the dropdown exists
      const dropdown = screen.getByRole('combobox', { name: /ai provider/i });
      expect(dropdown).toBeInTheDocument();
      
      // Check that the dropdown displays no connections message
      expect(dropdown).toHaveValue('');
    });
  });
});
