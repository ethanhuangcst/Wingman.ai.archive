import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET, POST } from '../../app/api/register/route';
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
const mockBcryptHash = bcrypt.hash as vi.MockedFunction<typeof bcrypt.hash>;

describe('Registration API Route', () => {
  beforeEach(() => {
    // Setup mock database connection
    const mockPool = {
      getConnection: vi.fn().mockResolvedValue({
        execute: vi.fn(),
        release: vi.fn()
      }),
      end: vi.fn().mockResolvedValue(undefined)
    };
    mockCreatePool.mockReturnValue(mockPool as ReturnType<typeof createPool>);
    
    // Setup mock bcrypt
    mockBcryptHash.mockResolvedValue('hashed_password');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET Request', () => {
    it('should return 200 with registration page info', async () => {
      const mockRequest = {} as NextRequest;
      const response = await GET(mockRequest);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('message', 'Registration API endpoint');
      expect(data).toHaveProperty('status', 'ready');
    });
  });

  describe('POST Request', () => {
    it('should register user with valid data', async () => {
      const mockFormData = new Map();
      mockFormData.set('name', 'Test User');
      mockFormData.set('email', 'test@example.com');
      mockFormData.set('password', 'Password123!');
      mockFormData.set('apiKey', 'test-api-key');
      mockFormData.set('profileImage', null);

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest;

      const mockPool = mockCreatePool();
      const mockConnection = await mockPool.getConnection();
      
      // Mock email check returning no results
      mockConnection.execute.mockResolvedValueOnce([[], []]);
      
      // Mock user creation
      mockConnection.execute.mockResolvedValueOnce([{ insertId: 1 }, []]);

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('message', 'User registered successfully');
      expect(data).toHaveProperty('userId', 1);
    });

    it('should return error for existing email', async () => {
      const mockFormData = new Map();
      mockFormData.set('name', 'Test User');
      mockFormData.set('email', 'existing@example.com');
      mockFormData.set('password', 'Password123!');
      mockFormData.set('apiKey', 'test-api-key');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest;

      const mockPool = mockCreatePool();
      const mockConnection = await mockPool.getConnection();
      
      // Mock email check returning existing user
      mockConnection.execute.mockResolvedValueOnce([[{ id: 1 }], []]);

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Email already registered');
    });

    it('should return error for missing required fields', async () => {
      const mockFormData = new Map();
      mockFormData.set('name', '');
      mockFormData.set('email', '');
      mockFormData.set('password', '');
      mockFormData.set('apiKey', '');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error');
    });

    it('should return error for invalid email format', async () => {
      const mockFormData = new Map();
      mockFormData.set('name', 'Test User');
      mockFormData.set('email', 'invalid-email');
      mockFormData.set('password', 'Password123!');
      mockFormData.set('apiKey', 'test-api-key');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Invalid email format');
    });

    it('should return error for weak password', async () => {
      const mockFormData = new Map();
      mockFormData.set('name', 'Test User');
      mockFormData.set('email', 'test@example.com');
      mockFormData.set('password', 'weak');
      mockFormData.set('apiKey', 'test-api-key');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Password must be at least 8 characters');
    });

    it('should handle database connection error', async () => {
      const mockFormData = new Map();
      mockFormData.set('name', 'Test User');
      mockFormData.set('email', 'test@example.com');
      mockFormData.set('password', 'Password123!');
      mockFormData.set('apiKey', 'test-api-key');

      const mockRequest = {
        formData: vi.fn().mockResolvedValue(mockFormData)
      } as unknown as NextRequest;

      // Mock database connection error
      mockCreatePool.mockImplementation(() => {
        throw new Error('Database connection error');
      });

      const response = await POST(mockRequest);
      
      expect(response.status).toBe(500);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('error', 'Registration failed. Please try again.');
    });
  });
});
