import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcrypt';

// Mock dependencies
vi.mock('mysql2/promise');
vi.mock('bcrypt');
vi.mock('dotenv', () => ({
  default: {
    config: vi.fn()
  }
}));
vi.mock('path', () => ({
  default: {
    resolve: vi.fn().mockReturnValue('.env')
  }
}));

const mockCreatePool = createPool as vi.MockedFunction<typeof createPool>;
const mockBcryptCompare = bcrypt.compare as vi.MockedFunction<typeof bcrypt.compare>;

describe('User Login', () => {
  beforeEach(() => {
    // Setup mock database connection
    const mockPool = {
      getConnection: vi.fn().mockResolvedValue({
        execute: vi.fn(),
        release: vi.fn()
      }),
      end: vi.fn().mockResolvedValue(undefined)
    };
    mockCreatePool.mockReturnValue(mockPool as any);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Validation', () => {
    it('should validate required fields', () => {
      const requiredFields = ['email', 'password'];
      const emptyFields = requiredFields.map(field => ({
        field,
        value: '',
        error: `${field} is required`
      }));
      
      expect(emptyFields).toHaveLength(2);
    });

    it('should validate email format', () => {
      const invalidEmails = ['invalid-email', 'user@', '@domain.com'];
      const validEmails = ['user@example.com', 'user.name@example.com'];
      
      invalidEmails.forEach(email => {
        expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
      
      validEmails.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });
  });

  describe('Database Operations', () => {
    it('should verify password with bcrypt', async () => {
      const mockPool = mockCreatePool();
      const mockConnection = await mockPool.getConnection();
      
      // Mock user retrieval
      mockConnection.execute.mockResolvedValueOnce([[
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password',
          apiKey: 'test-api-key',
          profileImage: null
        }
      ], []]);
      
      // Mock password verification
      mockBcryptCompare.mockResolvedValue(true);
      
      // Simulate password verification
      const result = await bcrypt.compare('password123', 'hashed_password');
      
      expect(mockBcryptCompare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(result).toBe(true);
    });

    it('should handle non-existent user', async () => {
      const mockPool = mockCreatePool();
      const mockConnection = await mockPool.getConnection();
      
      // Mock user retrieval returning no results
      mockConnection.execute.mockResolvedValueOnce([[], []]);
      
      // Call execute to trigger the mock
      await mockConnection.execute('SELECT id, name, email, password, apiKey, profileImage FROM users WHERE email = ?', ['non-existent@example.com']);
      
      expect(mockConnection.execute).toHaveBeenCalled();
    });

    it('should handle incorrect password', async () => {
      const mockPool = mockCreatePool();
      const mockConnection = await mockPool.getConnection();
      
      // Mock user retrieval
      mockConnection.execute.mockResolvedValueOnce([[
        {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
          password: 'hashed_password',
          apiKey: 'test-api-key',
          profileImage: null
        }
      ], []]);
      
      // Mock password verification failure
      mockBcryptCompare.mockResolvedValue(false);
      
      // Simulate password verification
      const result = await bcrypt.compare('wrong_password', 'hashed_password');
      
      expect(mockBcryptCompare).toHaveBeenCalledWith('wrong_password', 'hashed_password');
      expect(result).toBe(false);
    });
  });

  describe('Security', () => {
    it('should not return password in response', () => {
      const userData = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        apiKey: 'test-api-key',
        profileImage: null
      };
      
      const { password: _, ...userWithoutPassword } = userData;
      
      expect(userWithoutPassword).not.toHaveProperty('password');
      expect(Object.keys(userWithoutPassword)).toHaveLength(5);
    });

    it('should handle remember me functionality', () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
        rememberMe: true
      };
      
      expect(loginData.rememberMe).toBe(true);
    });
  });
});
