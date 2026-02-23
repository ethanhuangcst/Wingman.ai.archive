import { NextRequest, NextResponse } from 'next/server';
import { AI_API_CONNECTION } from '../utils/ai-connection/ai-connection-service';

interface TestConnectionRequest {
  provider: string;
  apiKey: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: TestConnectionRequest = await request.json();
    const { provider, apiKey } = body;

    if (!provider || !apiKey) {
      return NextResponse.json(
        { error: 'Provider and API key are required' },
        { status: 400 }
      );
    }

    // Use AI_API_CONNECTION to test connection
    const result = await AI_API_CONNECTION.testConnection(provider, apiKey);

    return NextResponse.json({
      success: result.result === 'PASS',
      result: result.result,
      response: result.response,
      error: result.error,
      usedUrl: result.usedUrl
    });
  } catch (error) {
    console.error('Error in test-ai-connection endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
