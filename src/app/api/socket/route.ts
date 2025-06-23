import { NextRequest, NextResponse } from 'next/server';
import { initSocketServer, NextApiResponseWithSocket } from '@/lib/socket';

// This route is needed to initialize the Socket.io server
export async function GET(req: NextRequest, res: NextApiResponseWithSocket) {
  try {
    // Initialize the socket server if it's not already running
    initSocketServer(req as any, res);
    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Socket initialization error:', error);
    return new NextResponse(JSON.stringify({ error: 'Failed to initialize socket server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 