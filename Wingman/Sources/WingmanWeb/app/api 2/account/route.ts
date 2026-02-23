import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { db } from '../../lib/database';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Helper function to verify JWT token
export interface DecodedToken {
  userId: number;
}

export function verifyToken(token: string) {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  try {
    return jwt.verify(token, jwtSecret) as DecodedToken | null;
  } catch {
    return null;
  }
}

// Helper function to get user ID from token
function getUserIdFromRequest(request: NextRequest) {
  // First try to get token from authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      return decoded.userId;
    }
  }
  
  // If no token in header, try to get from cookie
  const token = request.cookies.get('auth-token')?.value;
  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      return decoded.userId;
    }
  }
  
  return null;
}

export async function GET(request: NextRequest) {
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

    // Get user information
    const users = await db.execute(
      'SELECT id, name, email, profileImage FROM users WHERE id = ?',
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

    const user = users[0] as {
      id: number;
      name: string;
      email: string;
      profileImage: string | null;
    };

    // Get AI connections
    let aiConnections: Array<{ id: string; apiKey: string; apiProvider: string }> = [];
    try {
      const connections = await db.execute(
        'SELECT id, apiKey, apiProvider FROM ai_connections WHERE user_id = ?',
        [userId]
      );

      aiConnections = Array.isArray(connections) ? connections.map((conn: any) => ({
        id: conn.id.toString(),
        apiKey: conn.apiKey,
        apiProvider: conn.apiProvider
      })) : [];
    } catch (error) {
      console.error('Error getting AI connections (table might not exist yet):', error);
      // No fallback needed since we've removed the old user table fields
      aiConnections = [];
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          aiConnections
        },
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get account error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get account information',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse FormData body
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const aiConnectionsJson = formData.get('aiConnections') as string;
    const password = formData.get('password') as string | null;
    const profileImageFile = formData.get('profileImage') as File | null;

    // Parse AI connections
    let aiConnections: Array<{ apiKey: string; apiProvider: string }> = [];
    if (aiConnectionsJson) {
      try {
        aiConnections = JSON.parse(aiConnectionsJson);
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid AI connections format',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }
    }

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name is required',
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

    let profileImagePath = null;

    // Handle profile image upload if provided
    if (profileImageFile) {
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024; // 2MB
      if (profileImageFile.size > maxSize) {
        return NextResponse.json(
          {
            success: false,
            error: 'File size must be less than 2MB',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      // Validate file type
      if (!profileImageFile.type.startsWith('image/')) {
        return NextResponse.json(
          {
            success: false,
            error: 'File must be an image',
            timestamp: new Date().toISOString()
          },
          { status: 400 }
        );
      }

      // Create upload directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'profile-images');
      await import('fs').then(fs => {
        if (!fs.default.existsSync(uploadDir)) {
          fs.default.mkdirSync(uploadDir, { recursive: true });
        }
      });

      // Generate unique filename
      const uniqueId = randomUUID();
      const fileExtension = path.extname(profileImageFile.name);
      const filename = `${uniqueId}${fileExtension}`;
      const filePath = path.join(uploadDir, filename);

      // Save file
      const buffer = Buffer.from(await profileImageFile.arrayBuffer());
      await writeFile(filePath, buffer);

      // Store relative path in database
      profileImagePath = `/uploads/profile-images/${filename}`;
    }

    // Check if email is already in use by another user
    const existingUsers = await db.execute(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email, userId]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Email already in use',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Handle password hashing if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update user information
    let result;
    if (hashedPassword) {
      if (profileImagePath !== null) {
        // Update with password and profile image
        result = await db.executeRaw(
          'UPDATE users SET name = ?, email = ?, password = ?, profileImage = ? WHERE id = ?',
          [name.trim(), email, hashedPassword, profileImagePath, userId]
        );
      } else {
        // Update with password but without changing profile image
        result = await db.executeRaw(
          'UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?',
          [name.trim(), email, hashedPassword, userId]
        );
      }
    } else {
      if (profileImagePath !== null) {
        // Update with profile image but without changing password
        result = await db.executeRaw(
          'UPDATE users SET name = ?, email = ?, profileImage = ? WHERE id = ?',
          [name.trim(), email, profileImagePath, userId]
        );
      } else {
        // Update without changing password or profile image
        result = await db.executeRaw(
          'UPDATE users SET name = ?, email = ? WHERE id = ?',
          [name.trim(), email, userId]
        );
      }
    }

    // Check if update was successful
    if (!result || !Array.isArray(result) || result.length === 0 || !('affectedRows' in result[0]) || result[0].affectedRows === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update account',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    // Update AI connections
    try {
      // First, delete existing connections
      await db.executeRaw(
        'DELETE FROM ai_connections WHERE user_id = ?',
        [userId]
      );

      // Then, insert new connections
      for (const aiConnection of aiConnections) {
        if (aiConnection.apiKey && aiConnection.apiProvider) {
          await db.executeRaw(
            'INSERT INTO ai_connections (user_id, apiKey, apiProvider) VALUES (?, ?, ?)',
            [userId, aiConnection.apiKey, aiConnection.apiProvider]
          );
        }
      }
    } catch (error) {
      console.error('Error updating AI connections (table might not exist yet):', error);
      // Fallback to updating old user table fields if ai_connections table doesn't exist
      if (aiConnections.length > 0) {
        const firstConnection = aiConnections[0];
        await db.executeRaw(
          'UPDATE users SET apiKey = ?, apiProvider = ? WHERE id = ?',
          [firstConnection.apiKey || '', firstConnection.apiProvider || 'qwen-plus', userId]
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Account updated successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update account error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update account information',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
