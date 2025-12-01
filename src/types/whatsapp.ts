export interface WhatsAppConnectionStatus {
  sessionId: string;
  isConnected: boolean;
  phoneNumber?: string;
}

export interface WhatsAppQRResponse {
  qr: string | null;
}

export interface SendMessageRequest {
  to: string;
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  message: string;
}

export interface WhatsAppMessage {
  id: string;
  sessionId: string;
  from: string;
  to: string;
  body: string;
  timestamp: Date;
  isFromMe: boolean;
  hasMedia: boolean;
}

export interface Chat {
  id: string;
  title: string | null;
  type: 'single' | 'group' | 'broadcast' | string;
  lastMessageAt: string | null;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  direction: 'in' | 'out' | 'system' | string;
  body: string | null;
  createdAt: string;
  fromJid?: string | null;
  toJid?: string | null;
  status?: string | null;
}
