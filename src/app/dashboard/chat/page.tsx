'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Chat, ChatMessage } from '@/types/whatsapp';
import { fetchChats, fetchMessages, sendWhatsAppMessage } from '@/lib/apiClient';
import { getSocket } from '@/lib/socket';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatMessageList from '@/components/chat/ChatMessageList';
import ChatInput from '@/components/chat/ChatInput';

// Play notification sound for incoming messages
const playNotificationSound = () => {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {
      // Ignore errors if audio can't play (user hasn't interacted yet)
    });
  } catch (e) {
    // Ignore if audio not supported
  }
};

// Show browser notification
const showNotification = (title: string, body: string) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/whatsapp-icon.svg',
      tag: 'whatsapp-message',
    });
  }
};

// Request notification permission
const requestNotificationPermission = () => {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
};

export default function ChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Store contact JID for the selected chat
  const contactJidRef = useRef<string | null>(null);
  
  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);
  
  // Deduplicate messages by ID
  const addMessageIfNew = useCallback((newMessage: ChatMessage) => {
    setMessages((prev) => {
      // Check if message already exists (by ID or temp ID pattern)
      const exists = prev.some(
        (m) => m.id === newMessage.id || 
        (m.id.startsWith('temp-') && m.body === newMessage.body && m.direction === newMessage.direction)
      );
      
      if (exists) {
        // If exists and is temp, replace with real message
        return prev.map((m) => {
          if (m.id.startsWith('temp-') && m.body === newMessage.body && m.direction === newMessage.direction) {
            return newMessage;
          }
          return m;
        });
      }
      
      return [...prev, newMessage];
    });
  }, []);

  // Update message status
  const updateMessageStatus = useCallback((messageId: string, status: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status } : m))
    );
  }, []);

  // Initial load: fetch chats
  useEffect(() => {
    const loadChats = async () => {
      try {
        setIsLoadingChats(true);
        setError(null);
        const data = await fetchChats();
        setChats(data);
        // Auto-select first chat if available
        if (data.length > 0 && !selectedChatId) {
          setSelectedChatId(data[0].id);
        }
      } catch (err) {
        console.error('[Chat] Failed to load chats:', err);
        setError('فشل تحميل المحادثات. تحقق من اتصالك بالإنترنت.');
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
      contactJidRef.current = null;
      return;
    }

    const loadMessages = async () => {
      try {
        setIsLoadingMessages(true);
        setError(null);
        const data = await fetchMessages(selectedChatId);
        setMessages(data);
        
        // Extract contact JID from messages
        if (data.length > 0) {
          const lastIncoming = data.filter((m) => m.direction === 'in').pop();
          const lastOutgoing = data.filter((m) => m.direction === 'out').pop();
          
          if (lastIncoming?.fromJid) {
            contactJidRef.current = lastIncoming.fromJid;
          } else if (lastOutgoing?.toJid) {
            contactJidRef.current = lastOutgoing.toJid;
          }
        }
      } catch (err) {
        console.error('[Chat] Failed to load messages:', err);
        setError('فشل تحميل الرسائل. حاول مرة أخرى.');
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedChatId]);

  // Socket events: incoming messages, sent confirmations, status updates
  useEffect(() => {
    const socket = getSocket();

    // Handle incoming messages
    const handleIncomingMessage = (payload: {
      chatId: string;
      message: any;
      contact?: any;
      sessionId?: string;
    }) => {
      console.log('[Chat] Incoming message:', payload);

      // Map message fields from backend format
      const msg = payload.message;
      const newMessage: ChatMessage = {
        id: msg.id || `msg-${Date.now()}`,
        chatId: payload.chatId,
        direction: msg.direction || 'in',
        body: msg.body || '',
        createdAt: msg.timestamp || msg.created_at || new Date().toISOString(),
        fromJid: msg.from || msg.from_jid || null,
        toJid: msg.to || msg.to_jid || null,
        status: msg.status || null,
      };

      // Update contact JID if this is the selected chat
      if (selectedChatId === payload.chatId && newMessage.fromJid) {
        contactJidRef.current = newMessage.fromJid;
      }

      // Play sound and show notification for incoming messages (not our own)
      if (newMessage.direction === 'in') {
        playNotificationSound();
        
        // Get contact name from payload or chat list
        const contactName = payload.contact?.displayName || 
          chats.find(c => c.id === payload.chatId)?.title || 
          'رسالة جديدة';
        
        // Show browser notification if not focused on this chat
        if (selectedChatId !== payload.chatId || document.hidden) {
          showNotification(contactName, newMessage.body || 'رسالة جديدة');
        }
      }

      // Update chats list (move chat to top, update last message time)
      setChats((prev) => {
        const chatIndex = prev.findIndex((c) => c.id === payload.chatId);
        if (chatIndex === -1) {
          // New chat - refetch
          fetchChats().then((data) => setChats(data)).catch(console.error);
          return prev;
        }
        
        const updatedChats = [...prev];
        const [chat] = updatedChats.splice(chatIndex, 1);
        const updatedChat = {
          ...chat,
          lastMessageAt: newMessage.createdAt,
          unreadCount: selectedChatId === payload.chatId ? 0 : (chat.unreadCount || 0) + 1,
        };
        return [updatedChat, ...updatedChats];
      });

      // Add message if it's the selected chat
      if (selectedChatId === payload.chatId) {
        addMessageIfNew(newMessage);
      }
    };

    // Handle message sent confirmation (from our own sends)
    const handleMessageSent = (payload: {
      chatId: string;
      message: any;
      tempId?: string;
    }) => {
      console.log('[Chat] Message sent confirmation:', payload);

      if (selectedChatId === payload.chatId) {
        const confirmedMessage: ChatMessage = {
          id: payload.message.id,
          chatId: payload.chatId,
          direction: 'out',
          body: payload.message.body || '',
          createdAt: payload.message.created_at || new Date().toISOString(),
          fromJid: null,
          toJid: payload.message.to_jid || contactJidRef.current,
          status: payload.message.status || 'sent',
        };

        // Replace temp message with confirmed one
        setMessages((prev) =>
          prev.map((m) => {
            if (payload.tempId && m.id === payload.tempId) {
              return confirmedMessage;
            }
            if (m.id.startsWith('temp-') && m.body === confirmedMessage.body) {
              return confirmedMessage;
            }
            return m;
          })
        );
      }
    };

    // Handle message status updates (delivered, read)
    const handleMessageStatus = (payload: {
      messageId: string;
      status: string;
      chatId?: string;
    }) => {
      console.log('[Chat] Message status update:', payload);
      updateMessageStatus(payload.messageId, payload.status);
    };

    // Register socket event listeners
    socket.on('message:incoming', handleIncomingMessage);
    socket.on('message:sent', handleMessageSent);
    socket.on('message:status', handleMessageStatus);
    socket.on('whatsapp:message', handleIncomingMessage); // Alternative event name

    return () => {
      socket.off('message:incoming', handleIncomingMessage);
      socket.off('message:sent', handleMessageSent);
      socket.off('message:status', handleMessageStatus);
      socket.off('whatsapp:message', handleIncomingMessage);
    };
  }, [selectedChatId, chats, addMessageIfNew, updateMessageStatus]);

  // Handle selecting a chat
  const handleSelectChat = useCallback((chatId: string) => {
    setSelectedChatId(chatId);
    
    // Clear unread count for selected chat
    setChats((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c))
    );
  }, []);

  // Handle sending a message
  const handleSend = async (text: string) => {
    if (!selectedChatId) {
      console.warn('[Chat] No chat selected');
      return;
    }

    // Determine recipient JID
    let toJid = contactJidRef.current;

    if (!toJid) {
      // Fallback: try to get from messages
      const lastMessage = messages[messages.length - 1];
      if (lastMessage) {
        toJid = (lastMessage.direction === 'in' ? lastMessage.fromJid : lastMessage.toJid) || null;
      }
    }

    if (!toJid) {
      console.error('[Chat] Cannot determine recipient JID');
      setError('لا يمكن تحديد المستلم. الرجاء تحديث الصفحة.');
      return;
    }

    // Create optimistic message
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: ChatMessage = {
      id: tempId,
      chatId: selectedChatId,
      direction: 'out',
      body: text,
      createdAt: new Date().toISOString(),
      fromJid: null,
      toJid,
      status: 'pending',
    };

    // Add to UI immediately
    setMessages((prev) => [...prev, optimisticMessage]);
    setError(null);

    try {
      setIsSending(true);
      const response = await sendWhatsAppMessage(toJid, text);
      
      // Update with real message ID and status from backend
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { 
          ...m, 
          id: response.data.messageId, 
          status: 'sent' 
        } : m))
      );

      // Update chat's last message time
      setChats((prev) =>
        prev.map((c) =>
          c.id === selectedChatId
            ? { ...c, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch (err: any) {
      console.error('[Chat] Failed to send message:', err);
      
      // Mark message as failed
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: 'failed' } : m))
      );
      
      setError(err?.message || 'فشل إرسال الرسالة. حاول مرة أخرى.');
    } finally {
      setIsSending(false);
    }
  };

  // Retry failed message
  const handleRetry = async (messageId: string) => {
    const failedMessage = messages.find((m) => m.id === messageId);
    if (!failedMessage || failedMessage.status !== 'failed') return;

    // Remove failed message and resend
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
    await handleSend(failedMessage.body || '');
  };

  // Dismiss error
  const dismissError = () => setError(null);

  // Determine selected chat for header
  const selectedChat = chats.find((c) => c.id === selectedChatId);

  return (
    <div className="h-full flex bg-gray-100">
      {/* Sidebar */}
      <ChatSidebar
        chats={chats}
        selectedChatId={selectedChatId}
        onSelectChat={handleSelectChat}
        isLoading={isLoadingChats}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-[#efeae2]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d5ded6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}>
        {selectedChatId && selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="bg-[#f0f2f5] border-b border-gray-200 px-4 py-2.5 flex items-center gap-3 shadow-sm">
              {/* Contact avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-lg overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  {(selectedChat.title || '?').charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-medium text-gray-900 truncate">
                  {selectedChat.title || 'محادثة'}
                </h2>
                <p className="text-xs text-gray-500">اضغط للمزيد من المعلومات</p>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border-b border-red-200 px-4 py-2 flex items-center justify-between">
                <span className="text-sm text-red-700">{error}</span>
                <button
                  onClick={dismissError}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  إغلاق
                </button>
              </div>
            )}

            {/* Messages */}
            {isLoadingMessages ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-gray-500 text-sm">جاري تحميل الرسائل...</p>
                </div>
              </div>
            ) : (
              <ChatMessageList messages={messages} onRetry={handleRetry} />
            )}

            {/* Input */}
            <ChatInput disabled={isSending} onSend={handleSend} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
            {isLoadingChats ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-3 border-teal-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">جاري تحميل المحادثات...</p>
              </div>
            ) : (
              <div className="text-center max-w-md px-4">
                <div className="w-64 h-64 mx-auto mb-6 opacity-30">
                  <svg viewBox="0 0 303 172" fill="currentColor" className="text-gray-400">
                    <path d="M229.565 160.229c32.647-25.212 50.32-60.199 48.818-100.504C277.106 24.102 240.521.325 192.577.325c-23.499 0-46.52 6.212-66.574 17.757-28.546 16.376-48.718 43.104-56.907 75.457-5.105 20.153-4.363 41.104 1.853 60.812l-19.18 68.874 70.088-19.291c11.656 4.763 23.838 8.049 36.318 9.802 37.652 5.292 74.96-7.025 101.39-29.507l-.133-.19c.136.076.271.151.405.227v.001l.001-.001a.019.019 0 01-.003.006l-.855-1.142c-.065-.086-.13-.173-.193-.261l-.001-.001-.002-.003s0 0 0 0c.02.042.04.085.062.127a.58.58 0 00.698.34l.001-.001c-.007-.01-.013-.02-.02-.03 0-.002.001-.003.002-.005l.167-.233-.167.233c.059.082.118.164.179.245l.179-.239c-.06.082-.119.163-.179.245l-.179-.239c.061.082.122.163.184.244l-.184-.244.179.239c-.06-.082-.119-.163-.179-.245l.179.24z"/>
                  </svg>
                </div>
                <h1 className="text-2xl font-light text-gray-700 mb-2">WhatsApp Web</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  أرسل واستقبل الرسائل من متصفحك.
                  <br />
                  اختر محادثة من القائمة للبدء.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
