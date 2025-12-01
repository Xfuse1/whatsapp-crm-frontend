'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import type { Chat } from '@/types/whatsapp';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export default function ChatSidebar({ chats, selectedChatId, onSelectChat }: ChatSidebarProps) {
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
    <div className="w-80 bg-gradient-to-b from-gray-50 to-white border-l border-gray-200 flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-3">المحادثات</h2>
        
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
        {chats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-3">💬</div>
            <p className="font-medium">لا توجد محادثات حتى الآن</p>
            <p className="text-sm mt-1">ابدأ بمراسلة عميل جديد</p>
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-5xl mb-3">🔍</div>
            <p className="font-medium">لا توجد نتائج</p>
            <p className="text-sm mt-1">جرب البحث بكلمات أخرى</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-full p-4 text-right transition-all duration-200 group relative ${
                  selectedChatId === chat.id 
                    ? 'bg-gradient-to-l from-green-50 to-green-100 border-r-4 border-green-600 shadow-sm' 
                    : 'hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-medium ${
                    selectedChatId === chat.id ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {formatTime(chat.lastMessageAt)}
                  </span>
                  <div className="flex items-center gap-2 flex-1 ml-3">
                    <h3 className={`font-semibold truncate ${
                      selectedChatId === chat.id ? 'text-gray-900' : 'text-gray-800 group-hover:text-gray-900'
                    }`}>
                      {chat.title || 'بدون اسم'}
                    </h3>
                    {/* Avatar circle */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      selectedChatId === chat.id ? 'bg-green-600' : 'bg-gradient-to-br from-green-500 to-green-600'
                    }`}>
                      {(chat.title || '?').charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
                {chat.unreadCount && chat.unreadCount > 0 && (
                  <div className="flex justify-end mt-1">
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-green-600 rounded-full shadow-md">
                      {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
