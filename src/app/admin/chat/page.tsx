'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useChat, Chat } from '@/hooks/useChat';
import { Send, User, Clock, Trash2, X, MessageCircle, Settings, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminChatPage() {
  const { chats, sendMessage, markAsRead, deleteChat, totalUnread, loading } = useChat();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  // Mark as read when selecting chat
  useEffect(() => {
    if (selectedChat && selectedChat.unreadCount > 0) {
      markAsRead(selectedChat.id);
    }
  }, [selectedChat?.id]);

  // Update selected chat when chats change
  useEffect(() => {
    if (selectedChat) {
      const updated = chats.find(c => c.id === selectedChat.id);
      if (updated) {
        setSelectedChat(updated);
      }
    }
  }, [chats]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || isSending) return;
    setIsSending(true);
    
    try {
      await sendMessage(selectedChat.id, message.trim(), 'admin');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (confirm('Удалить этот чат?')) {
      await deleteChat(chatId);
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }
    }
  };

  const sortedChats = [...chats].sort((a, b) => 
    new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Чат поддержки</h1>
          <p className="text-gray-500 mt-1">
            {totalUnread > 0 ? `${totalUnread} непрочитанных сообщений` : 'Все сообщения прочитаны'}
          </p>
        </div>
        <Link href="/admin/chat/settings">
          <motion.button
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Settings className="w-5 h-5" />
            Настройки чата
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-80px)]">
        {/* Chat List */}
        <div className="card-dark overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-white font-medium">Чаты ({chats.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sortedChats.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Нет активных чатов</p>
              </div>
            ) : (
              sortedChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat)}
                  className={`p-4 border-b border-gray-800 cursor-pointer hover:bg-gray-800/50 transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-gray-800/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{chat.userName}</span>
                          {chat.unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-sm truncate max-w-[180px]">
                          {chat.messages[chat.messages.length - 1]?.text || 'Нет сообщений'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-gray-600 text-xs">
                        {new Date(chat.lastMessageAt).toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="p-1 text-gray-600 hover:text-red-400 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Messages */}
        <div className="lg:col-span-2 card-dark overflow-hidden flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium">{selectedChat.userName}</h3>
                    <p className="text-gray-500 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(selectedChat.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="lg:hidden p-2 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                        msg.sender === 'admin'
                          ? 'bg-orange-600 text-white rounded-br-md'
                          : 'bg-gray-800 text-white rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'admin' ? 'text-white/60' : 'text-gray-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите ответ..."
                    className="flex-1 px-4 py-3 input-dark rounded-xl"
                    disabled={isSending}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className="px-6 py-3 btn-primary rounded-xl disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </motion.button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500">Выберите чат для просмотра</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
