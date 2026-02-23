import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { db } from '../../lib/database';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Reset Password API endpoint',
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
    
    const { token, password } = body;

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing token or password',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Verify reset token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, jwtSecret);
      
      // Verify token type
      if (decoded.type !== 'reset') {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid reset token',
            timestamp: new Date().toISOString()
          },
          { status: 401 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid or expired reset token',
          timestamp: new Date().toISOString()
        },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    const result = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, decoded.userId]
    );

    // Check if password was updated
    if (!Array.isArray(result) || result.length === 0 || !('affectedRows' in result[0]) || result[0].affectedRows === 0) {
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
        message: 'Password reset successful',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process password reset',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
