import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import path from 'path';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import { db } from '../../lib/database';

export async function POST(request: NextRequest) {
  try {
    // Parse FormData body
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const aiConnectionsJson = formData.get('aiConnections') as string;
    const profileImageFile = formData.get('profileImage') as File | null;

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

    // Parse AI connections
    let aiConnections: Array<{ apiKey: string; apiProvider: string }> = [];
    if (aiConnectionsJson) {
      try {
        aiConnections = JSON.parse(aiConnectionsJson);
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid AI connections format',
          timestamp: new Date().toISOString()
        }, {
          status: 400
        });
      }
    }

    // Check if at least one AI connection is provided
    if (aiConnections.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'At least one AI connection is required',
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

      // Convert image to base64 and store in database
      const buffer = Buffer.from(await profileImageFile.arrayBuffer());
      const base64Image = `data:${profileImageFile.type};base64,${buffer.toString('base64')}`;
      profileImagePath = base64Image;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user with system_flag = 'WINGMAN'
    const result = await db.execute(
      'INSERT INTO users (name, email, password, profileImage, system_flag, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [name, email, hashedPassword, profileImagePath, 'WINGMAN']
    );

    const userId = (result as any).insertId;

    // Insert AI connections
    try {
      for (const aiConnection of aiConnections) {
        if (aiConnection.apiKey && aiConnection.apiProvider) {
          await db.execute(
            'INSERT INTO ai_connections (user_id, apiKey, apiProvider) VALUES (?, ?, ?)',
            [userId, aiConnection.apiKey, aiConnection.apiProvider]
          );
        }
      }
    } catch (error) {
      console.error('Error inserting AI connections (table might not exist yet):', error);
      // Fallback to updating old user table fields if ai_connections table doesn't exist
      if (aiConnections.length > 0) {
        const firstConnection = aiConnections[0];
        await db.execute(
          'UPDATE users SET apiKey = ?, apiProvider = ? WHERE id = ?',
          [firstConnection.apiKey || '', firstConnection.apiProvider || 'qwen-plus', userId]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      userId: userId,
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
