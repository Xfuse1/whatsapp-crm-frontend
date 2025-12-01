import { config } from './env';
import type { Chat, ChatMessage } from '@/types/whatsapp';

// Rate limiting and retry configuration
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const RATE_LIMIT_DELAY = 30000; // 30 seconds

// Simple in-memory cache for rate limiting
let rateLimitedUntil = 0;

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRateLimited(): boolean {
    return Date.now() < rateLimitedUntil;
  }

  private setRateLimited(): void {
    rateLimitedUntil = Date.now() + RATE_LIMIT_DELAY;
    console.warn('[API] Rate limited, blocking requests for 30 seconds');
  }

  async get<T>(path: string, retryCount = 0): Promise<T> {
    // Check if we're rate limited
    if (this.isRateLimited()) {
      const waitTime = rateLimitedUntil - Date.now();
      console.warn(`[API] Rate limited, waiting ${Math.ceil(waitTime / 1000)}s...`);
      throw new Error('Rate limited. Please wait before making more requests.');
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Handle rate limiting (429)
      if (response.status === 429) {
        this.setRateLimited();
        const error = new Error('Too Many Requests (429). Please wait before retrying.');
        (error as any).status = 429;
        throw error;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        const err = new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        (err as any).status = response.status;
        throw err;
      }

      return response.json();
    } catch (error: any) {
      console.error(`[API] GET ${path} failed:`, error);

      // Don't retry on rate limit
      if (error?.status === 429) {
        throw error;
      }

      // Retry logic for other errors
      if (retryCount < MAX_RETRIES && !error?.message?.includes('Rate limited')) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[API] Retrying GET ${path} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await this.delay(delay);
        return this.get<T>(path, retryCount + 1);
      }

      throw error;
    }
  }

  async post<T>(path: string, body?: unknown, retryCount = 0): Promise<T> {
    // Check if we're rate limited
    if (this.isRateLimited()) {
      const waitTime = rateLimitedUntil - Date.now();
      console.warn(`[API] Rate limited, waiting ${Math.ceil(waitTime / 1000)}s...`);
      throw new Error('Rate limited. Please wait before making more requests.');
    }

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle rate limiting (429)
      if (response.status === 429) {
        this.setRateLimited();
        const error = new Error('Too Many Requests (429). Please wait before retrying.');
        (error as any).status = 429;
        throw error;
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        const err = new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
        (err as any).status = response.status;
        throw err;
      }

      return response.json();
    } catch (error: any) {
      console.error(`[API] POST ${path} failed:`, error);

      // Don't retry on rate limit
      if (error?.status === 429) {
        throw error;
      }

      // Retry logic for other errors (but not for POST to avoid duplicate actions)
      // Only retry if it seems like a network error
      if (retryCount < MAX_RETRIES && error?.message?.includes('fetch')) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount);
        console.log(`[API] Retrying POST ${path} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await this.delay(delay);
        return this.post<T>(path, body, retryCount + 1);
      }

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
