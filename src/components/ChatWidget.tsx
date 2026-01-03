'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Clock, User } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { usePathname } from 'next/navigation';

export default function ChatWidget() {
  const pathname = usePathname();
  const { settings, isOnline, createChat, sendMessage, getMyChat } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [userName, setUserName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [waitingForAgent, setWaitingForAgent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Get current visitor's chat
  const myChat = getMyChat();

  // Hide on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Don't render if chat is disabled
  if (!settings.enabled) {
    return null;
  }

  const online = isOnline();

  useEffect(() => {
    if (myChat && myChat.messages.length > 0) {
      setShowNameInput(false);
    }
  }, [myChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [myChat?.messages]);

  // Check if admin replied
  useEffect(() => {
    if (myChat && waitingForAgent) {
      const hasAdminReply = myChat.messages.some(m => m.sender === 'admin' && m.text !== settings.welcomeMessage);
      if (hasAdminReply) {
        setWaitingForAgent(false);
      }
    }
  }, [myChat?.messages, waitingForAgent, settings.welcomeMessage]);

  const handleStartChat = async () => {
    if (!userName.trim() || isSending) return;
    setIsSending(true);
    
    try {
      const chat = await createChat(userName.trim());
      setShowNameInput(false);
      
      // Send welcome message from admin
      if (settings.welcomeMessage) {
        setTimeout(async () => {
          await sendMessage(chat.id, settings.welcomeMessage, 'admin');
        }, 500);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
    
    setIsSending(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !myChat || isSending) return;
    setIsSending(true);
    
    try {
      await sendMessage(myChat.id, message.trim(), 'user');
      setMessage('');
      
      // Show waiting message if no admin has replied yet
      const hasAdminReply = myChat.messages.some(m => m.sender === 'admin' && m.text !== settings.welcomeMessage);
      if (!hasAdminReply) {
        setWaitingForAgent(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
    
    setIsSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showNameInput) {
        handleStartChat();
      } else {
        handleSendMessage();
      }
    }
  };

  return (
    <>
      {/* Chat Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center ${
          online ? 'bg-orange-600 hover:bg-orange-500' : 'bg-gray-600 hover:bg-gray-500'
        }`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: isOpen ? 0 : 1, scale: isOpen ? 0 : 1 }}
      >
        <MessageCircle className="w-6 h-6 text-white" />
        {!online && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gray-500 rounded-full flex items-center justify-center">
            <Clock className="w-3 h-3 text-white" />
          </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96 h-[500px] bg-dark-card rounded-2xl shadow-2xl border border-gray-800 flex flex-col overflow-hidden"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between ${online ? 'bg-orange-600' : 'bg-gray-700'}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-xl">🦊</span>
                </div>
                <div>
                  <h3 className="text-white font-medium">Поддержка</h3>
                  <p className="text-white/70 text-xs">
                    {online ? 'Онлайн' : 'Офлайн'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {showNameInput && !myChat ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  {!online && (
                    <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-yellow-400 text-sm">{settings.offlineMessage}</p>
                    </div>
                  )}
                  <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-white font-medium mb-2">Начать чат</h4>
                  <p className="text-gray-500 text-sm mb-4">Введите ваше имя, чтобы начать</p>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ваше имя"
                    className="w-full px-4 py-3 input-dark rounded-xl mb-3"
                    autoFocus
                  />
                  <button
                    onClick={handleStartChat}
                    disabled={!userName.trim() || isSending}
                    className="w-full py-3 btn-primary rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSending ? 'Подождите...' : 'Начать чат'}
                  </button>
                </div>
              ) : (
                <>
                  {!online && (
                    <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-3">
                      <p className="text-yellow-400 text-sm">{settings.offlineMessage}</p>
                    </div>
                  )}
                  
                  {myChat?.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-orange-600 text-white rounded-br-md'
                            : 'bg-gray-800 text-white rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-500'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Waiting for agent message */}
                  {waitingForAgent && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-2 mb-1">
                          <User className="w-4 h-4 text-blue-400" />
                          <span className="text-blue-400 text-xs font-medium">Система</span>
                        </div>
                        <p className="text-blue-300 text-sm">
                          Свободный агент подключится к вам в ближайшее время. Пожалуйста, подождите...
                        </p>
                        <div className="flex gap-1 mt-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            {(!showNameInput || myChat) && (
              <div className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Введите сообщение..."
                    className="flex-1 px-4 py-3 input-dark rounded-xl text-sm"
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isSending}
                    className="px-4 py-3 btn-primary rounded-xl disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
