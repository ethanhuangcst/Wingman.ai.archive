import { NextRequest, NextResponse } from 'next/server';
import { createPool } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export async function GET(_request: NextRequest) {
  return NextResponse.json(
    {
      message: 'Registration API endpoint',
      status: 'ready',
      timestamp: new Date().toISOString()
    },
    { status: 200 }
  );
}

export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const apiKey = formData.get('apiKey') as string;
    const profileImage = formData.get('profileImage') as File | null;

    // Validate required fields
    if (!name || !email || !password || !apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Password must be at least 8 characters',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Validate profile image if provided
    if (profileImage) {
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (profileImage.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: 'File size must be less than 2MB',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      if (!profileImage.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            error: 'File must be an image',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
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
      // Check if email already exists
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Email already registered',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Handle profile image (in a real app, you'd upload to storage)
      let profileImagePath = null;
      if (profileImage) {
        // For now, we'll just store the filename
        profileImagePath = profileImage.name;
        // In production, you'd upload to S3 or similar
      }

      // Create user
      const [result] = await connection.execute(
        `INSERT INTO users (name, email, password, apiKey, profileImage, createdAt)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [name, email, hashedPassword, apiKey, profileImagePath]
      );

      const userId = (result as { insertId: number }).insertId;

      return NextResponse.json(
        {
          success: true,
          message: 'User registered successfully',
          userId,
          timestamp: new Date().toISOString()
        },
        { status: 201 }
      );
    } finally {
      connection.release();
      await pool.end();
    }
  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error details:', error instanceof Error ? error.message : error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
    return NextResponse.json(
      {
        success: false,
        error: 'Registration failed. Please try again.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
