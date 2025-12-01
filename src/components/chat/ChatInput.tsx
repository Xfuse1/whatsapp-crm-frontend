'use client';

import { useState, KeyboardEvent, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, File, Image as ImageIcon, Mic } from 'lucide-react';
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
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setShowEmojiPicker(false);
      }
      if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
        setShowAttachMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    target.style.height = `${Math.min(target.scrollHeight, 100)}px`;
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

  const hasContent = message.trim().length > 0;

  return (
    <div className="bg-[#f0f2f5] border-t border-gray-200 relative">
      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-200 bg-white">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 text-sm">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                ) : (
                  <File className="w-4 h-4 text-teal-600" />
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
        <div ref={emojiPickerRef} className="absolute bottom-16 right-4 z-50 shadow-xl rounded-lg overflow-hidden">
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            width={320}
            height={350}
            searchPlaceHolder="ابحث..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Attach Menu */}
      {showAttachMenu && (
        <div ref={attachMenuRef} className="absolute bottom-16 left-4 z-40 bg-white shadow-xl rounded-2xl border border-gray-100 p-3 min-w-[180px]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-right"
          >
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <File className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-700 text-sm">ملف</span>
          </button>
          <button
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.accept = 'image/*';
                fileInputRef.current.click();
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors text-right"
          >
            <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-700 text-sm">صورة</span>
          </button>
        </div>
      )}

      <div className="px-4 py-2.5 flex items-end gap-2">
        {/* Emoji button */}
        <button
          disabled={disabled}
          onClick={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowAttachMenu(false);
          }}
          className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
            showEmojiPicker 
              ? 'text-teal-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="رمز تعبيري"
        >
          <Smile className="w-6 h-6" />
        </button>

        {/* Attachment button */}
        <button
          disabled={disabled}
          onClick={() => {
            setShowAttachMenu(!showAttachMenu);
            setShowEmojiPicker(false);
          }}
          className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
            showAttachMenu 
              ? 'text-teal-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          title="إرفاق"
        >
          <Paperclip className="w-6 h-6" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="*/*"
        />

        {/* Message input - WhatsApp style */}
        <div className="flex-1 bg-white rounded-lg shadow-sm">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={disabled ? 'جاري الإرسال...' : 'اكتب رسالة'}
            className="w-full resize-none bg-transparent px-4 py-2.5 text-sm focus:outline-none disabled:cursor-not-allowed placeholder:text-gray-400"
            rows={1}
            dir="auto"
            style={{ minHeight: '42px', maxHeight: '100px' }}
          />
        </div>

        {/* Send / Mic button */}
        {hasContent ? (
          <button
            onClick={handleSend}
            disabled={disabled}
            className="p-2.5 rounded-full bg-teal-500 text-white hover:bg-teal-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            aria-label="إرسال"
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
          <button
            disabled={disabled}
            className="p-2.5 rounded-full text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors"
            aria-label="تسجيل صوتي"
            title="التسجيل الصوتي غير متاح حالياً"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
