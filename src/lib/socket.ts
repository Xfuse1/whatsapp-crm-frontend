import { io, Socket } from 'socket.io-client';
import { config } from './env';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(config.apiBaseUrl, {
      autoConnect: true,
    });

    socket.on('connect', () => {
      console.log('[Socket.io] Connected to server');
    });

    socket.on('disconnect', () => {
      console.log('[Socket.io] Disconnected from server');
    });

    socket.on('whatsapp:ready', (data) => {
      console.log('[Socket.io] WhatsApp ready:', data);
    });

    socket.on('whatsapp:qr', (data) => {
      console.log('[Socket.io] WhatsApp QR received:', data);
    });

    socket.on('message:incoming', (data) => {
      console.log('[Socket.io] Incoming message:', data);
    });

    socket.on('whatsapp:disconnected', (data) => {
      console.log('[Socket.io] WhatsApp disconnected:', data);
    });
  }

  return socket;
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
