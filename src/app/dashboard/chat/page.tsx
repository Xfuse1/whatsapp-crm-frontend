'use client';

import { useState, useEffect } from 'react';
import type { Chat, ChatMessage } from '@/types/whatsapp';
import { fetchChats, fetchMessages, sendWhatsAppMessage } from '@/lib/apiClient';
import { getSocket, onIncomingMessage, offIncomingMessage } from '@/lib/socket';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Initial load: fetch chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoadingChats(true);
        const data = await fetchChats();
        setChats(data);
        // Auto-select first chat if available
        if (data.length > 0 && !selectedChatId) {
          setSelectedChatId(data[0].id);
        }
      } catch (error) {
        console.error('[Chat] Failed to load chats:', error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    loadChats();
  }, []);

  // When chat is selected, load messages
  useEffect(() => {
    if (!selectedChatId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        const data = await fetchMessages(selectedChatId);
        setMessages(data);
      } catch (error) {
        console.error('[Chat] Failed to load messages:', error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChatId]);

  // Realtime: listen for incoming messages
  useEffect(() => {
    const socket = getSocket();

    const handleIncomingMessage = (payload: {
      chatId: string;
      message: any;
      sessionKey?: string;
    }) => {
      console.log('[Chat] Incoming message:', payload);

      // Map backend message to ChatMessage type
      const newMessage: ChatMessage = {
        id: payload.message.id,
        chatId: payload.message.chat_id || payload.chatId,
        direction: payload.message.direction,
        body: payload.message.body || '',
        createdAt: payload.message.created_at,
        fromJid: payload.message.from_jid || null,
        toJid: payload.message.to_jid || null,
        status: payload.message.status || null,
      };

      // Check if chat already exists in list
      const chatExists = chats.find((c) => c.id === payload.chatId);
      if (!chatExists) {
        // Optionally refetch chats or add minimal chat object
        fetchChats()
          .then((data) => setChats(data))
          .catch((err) => console.error('[Chat] Failed to refetch chats:', err));
      }

      // If this message belongs to selected chat, append it
      if (selectedChatId === payload.chatId) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    onIncomingMessage(handleIncomingMessage);

    return () => {
      offIncomingMessage(handleIncomingMessage);
    };
  }, [chats, selectedChatId]);

  // Handle selecting a chat
  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  // Handle sending a message
  const handleSend = async (text: string) => {
    if (!selectedChatId) {
      console.warn('[Chat] No chat selected');
      return;
    }

    // Determine recipient JID from last message
    const lastMessage = messages[messages.length - 1];
    let toJid: string;

    if (!lastMessage || (!lastMessage.fromJid && !lastMessage.toJid)) {
      console.error('[Chat] Cannot determine recipient JID');
      alert('لا يمكن تحديد المستلم. الرجاء المحاولة مرة أخرى.');
      return;
    }

    // If last message was incoming (direction='in'), reply to fromJid
    // Otherwise use toJid
    if (lastMessage.direction === 'in') {
      toJid = lastMessage.fromJid || '';
    } else {
      toJid = lastMessage.toJid || '';
    }

    if (!toJid) {
      console.error('[Chat] No valid JID found');
      alert('لا يمكن إرسال الرسالة. معرّف المستلم غير صحيح.');
      return;
    }

    // Optimistic update: add message to UI immediately
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      chatId: selectedChatId,
      direction: 'out',
      body: text,
      createdAt: new Date().toISOString(),
      fromJid: null,
      toJid,
      status: 'sent',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    // Send message to backend
    try {
      setIsSending(true);
      await sendWhatsAppMessage(toJid, text);
    } catch (error) {
      console.error('[Chat] Failed to send message:', error);
      // TODO: Optionally remove optimistic message or mark as failed
      alert('فشل إرسال الرسالة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  // Determine selected chat for header
  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
      />

      {/* Main chat area */}
      <div className="flex-1 bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
        {selectedChatId && selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Contact avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white font-bold shadow-md">
                  {(selectedChat.title || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {selectedChat.title || 'محادثة'}
                  </h2>
                  <p className="text-xs text-gray-500">آخر ظهور: منذ قليل</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            {isLoadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-gray-500">جاري تحميل الرسائل...</p>
              </div>
            ) : (
              <ChatMessageList messages={messages} />
            )}

            {/* Input */}
            <ChatInput disabled={isSending || !selectedChatId} onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {isLoadingChats ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-lg font-medium">جاري تحميل المحادثات...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-8xl mb-6 animate-bounce">💬</div>
                <p className="text-2xl font-bold text-gray-700 mb-2">مرحباً بك في نظام المحادثات</p>
                <p className="text-gray-500">اختر محادثة من القائمة لعرض الرسائل والبدء بالتواصل</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
