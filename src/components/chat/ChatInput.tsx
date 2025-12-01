'use client';

import { useState, KeyboardEvent, useRef } from 'react';
import { Send, Paperclip, Smile, X, File, Image as ImageIcon } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { EmojiClickData } from 'emoji-picker-react';

const EmojiPicker = dynamic(() => import('emoji-picker-react'), { ssr: false });

interface ChatInputProps {
  disabled?: boolean;
  onSend: (text: string) => void;
}

export default function ChatInput({ disabled = false, onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = message.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setMessage('');
      setShowEmojiPicker(false);
      setSelectedFiles([]);
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.substring(0, start) + emojiData.emoji + message.substring(end);
      setMessage(newMessage);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        const newPos = start + emojiData.emoji.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setShowAttachMenu(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white shadow-lg relative">
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-sm">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <File className="w-4 h-4 text-green-600" />
                )}
                <span className="text-gray-700 max-w-[150px] truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Picker Popup */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-50 shadow-2xl rounded-lg border border-gray-200">
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(false)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-md z-10"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
            <EmojiPicker
              onEmojiClick={onEmojiClick}
              width={350}
              height={400}
              searchPlaceHolder="ابحث عن إيموجي..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* Attach Menu */}
      {showAttachMenu && (
        <div className="absolute bottom-20 left-4 z-40 bg-white shadow-xl rounded-lg border border-gray-200 p-2 min-w-[200px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-right"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <File className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-gray-700 font-medium">ملف</span>
          </button>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-lg transition-colors text-right"
          >
            <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-pink-600" />
            </div>
            <span className="text-gray-700 font-medium">صورة</span>
          </button>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* Attachment button */}
          <button
            disabled={disabled}
            onClick={() => setShowAttachMenu(!showAttachMenu)}
            className={`transition-all disabled:opacity-50 disabled:cursor-not-allowed p-2.5 rounded-full ${
              showAttachMenu 
                ? 'text-green-600 bg-green-50' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
            title="إرفاق ملف"
          >
            <Paperclip className="w-5 h-5 rotate-45" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept="*/*"
          />

          {/* Message input */}
          <div className="flex-1 relative bg-white rounded-3xl shadow-sm border border-gray-300 focus-within:border-green-500 focus-within:shadow-md transition-all">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              placeholder={disabled ? 'اختر محادثة لإرسال رسالة...' : 'اكتب رسالة'}
              className="w-full resize-none bg-transparent px-4 py-3 pl-12 text-sm focus:outline-none disabled:cursor-not-allowed"
              rows={1}
              dir="auto"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            {/* Emoji button */}
            <button
              disabled={disabled}
              onClick={() => {
                setShowEmojiPicker(!showEmojiPicker);
                setShowAttachMenu(false);
              }}
              className={`absolute left-3 bottom-3 transition-all disabled:opacity-50 p-1 rounded-full ${
                showEmojiPicker 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="إضافة رمز تعبيري"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={disabled || !message.trim()}
            className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-110 active:scale-95"
            aria-label="إرسال"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
