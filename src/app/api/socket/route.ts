import { NextRequest, NextResponse } from 'next/server';

// For deployment environments like Netlify, we'll return a simple response
// Socket.io requires persistent connections which aren't supported in serverless
export async function GET(req: NextRequest) {
  try {
    // In serverless environments, return a mock response
    return NextResponse.json({ 
      success: true, 
      message: 'Socket endpoint available - using fallback for serverless deployment',
      socketEnabled: false 
    });
  } catch (error) {
    console.error('Socket endpoint error:', error);
    return NextResponse.json(
      { error: 'Socket endpoint failed', socketEnabled: false }, 
      { status: 500 }
    );
  }
} 