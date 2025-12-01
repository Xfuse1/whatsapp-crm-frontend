import { io, Socket } from 'socket.io-client';
import { config } from './env';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Extract base URL without /api path for Socket.io connection
function getSocketUrl(): string {
  let url = config.apiBaseUrl;
  // Remove /api suffix if present (Socket.io connects to root)
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
}

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl = getSocketUrl();
    console.log('[Socket.io] Connecting to:', socketUrl);
    
    socket = io(socketUrl, {
      autoConnect: true,
      // Important for cross-origin connections (Vercel -> Render)
      transports: ['websocket', 'polling'],
      withCredentials: true,
      // Reconnection settings
      reconnection: true,
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Timeout settings
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Socket.io] ✅ Connected to server, ID:', socket?.id);
      reconnectAttempts = 0;
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] ❌ Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
      reconnectAttempts++;
      console.error(`[Socket.io] Connection error (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}):`, error.message);
      
      // If websocket fails, try polling
      if (reconnectAttempts === 3 && socket) {
        console.log('[Socket.io] Switching to polling transport...');
        socket.io.opts.transports = ['polling', 'websocket'];
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('[Socket.io] 🔄 Reconnected after', attemptNumber, 'attempts');
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket.io] ❌ Reconnection failed after max attempts');
    });

    socket.on('whatsapp:ready', (data) => {
      console.log('[Socket.io] WhatsApp ready:', data);
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('[Socket.io] WhatsApp QR received');
    });

    socket.on('message:incoming', (data) => {
      console.log('[Socket.io] Incoming message from:', data.chatId);
    });

    socket.on('message:sent', (data) => {
      console.log('[Socket.io] Message sent confirmation:', data.chatId);
    });

    socket.on('whatsapp:disconnected', (data) => {
      console.log('[Socket.io] WhatsApp disconnected:', data);
    });
  }

  return socket;
}

// Check if socket is connected
export function isSocketConnected(): boolean {
  return socket?.connected ?? false;
}

// Force reconnect
export function reconnectSocket(): void {
  if (socket) {
    socket.connect();
  }
}

// Disconnect socket
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

// Typed helper functions for message events
type IncomingMessageHandler = (payload: {
  chatId: string;
  message: any;
  sessionKey?: string;
}) => void;

export function onIncomingMessage(handler: IncomingMessageHandler): void {
  const socket = getSocket();
  socket.on('message:incoming', handler);
}

export function offIncomingMessage(handler: IncomingMessageHandler): void {
  const socket = getSocket();
  socket.off('message:incoming', handler);
}
