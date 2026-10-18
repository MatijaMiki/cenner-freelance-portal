import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_CRM_API_BASE || 'https://api.cenner.hr';

let socket: Socket | null = null;
let gaveUp = false;   // its manager ran out of reconnection attempts

export function getSocket(): Socket | null {
  return socket;
}

/**
 * One shared socket. While it is connected or still connecting it is reused as it is (a second caller
 * during the handshake used to open, and orphan, another connection). Once its reconnection attempts
 * have run out it is started again, with its listeners still attached.
 */
export function connectSocket(): Socket {
  if (socket && socket.active) {
    if (gaveUp) { gaveUp = false; socket.connect(); }
    return socket;
  }
  socket?.disconnect();
  gaveUp = false;
  socket = io(API_BASE, {
    withCredentials: true,
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
  });
  socket.io.on('reconnect_failed', () => { gaveUp = true; });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
  gaveUp = false;
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
