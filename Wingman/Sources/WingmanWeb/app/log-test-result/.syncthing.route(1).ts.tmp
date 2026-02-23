import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { testPrompt, aiResponse, testResult } = body;
    
    // Log test results to server terminal
    console.log('\n=== AI API Test Call ===');
    console.log('Test prompt:', testPrompt);
    console.log('AI response:', aiResponse);
    console.log('Result:', testResult);
    console.log('============================\n');
    
    return NextResponse.json(
      {
        success: true,
        message: 'Test results logged successfully',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error logging test results:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to log test results',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
