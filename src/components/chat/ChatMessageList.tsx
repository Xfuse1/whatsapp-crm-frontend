'use client';

import { useEffect, useRef } from 'react';
import { Check, CheckCheck, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import type { ChatMessage } from '@/types/whatsapp';

interface ChatMessageListProps {
  messages: ChatMessage[];
  onRetry?: (messageId: string) => void;
}

export default function ChatMessageList({ messages, onRetry }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس';
    } else {
      return date.toLocaleDateString('ar-EG', { 
        day: 'numeric', 
        month: 'long',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  // Render message status icon
  const renderStatusIcon = (status: string | null | undefined) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-3.5 h-3.5 text-gray-400" />;
      case 'sent':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-50 flex items-center justify-center">
            <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">ابدأ المحادثة</p>
          <p className="text-gray-400 text-sm mt-1">أرسل رسالة للبدء</p>
        </div>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  let currentDate = '';
  
  messages.forEach((message) => {
    const messageDate = formatDate(message.createdAt);
    if (messageDate !== currentDate) {
      currentDate = messageDate;
      groupedMessages.push({ date: messageDate, messages: [message] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(message);
    }
  });

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-2 md:px-16 lg:px-24">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date separator - WhatsApp style */}
          <div className="flex justify-center my-3">
            <div className="bg-white/90 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm">
              {group.date}
            </div>
          </div>

          {/* Messages in this date group */}
          <div className="space-y-1">
            {group.messages.map((message) => {
              const isOutgoing = message.direction === 'out';
              const isSystem = message.direction === 'system';
              const isFailed = message.status === 'failed';
              const isPending = message.status === 'pending';

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center my-2">
                    <div className="bg-yellow-50/90 text-yellow-800 text-xs px-3 py-1.5 rounded-lg shadow-sm">
                      {message.body}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`relative max-w-[65%] ${isPending ? 'opacity-70' : ''}`}>
                    {/* Message bubble - WhatsApp style */}
                    <div
                      className={`relative rounded-lg px-3 py-2 shadow-sm ${
                        isOutgoing
                          ? `${isFailed ? 'bg-red-100' : 'bg-[#d9fdd3]'} rounded-tr-none`
                          : 'bg-white rounded-tl-none'
                      }`}
                    >
                      {/* Bubble tail */}
                      <div
                        className={`absolute top-0 w-3 h-3 ${
                          isOutgoing
                            ? `${isFailed ? 'bg-red-100' : 'bg-[#d9fdd3]'} -right-2`
                            : 'bg-white -left-2'
                        }`}
                        style={{
                          clipPath: isOutgoing
                            ? 'polygon(0 0, 100% 0, 0 100%)'
                            : 'polygon(100% 0, 0 0, 100% 100%)',
                        }}
                      />
                      
                      {/* Message content */}
                      <p className="text-sm text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
                        {message.body}
                      </p>
                      
                      {/* Time and status */}
                      <div className={`flex items-center gap-1 mt-1 justify-end`}>
                        <span className="text-[11px] text-gray-500">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOutgoing && (
                          <span className="ml-0.5">
                            {renderStatusIcon(message.status)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Retry button for failed messages */}
                    {isFailed && onRetry && (
                      <button
                        onClick={() => onRetry(message.id)}
                        className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                        title="إعادة المحاولة"
                      >
                        <RefreshCw className="w-4 h-4 text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} className="h-1" />
    </div>
  );
}
