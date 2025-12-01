import { config } from './env';
import type { Chat, ChatMessage } from '@/types/whatsapp';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async get<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[API] GET ${path} failed:`, error);
      throw error;
    }
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`[API] POST ${path} failed:`, error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient(config.apiBaseUrl);

// Typed helper functions for WhatsApp chat operations
export async function fetchChats(): Promise<Chat[]> {
  const response = await apiClient.get<{ chats: any[] }>('/api/whatsapp/chats');
  return response.chats.map((chat) => ({
    id: chat.id,
    title: chat.title || null,
    type: chat.type || 'single',
    lastMessageAt: chat.last_message_at || chat.lastMessageAt || null,
    unreadCount: chat.unread_count || chat.unreadCount || 0,
  }));
}

export async function fetchMessages(chatId: string): Promise<ChatMessage[]> {
  const response = await apiClient.get<{ messages: any[] }>(`/api/whatsapp/chats/${chatId}/messages`);
  return response.messages.map((msg) => ({
    id: msg.id,
    chatId: msg.chat_id || msg.chatId,
    direction: msg.direction,
    body: msg.body || null,
    createdAt: msg.created_at || msg.createdAt,
    fromJid: msg.from_jid || msg.fromJid || null,
    toJid: msg.to_jid || msg.toJid || null,
    status: msg.status || null,
  }));
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<void> {
  await apiClient.post('/api/whatsapp/send', { to, message });
}
