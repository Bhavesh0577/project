import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const initSocketServer = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    console.log('Initializing Socket.io server...');
    
    const io = new SocketIOServer(res.socket.server);
    
    io.on('connection', socket => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Join a team room when requested
      socket.on('join-team', (teamId: string) => {
        socket.join(teamId);
        console.log(`Socket ${socket.id} joined team: ${teamId}`);
      });
      
      // Leave a team room when requested
      socket.on('leave-team', (teamId: string) => {
        socket.leave(teamId);
        console.log(`Socket ${socket.id} left team: ${teamId}`);
      });
      
      // Handle new messages
      socket.on('send-message', (message: any) => {
        // Broadcast to all clients in the same team room
        io.to(message.teamId).emit('new-message', message);
      });
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
    
    res.socket.server.io = io;
  }
  
  return res.socket.server.io;
}; 