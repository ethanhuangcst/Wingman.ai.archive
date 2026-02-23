import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { db } from '../../lib/database';


export async function POST(request: NextRequest) {
  try {
    // Parse JSON body
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
        timestamp: new Date().toISOString()
      }, {
        status: 400
      });
    }

    // Check if email exists
    const existingUsers = await db.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Email already registered',
        timestamp: new Date().toISOString()
      }, {
        status: 400
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await db.execute(
      'INSERT INTO users (name, email, password, created_at) VALUES (?, ?, ?, NOW())',
      [name, email, hashedPassword]
    );

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: (result as any).insertId,
      timestamp: new Date().toISOString()
    }, {
      status: 201
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Registration failed. Please try again.',
      errorDetails: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, {
      status: 500
    });
  }
}
