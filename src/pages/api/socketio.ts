import { Server as NetServer } from 'http';
import { NextApiRequest } from 'next';
import { Server as ServerIO } from 'socket.io';
import { NextApiResponseWithSocket } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  // Check if socket server is already initialized
  if (!res.socket.server.io) {
    console.log('Setting up Socket.io server...');
    
    // Create a new Socket.io instance
    const io = new ServerIO(res.socket.server as NetServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    // Handle socket connections
    io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);

      // Join a team room
      socket.on('join-team', (teamId: string) => {
        socket.join(teamId);
        console.log(`Socket ${socket.id} joined team: ${teamId}`);
      });

      // Handle sending a new message
      socket.on('send-message', async (message) => {
        console.log('New message received:', message);
        
        try {
          // Save message to database (optional)
          const savedMessage = await saveMessageToDatabase(message);
          
          // Broadcast to all team members
          io.to(message.teamId).emit('new-message', savedMessage || message);
        } catch (error) {
          console.error('Error handling message:', error);
          socket.emit('error', { message: 'Failed to process message' });
        }
      });

      // Handle disconnections
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });

    // Store the Socket.io server instance
    res.socket.server.io = io;
  }

  res.end();
}

// Helper function to save message to database
async function saveMessageToDatabase(message: any) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error('Failed to save message');
    }

    const data = await response.json();
    return data.message;
  } catch (error) {
    console.error('Error saving message to database:', error);
    return null;
  }
} 