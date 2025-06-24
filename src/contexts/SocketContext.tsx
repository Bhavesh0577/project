'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

// Mock socket interface for deployment compatibility
interface MockSocket {
  emit: (event: string, data: any) => void;
  on: (event: string, callback: Function) => void;
  disconnect: () => void;
}

interface SocketContextType {
  socket: MockSocket | null;
  isConnected: boolean;
  error: Error | null;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  error: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<MockSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // For serverless deployment, use a mock socket
    const isServerless = process.env.NODE_ENV === 'production';
    
    if (isServerless) {
      // Mock socket for production/serverless environments
      const mockSocket: MockSocket = {
        emit: (event: string, data: any) => {
          console.log('Mock socket emit:', event, data);
        },
        on: (event: string, callback: Function) => {
          console.log('Mock socket listener added for:', event);
        },
        disconnect: () => {
          console.log('Mock socket disconnect');
        }
      };
      
      setSocket(mockSocket);
      setIsConnected(true);
      setError(null);
    } else {
      // In development, try to use real socket.io if available
      try {
        const { io } = require('socket.io-client');
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
          path: '/api/socketio',
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
          console.log('Socket connected successfully');
          setIsConnected(true);
          setError(null);
        });

        socketInstance.on('disconnect', () => {
          console.log('Socket disconnected');
          setIsConnected(false);
        });

        socketInstance.on('connect_error', (err: Error) => {
          console.warn('Socket connection failed, using mock instead:', err);
          // Fall back to mock socket on error
          const mockSocket: MockSocket = {
            emit: (event: string, data: any) => console.log('Fallback emit:', event, data),
            on: (event: string, callback: Function) => console.log('Fallback listener:', event),
            disconnect: () => console.log('Fallback disconnect')
          };
          setSocket(mockSocket);
          setIsConnected(true);
          setError(null);
        });

        setSocket(socketInstance);

        return () => {
          socketInstance.disconnect();
          socketInstance.removeAllListeners();
        };
      } catch (err) {
        console.warn('Socket.io not available, using mock:', err);
        // Fallback to mock socket
        const mockSocket: MockSocket = {
          emit: (event: string, data: any) => console.log('Fallback emit:', event, data),
          on: (event: string, callback: Function) => console.log('Fallback listener:', event),
          disconnect: () => console.log('Fallback disconnect')
        };
        setSocket(mockSocket);
        setIsConnected(true);
      }
    }
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected, error }}>
      {children}
    </SocketContext.Provider>
  );
}; 