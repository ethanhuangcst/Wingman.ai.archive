import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create response with success message
    const response = NextResponse.json(
      {
        success: true,
        message: 'Logout successful',
        timestamp: new Date().toISOString()
      },
      { status: 200 }
    );

    // Clear the authentication token cookie by setting it with an expired date
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      expires: new Date(0)
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Logout failed. Please try again.',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
