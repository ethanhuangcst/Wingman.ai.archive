import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { AI_API_CONNECTION } from '../utils/ai-connection/ai-connection-service';
import { db } from '../../lib/database';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Login API endpoint',
      status: 'ready',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    
    const { email, password, rememberMe } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing email or password',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Database connection with timeout handling
    let userData: { id: number; name: string; email: string; profileImage: string | null };
    let passwordMatch = false;

    try {
      // Get user from database
      const users = await db.execute(
        'SELECT id, name, email, password, profileImage FROM users WHERE email = ?',
        [email]
      );

      if (Array.isArray(users) && users.length > 0) {
        const user = users[0] as any;
        
        // Handle both snake_case and camelCase column names
        const storedPassword = user.password || user.password_hash;
        
        // Verify password
        if (storedPassword) {
          passwordMatch = await bcrypt.compare(password, storedPassword);
        }
        
        if (passwordMatch) {
          userData = {
            id: user.id,
            name: user.name || user.username,
            email: user.email,
            profileImage: user.profileImage || user.profile_image || null
          };
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid credentials',
              timestamp: new Date().toISOString()
            },
            { status: 401 }
          );
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid credentials',
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        );
      }
    } catch (dbError) {
      console.error('Database connection failed:', dbError.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection failed',
          timestamp: new Date().toISOString()
        },
        { status: 503 }
      );
    }

    // Skip AI API connection test during login to improve performance
    const apiTestResult = 'SKIPPED';
    const apiTestError: string | null = null;
    console.log('AI API connection test skipped during login for performance optimization');

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const expiresIn = rememberMe ? '7d' : '1h';
    
    const token = jwt.sign(
      {
        userId: userData.id,
        email: userData.email,
        name: userData.name
      },
      jwtSecret,
      { expiresIn }
    );

    // Create response with token
    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: userData,
        token,
        apiTest: {
          testResult: apiTestResult,
          testError: apiTestError
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

    // Set cookie with token
    console.log(`Setting auth token for user ID: ${userData.id}`);
    console.log(`Token: ${token.substring(0, 50)}...`); // Log first 50 chars for debugging
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: rememberMe ? 7 * 24 * 60 * 60 : 60 * 60, // 7 days or 1 hour
      path: '/'
    });
    console.log('Cookie set successfully');
    
    // Log cookie details
    const cookie = response.cookies.get('auth-token');
    console.log(`Cookie details: ${JSON.stringify(cookie)}`);

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Login failed. Please try again.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
