import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(): Socket {
  if (socket?.connected) return socket;
  socket = io(API_BASE, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}

export function useSocket(active: boolean) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!active) return;
    socketRef.current = connectSocket();
    return () => {
      // Don't disconnect on unmount — socket is shared globally
    };
  }, [active]);

  return socketRef.current;
}
