import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '../../app/api/login/route';
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

describe('Login API Route', () => {
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

  describe('GET Request', () => {
    it('should return 200 with login page info', async () => {
      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Login API endpoint');
      expect(data).toHaveProperty('status', 'ready');
    });
  });

  describe('POST Request', () => {
    it('should login user with valid credentials', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false
        })
      } as unknown as NextRequest;

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

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'Login successful');
      expect(data).toHaveProperty('user');
      expect(data.user).not.toHaveProperty('password');
    });

    it('should return error for non-existent email', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'non-existent@example.com',
          password: 'password123',
          rememberMe: false
        })
      } as unknown as NextRequest;

      const mockPool = mockCreatePool();
      const mockConnection = await mockPool.getConnection();
      
      // Mock user retrieval returning no results
      mockConnection.execute.mockResolvedValueOnce([[], []]);

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return error for incorrect password', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'wrong_password',
          rememberMe: false
        })
      } as unknown as NextRequest;

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

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Invalid credentials');
    });

    it('should return error for missing required fields', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: '',
          password: '',
          rememberMe: false
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Missing email or password');
    });

    it('should return error for invalid email format', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'invalid-email',
          password: 'password123',
          rememberMe: false
        })
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Invalid email format');
    });

    it('should handle database connection error', async () => {
      const mockRequest = {
        json: vi.fn().mockResolvedValue({
          email: 'test@example.com',
          password: 'password123',
          rememberMe: false
        })
      } as unknown as NextRequest;

      // Mock database connection error
      mockCreatePool.mockImplementation(() => {
        throw new Error('Database connection error');
      });

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Login failed. Please try again.');
    });
  });
});
