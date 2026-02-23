import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import path from 'path';
import { verifyToken } from '../account/route';

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

export async function POST(request: NextRequest) {
  try {
    // Verify user authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const filename = `${randomUUID()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'chat-files');

    // Ensure upload directory exists
    await import('fs/promises').then(fs => fs.mkdir(uploadDir, { recursive: true }));

    // Read file content
    const buffer = Buffer.from(await file.arrayBuffer());

    // Write file to disk
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Generate absolute public URL using a public domain if available
    const publicUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get('origin') || 'http://localhost:3000';
    const fileUrl = `${publicUrl}/uploads/chat-files/${filename}`;

    return NextResponse.json(
      { success: true, fileUrl, filename: file.name },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
