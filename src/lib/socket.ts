import { io, Socket } from 'socket.io-client';
import { config } from './env';

let socket: Socket | null = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let isAuthenticated = false;

// Extract base URL without /api path for Socket.io connection
function getSocketUrl(): string {
  let url = config.apiBaseUrl;
  // Remove /api suffix if present (Socket.io connects to root)
  if (url.endsWith('/api')) {
    url = url.slice(0, -4);
  }
  return url;
}

// Get token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
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
      
      // Authenticate with token after connecting
      const token = getAuthToken();
      if (token && socket) {
        console.log('[Socket.io] 🔐 Sending authentication...');
        socket.emit('auth', { token });
      } else {
        console.warn('[Socket.io] ⚠️ No token found, socket not authenticated');
      }
    });

    socket.on('auth:success', (data) => {
      console.log('[Socket.io] ✅ Authenticated as user:', data.userId);
      isAuthenticated = true;
    });

    socket.on('auth:error', (data) => {
      console.error('[Socket.io] ❌ Authentication failed:', data.message);
      isAuthenticated = false;
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.io] ❌ Disconnected:', reason);
      isAuthenticated = false;
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

// Check if socket is authenticated
export function isSocketAuthenticated(): boolean {
  return isAuthenticated;
}

// Re-authenticate socket (call after login)
export function authenticateSocket(): void {
  const token = getAuthToken();
  if (token && socket?.connected) {
    console.log('[Socket.io] 🔐 Re-authenticating...');
    socket.emit('auth', { token });
  }
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
