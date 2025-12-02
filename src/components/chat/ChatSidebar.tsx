'use client';

import { useState, useMemo } from 'react';
import { Search, X, MessageSquare, UserPlus, Phone, User } from 'lucide-react';
import type { Chat } from '@/types/whatsapp';
import { createContact } from '@/lib/apiClient';

interface ChatSidebarProps {
  chats: Chat[];
  selectedChatId?: string;
  onSelectChat: (chatId: string) => void;
  onContactCreated?: (chatId: string) => void;
  isLoading?: boolean;
}

export default function ChatSidebar({ chats, selectedChatId, onSelectChat, onContactCreated, isLoading = false }: ChatSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewContactModal, setShowNewContactModal] = useState(false);
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactName, setNewContactName] = useState('');
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

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

  // Sort and filter chats - newest message first (like WhatsApp Web)
  const filteredChats = useMemo(() => {
    // First sort by lastMessageAt descending (newest first)
    const sortedChats = [...chats].sort((a, b) => {
      const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return dateB - dateA; // Descending - newest first
    });
    
    if (!searchQuery.trim()) return sortedChats;
    
    const query = searchQuery.toLowerCase().trim();
    return sortedChats.filter(chat => {
      const title = (chat.title || '').toLowerCase();
      return title.includes(query);
    });
  }, [chats, searchQuery]);

  // Handle creating new contact
  const handleCreateContact = async () => {
    if (!newContactPhone.trim()) {
      setContactError('يرجى إدخال رقم الهاتف');
      return;
    }

    setIsCreatingContact(true);
    setContactError(null);

    try {
      const result = await createContact(newContactPhone, newContactName || undefined);
      
      // Close modal and reset form
      setShowNewContactModal(false);
      setNewContactPhone('');
      setNewContactName('');
      
      // Select the new chat
      if (result.chat?.id) {
        onSelectChat(result.chat.id);
        onContactCreated?.(result.chat.id);
      }
    } catch (error: any) {
      console.error('Failed to create contact:', error);
      setContactError(error.message || 'فشل إنشاء جهة الاتصال');
    } finally {
      setIsCreatingContact(false);
    }
  };

  return (
    <div className="w-[340px] bg-white border-r border-gray-200 flex flex-col">
      {/* Header - WhatsApp style */}
      <div className="bg-[#f0f2f5] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white">
            <MessageSquare className="w-5 h-5" />
          </div>
          {/* Add new contact button */}
          <button
            onClick={() => setShowNewContactModal(true)}
            className="w-10 h-10 rounded-full bg-teal-500 hover:bg-teal-600 flex items-center justify-center text-white transition-colors"
            title="إضافة جهة اتصال جديدة"
          >
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
        <h2 className="text-base font-medium text-gray-700">المحادثات</h2>
      </div>

      {/* New Contact Modal */}
      {showNewContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-teal-500 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">إضافة جهة اتصال جديدة</h3>
              <button
                onClick={() => {
                  setShowNewContactModal(false);
                  setContactError(null);
                  setNewContactPhone('');
                  setNewContactName('');
                }}
                className="text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="201234567890"
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">أدخل الرقم بالكامل مع كود الدولة (مثال: 201234567890)</p>
              </div>
              
              {/* Display Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم (اختياري)
                </label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    placeholder="اسم جهة الاتصال"
                    className="w-full pr-12 pl-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Error Message */}
              {contactError && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg">
                  {contactError}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewContactModal(false);
                  setContactError(null);
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateContact}
                disabled={isCreatingContact || !newContactPhone.trim()}
                className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isCreatingContact ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    جاري الإنشاء...
                  </>
                ) : (
                  'بدء المحادثة'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
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
