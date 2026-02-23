import { NextRequest, NextResponse } from 'next/server';
import { AI_API_CONNECTION } from './../utils/ai-connection/ai-connection-service';
import { verifyToken } from './../account/route';
import { getDefaultProvider } from '../../lib/db';
import db from '../../lib/database';

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

async function getAIResponse(messages: Array<{role: 'user' | 'assistant', content: string}>, provider: string, apiKey: string): Promise<string> {
  try {
    // Use AI_API_CONNECTION to get response
    const result = await AI_API_CONNECTION.connectToAI(provider, apiKey, messages);

    if (result.success && result.response) {
      return result.response;
    } else {
      console.error('AI API call failed:', result.error);
      throw new Error(result.error || 'Failed to get response from AI provider');
    }
  } catch (error) {
    console.error('Error calling AI API:', error);
    throw error;
  }
}

async function getUserAPIInfo(userId: number, selectedProvider?: string): Promise<{ apiProvider: string; apiKey: string }> {
  // Get AI connections from ai_connections table
  let query = 'SELECT apiKey, apiProvider FROM ai_connections WHERE user_id = ?';
  let params: any[] = [userId];
  
  if (selectedProvider) {
    // Get connection for the selected provider
    query += ' AND apiProvider = ?';
    params.push(selectedProvider);
  } else {
    // Get first connection if no provider selected
    query += ' ORDER BY id ASC LIMIT 1';
  }
  
  const connections = await db.execute(query, params);

  if (Array.isArray(connections) && connections.length > 0) {
    const connectionData = connections[0] as {
      apiKey: string;
      apiProvider: string;
    };

    return {
      apiProvider: connectionData.apiProvider || 'qwen-plus',
      apiKey: connectionData.apiKey || ''
    };
  } else {
    // No AI connections found
    throw new Error('No AI connections found for this user');
  }
}

export async function POST(request: NextRequest) {
  try {
    const { messages, provider } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // Get user info from token to retrieve provider and API key
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    // Get user API information directly from database
    const { apiProvider, apiKey } = await getUserAPIInfo(userId, provider);

    // Validate API key
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required. Please set up your AI connections in account settings.' },
        { status: 400 }
      );
    }

    // Get response from AI API
    const response = await getAIResponse(messages, apiProvider, apiKey);

    return NextResponse.json(
      { success: true, response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in chat API:', error);
    if ((error as Error).message === 'No AI connections found for this user') {
      return NextResponse.json(
        { error: 'No AI connections found. Please set up your AI connections in account settings.' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: (error as Error).message || 'Internal server error' },
      { status: 500 }
    );
  }
}
