import { NextRequest, NextResponse } from 'next/server';
import db from '../../lib/db';
import { verifyToken } from '../account/route';

// Helper function to get user ID from token
function getUserIdFromRequest(request: NextRequest): number | null {
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

// GET /api/prompts - Get all prompts for the user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get all prompts for the user, ordered by updated_datetime (most recent first)
    const prompts = await db.execute(
      'SELECT id, prompt_name, prompt_text, created_datetime, updated_datetime FROM prompts WHERE user_id = ? ORDER BY updated_datetime DESC',
      [userId]
    );
    
    // Format the prompts data
    const formattedPrompts = (prompts as any[]).map((prompt) => ({
      id: prompt.id,
      name: prompt.prompt_name,
      text: prompt.prompt_text,
      created_at: prompt.created_datetime.toISOString(),
      updated_at: prompt.updated_datetime.toISOString()
    }));
    
    console.log('Retrieving prompts from database');
    console.log(`Found ${formattedPrompts.length} prompts`);
    
    return NextResponse.json({ prompts: formattedPrompts }, { status: 200 });
  } catch (error) {
    console.error('Error loading prompts from database:', error);
    return NextResponse.json({ error: 'Failed to load prompts' }, { status: 500 });
  }
}

// POST /api/prompts - Create a new prompt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Validate input
    if (!body.name || !body.text) {
      return NextResponse.json({ error: 'Prompt name and text are required' }, { status: 400 });
    }
    
    // Create new prompt
    const promptId = `prompt-${Date.now()}`;
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // Insert prompt into database
    await db.execute(
      'INSERT INTO prompts (id, user_id, prompt_name, prompt_text, created_datetime, updated_datetime) VALUES (?, ?, ?, ?, ?, ?)',
      [promptId, userId, body.name, body.text, now, now]
    );
    
    const newPrompt = {
      id: promptId,
      name: body.name,
      text: body.text,
      created_at: now,
      updated_at: now
    };
    
    console.log('Creating new prompt:', newPrompt.name);
    console.log('Saving new prompt to database');
    
    return NextResponse.json({ prompt: newPrompt }, { status: 201 });
  } catch (error) {
    console.error('Error creating prompt:', error);
    return NextResponse.json({ error: 'Failed to create prompt' }, { status: 500 });
  }
}

// PUT /api/prompts - Update an existing prompt
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Validate input
    if (!body.id || (!body.name && !body.text)) {
      return NextResponse.json({ error: 'Prompt ID and at least one field to update are required' }, { status: 400 });
    }
    
    // Check if prompt exists and belongs to the user
    const existingPrompts = await db.execute(
      'SELECT id FROM prompts WHERE id = ? AND user_id = ?',
      [body.id, userId]
    );
    
    if (!existingPrompts || existingPrompts.length === 0) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }
    
    // Update prompt
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    if (body.name && body.text) {
      await db.execute(
        'UPDATE prompts SET prompt_name = ?, prompt_text = ?, updated_datetime = ? WHERE id = ? AND user_id = ?',
        [body.name, body.text, now, body.id, userId]
      );
    } else if (body.name) {
      await db.execute(
        'UPDATE prompts SET prompt_name = ?, updated_datetime = ? WHERE id = ? AND user_id = ?',
        [body.name, now, body.id, userId]
      );
    } else if (body.text) {
      await db.execute(
        'UPDATE prompts SET prompt_text = ?, updated_datetime = ? WHERE id = ? AND user_id = ?',
        [body.text, now, body.id, userId]
      );
    }
    
    // Get updated prompt
    const updatedPrompts = await db.execute(
      'SELECT id, prompt_name, prompt_text, created_datetime, updated_datetime FROM prompts WHERE id = ?',
      [body.id]
    );
    
    const updatedPrompt = updatedPrompts[0];
    
    const formattedPrompt = {
      id: updatedPrompt.id,
      name: updatedPrompt.prompt_name,
      text: updatedPrompt.prompt_text,
      created_at: updatedPrompt.created_datetime.toISOString(),
      updated_at: updatedPrompt.updated_datetime.toISOString()
    };
    
    console.log('Updating prompt:', formattedPrompt.name);
    console.log('Saving changes to database');
    
    return NextResponse.json({ prompt: formattedPrompt }, { status: 200 });
  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
  }
}

// DELETE /api/prompts - Delete a prompt
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Validate input
    if (!body.id) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }
    
    // Delete prompt
    await db.execute(
      'DELETE FROM prompts WHERE id = ? AND user_id = ?',
      [body.id, userId]
    );
    
    console.log('Deleting prompt:', body.id);
    console.log('Removing prompt from database');
    
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
  }
}
