import { NextRequest, NextResponse } from 'next/server';
import db from '../../lib/db';
import { verifyToken } from '../account/route';
import { getDefaultProvider as getDefaultProviderFromDb } from '../../lib/db';

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

// Helper function to get default provider
async function getDefaultProvider(): Promise<string> {
  try {
    const defaultProvider = await getDefaultProviderFromDb();
    return defaultProvider?.id || 'qwen-plus';
  } catch (error) {
    console.error('Error getting default provider:', error);
    return 'qwen-plus';
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user ID from authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get all chats for the user, ordered by timestamp (most recent first)
    const chats = await db.execute(
      'SELECT id, name, timestamp FROM chats WHERE user_id = ? ORDER BY timestamp DESC',
      [userId]
    );
    
    // Get default provider once for all messages
    const defaultProvider = await getDefaultProvider();
    
    // For each chat, get its messages
    const chatsWithMessages = await Promise.all(
      (chats as any[]).map(async (chat) => {
        try {
          // Try to select with provider column
          const messages = await db.execute(
            'SELECT id, content, role, provider, timestamp FROM chat_messages WHERE chat_id = ? ORDER BY timestamp ASC',
            [chat.id]
          );
          
          return {
            id: chat.id,
            name: chat.name,
            timestamp: chat.timestamp.toISOString(),
            messages: (messages as any[]).map((msg) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              provider: msg.provider || defaultProvider,
              timestamp: msg.timestamp.toISOString()
            }))
          };
        } catch (error) {
          // If provider column doesn't exist, select without it
          const messages = await db.execute(
            'SELECT id, content, role, timestamp FROM chat_messages WHERE chat_id = ? ORDER BY timestamp ASC',
            [chat.id]
          );
          
          return {
            id: chat.id,
            name: chat.name,
            timestamp: chat.timestamp.toISOString(),
            messages: (messages as any[]).map((msg) => ({
              id: msg.id,
              content: msg.content,
              role: msg.role,
              provider: defaultProvider, // Default provider
              timestamp: msg.timestamp.toISOString()
            }))
          };
        }
      })

    );
    
    console.log('Retrieving chat history from database');
    console.log(`Found ${chatsWithMessages.length} chats`);
    
    return NextResponse.json({ chats: chatsWithMessages }, { status: 200 });
  } catch (error) {
    console.error('Error loading chat history from database:', error);
    return NextResponse.json({ error: 'Failed to load chat history' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get user ID from authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (body.action === 'create') {
      // Create new chat
      const chatId = `chat-${Date.now()}`;
      const chatName = body.name || 'New Chat';
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      // Insert chat into database
      await db.execute(
        'INSERT INTO chats (id, user_id, name, timestamp) VALUES (?, ?, ?, ?)',
        [chatId, userId, chatName, timestamp]
      );
      
      const newChat = {
        id: chatId,
        name: chatName,
        timestamp: timestamp,
        messages: []
      };
      
      console.log('Creating new chat:', newChat.name);
      console.log('Saving new chat to database');
      
      return NextResponse.json({ chat: newChat }, { status: 201 });
    } else if (body.action === 'rename') {
      // Rename chat
      await db.execute(
        'UPDATE chats SET name = ? WHERE id = ? AND user_id = ?',
        [body.name, body.id, userId]
      );
      
      // Get updated chat
      const updatedChats = await db.execute(
        'SELECT id, name, timestamp FROM chats WHERE id = ?',
        [body.id]
      );
      
      if (!updatedChats || updatedChats.length === 0) {
        return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
      }
      
      const updatedChat = updatedChats[0];
      
      console.log('Renaming chat to:', body.name);
      console.log('Saving updated chat name to database');
      
      return NextResponse.json({ 
        chat: {
          id: updatedChat.id,
          name: updatedChat.name,
          timestamp: updatedChat.timestamp.toISOString(),
          messages: [] // Messages will be loaded separately if needed
        } 
      }, { status: 200 });
    } else if (body.action === 'delete') {
      // Delete chat (messages will be deleted automatically via cascade)
      await db.execute(
        'DELETE FROM chats WHERE id = ? AND user_id = ?',
        [body.id, userId]
      );
      
      console.log('Deleting chat from database');
      
      return NextResponse.json({ success: true }, { status: 200 });
    } else if (body.action === 'addMessage') {
      // Create new message
      const messageId = `msg-${Date.now()}`;
      const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      
      try {
        // Try to insert with provider column
        await db.execute(
          'INSERT INTO chat_messages (id, chat_id, content, role, provider, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
          [messageId, body.chatId, body.content, body.role, body.provider || await getDefaultProvider(), timestamp]
        );
      } catch (error) {
        // If provider column doesn't exist, insert without it
        await db.execute(
          'INSERT INTO chat_messages (id, chat_id, content, role, timestamp) VALUES (?, ?, ?, ?, ?)',
          [messageId, body.chatId, body.content, body.role, timestamp]
        );
      }
      
      // Update chat timestamp
      await db.execute(
        'UPDATE chats SET timestamp = ? WHERE id = ?',
        [timestamp, body.chatId]
      );
      
      // Get updated chat
      const updatedChats = await db.execute(
        'SELECT id, name, timestamp FROM chats WHERE id = ?',
        [body.chatId]
      );
      
      const updatedChat = updatedChats[0];
      
      const newMessage = {
        id: messageId,
        content: body.content,
        role: body.role as 'user' | 'assistant',
        provider: body.provider || await getDefaultProvider(),
        timestamp: timestamp
      };
      
      console.log('Adding message to chat:', updatedChat.name);
      console.log('Message role:', body.role);
      console.log('Saving message to database');
      
      return NextResponse.json({ 
        message: newMessage, 
        chat: {
          id: updatedChat.id,
          name: updatedChat.name,
          timestamp: updatedChat.timestamp.toISOString(),
          messages: [] // Messages will be loaded separately if needed
        } 
      }, { status: 200 });
    } else if (body.action === 'deleteAll') {
      // Delete all chats (messages will be deleted automatically via cascade)
      await db.execute('DELETE FROM chats');
      
      console.log('Deleted all chats from database');
      
      return NextResponse.json({ success: true }, { status: 200 });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json({ error: 'Failed to process chat request' }, { status: 500 });
  }
}
