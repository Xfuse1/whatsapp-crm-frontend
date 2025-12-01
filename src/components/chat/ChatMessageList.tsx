'use client';

import { useEffect, useRef } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import type { ChatMessage } from '@/types/whatsapp';

interface ChatMessageListProps {
  messages: ChatMessage[];
}

export default function ChatMessageList({ messages }: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-lg font-medium">ابدأ المحادثة مع العميل</p>
          <p className="text-sm mt-2">اكتب رسالتك في الأسفل</p>
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
    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-gray-100">
      {groupedMessages.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Date separator */}
          <div className="flex justify-center mb-4">
            <div className="bg-white/80 backdrop-blur-sm text-gray-600 text-xs font-medium px-4 py-1.5 rounded-full shadow-sm border border-gray-200">
              {group.date}
            </div>
          </div>

          {/* Messages in this date group */}
          <div className="space-y-3">
            {group.messages.map((message) => {
              const isOutgoing = message.direction === 'out';
              const isSystem = message.direction === 'system';

              if (isSystem) {
                return (
                  <div key={message.id} className="flex justify-center">
                    <div className="bg-amber-50 text-amber-800 text-xs px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                      {message.body}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={message.id}
                  className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div className={`flex items-end gap-2 max-w-[75%] ${isOutgoing ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-md ${
                      isOutgoing ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {isOutgoing ? 'أنت' : 'ع'}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={`rounded-2xl px-4 py-2.5 shadow-md ${
                        isOutgoing
                          ? 'bg-gradient-to-br from-green-500 to-green-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-900 rounded-bl-sm border border-gray-200'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.body}</p>
                      
                      <div className={`flex items-center gap-1 mt-1.5 text-xs ${
                        isOutgoing ? 'text-green-100 justify-end' : 'text-gray-500 justify-start'
                      }`}>
                        <span className="font-medium">{formatTime(message.createdAt)}</span>
                        {message.status && isOutgoing && (
                          <span className="mr-1">
                            {message.status === 'sent' && <Check className="w-3.5 h-3.5" />}
                            {message.status === 'delivered' && <CheckCheck className="w-3.5 h-3.5" />}
                            {message.status === 'read' && <CheckCheck className="w-3.5 h-3.5 text-blue-200" />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
