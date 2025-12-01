'use client';

import { useState, useMemo } from 'react';
import { Search, X, MessageSquare } from 'lucide-react';
import type { Chat } from '@/types/whatsapp';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  isLoading?: boolean;
}

export default function ChatSidebar({ chats, selectedChatId, onSelectChat, isLoading = false }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }
  };

  // Filter chats based on search query (by title/name or phone number)
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    
    const query = searchQuery.toLowerCase().trim();
    return chats.filter(chat => {
      const title = (chat.title || '').toLowerCase();
      return title.includes(query);
    });
  }, [chats, searchQuery]);

  return (
    <div className="w-[340px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header - WhatsApp style */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>
        <h2 className="text-base font-medium text-gray-700">المحادثات</h2>
      </div>
      
      {/* Search bar */}
      <div className="px-3 py-2 bg-white border-b border-gray-100">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث أو ابدأ محادثة جديدة"
            className="w-full pr-10 pl-10 py-2 text-sm bg-[#f0f2f5] border-0 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all placeholder:text-gray-500"
            dir="auto"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
        
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم أو رقم..."
            className="w-full pr-10 pl-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            dir="auto"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-500 border-t-transparent mx-auto mb-3"></div>
            <p className="text-gray-500 text-sm">جاري التحميل...</p>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3 opacity-50">💬</div>
            <p className="text-sm">لا توجد محادثات</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-3 opacity-50">🔍</div>
            <p className="text-sm">لا توجد نتائج</p>
          </div>
        ) : (
          <div>
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full px-3 py-3 text-right transition-colors flex items-center gap-3 border-b border-gray-100 ${
                  selectedChatId === chat.id 
                    ? 'bg-[#f0f2f5]' 
                    : 'hover:bg-[#f5f6f6]'
                }`}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-white font-semibold text-lg shrink-0 overflow-hidden">
                  <div className="w-full h-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    {(chat.title || '?').charAt(0).toUpperCase()}
                  </div>
                </div>
                
                {/* Chat info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900 truncate">
                      {chat.title || 'بدون اسم'}
                    </h3>
                    <span className={`text-xs shrink-0 mr-2 ${
                      chat.unreadCount && chat.unreadCount > 0 ? 'text-teal-600 font-medium' : 'text-gray-500'
                    }`}>
                      {formatTime(chat.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500 truncate">
                      {/* Last message preview could go here */}
                      آخر رسالة...
                    </p>
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-medium text-white bg-teal-500 rounded-full shrink-0 mr-2">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
