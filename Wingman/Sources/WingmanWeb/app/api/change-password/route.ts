import { NextRequest, NextResponse } from 'next/server';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface DecodedToken {
  userId: number;
}

// Helper function to verify JWT token
function verifyToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  try {
    return jwt.verify(token, jwtSecret) as DecodedToken | null;
  } catch {
    return null;
  }
}

// Helper function to get user ID from token
function getUserIdFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  
  return decoded ? decoded.userId : null;
}

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Change Password API endpoint',
      status: 'ready',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired token',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // Parse JSON body
    const body = await request.json();
    
    const { newPassword } = body;

    // Validate required fields
    if (!newPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing new password',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Create database connection pool
    const pool = createPool({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: 'password',
      database: 'wingman_db',
    });

    const connection = await pool.getConnection();

    try {
      // Check if user exists
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE id = ?',
        [userId]
      );

      if (!Array.isArray(users) || users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'User not found',
            timestamp: new Date().toISOString()
          },
          { status: 404 }
        );
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user password
      const [result] = await connection.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      // Check if update was successful
      if (!('affectedRows' in result) || result.affectedRows === 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to update password',
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Password changed successfully',
          timestamp: new Date().toISOString()
        },
        { status: 200 }
      );
    } finally {
      connection.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Change password error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to change password',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
