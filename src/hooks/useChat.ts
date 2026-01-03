'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  chatId: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
  read: boolean;
}

export interface Chat {
  id: string;
  visitorId: string;
  userName: string;
  userEmail?: string;
  messages: ChatMessage[];
  createdAt: Date;
  lastMessageAt: Date;
  status: 'active' | 'closed';
  unreadCount: number;
}

export interface ChatSettings {
  enabled: boolean;
  workingHoursEnabled: boolean;
  workingHoursStart: string;
  workingHoursEnd: string;
  offlineMessage: string;
  welcomeMessage: string;
}

const CHATS_KEY = 'foxswap_chats';
const CHAT_SETTINGS_KEY = 'foxswap_chat_settings';
const VISITOR_ID_KEY = 'foxswap_visitor_id';

const defaultSettings: ChatSettings = {
  enabled: true,
  workingHoursEnabled: false,
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00',
  offlineMessage: 'Мы сейчас офлайн. Оставьте сообщение, и мы ответим вам как можно скорее!',
  welcomeMessage: 'Здравствуйте! Чем можем помочь?',
};

function getVisitorId(): string {
  if (typeof window === 'undefined') return '';
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

function getStoredChats(): Chat[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CHATS_KEY);
  if (stored) {
    try {
      const chats = JSON.parse(stored);
      return chats.map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt),
        lastMessageAt: new Date(c.lastMessageAt),
        messages: c.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })),
      }));
    } catch {
      return [];
    }
  }
  return [];
}

function saveChats(chats: Chat[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

function getStoredSettings(): ChatSettings {
  if (typeof window === 'undefined') return defaultSettings;
  const stored = localStorage.getItem(CHAT_SETTINGS_KEY);
  if (stored) {
    try {
      return { ...defaultSettings, ...JSON.parse(stored) };
    } catch {
      return defaultSettings;
    }
  }
  return defaultSettings;
}

function saveSettings(settings: ChatSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(settings));
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [settings, setSettings] = useState<ChatSettings>(defaultSettings);
  const [currentChatId, setCurrentChatIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [visitorId, setVisitorId] = useState<string>('');

  // Load initial data
  useEffect(() => {
    const vid = getVisitorId();
    setVisitorId(vid);
    setChats(getStoredChats());
    setSettings(getStoredSettings());
    
    // Find existing chat for this visitor
    const storedChats = getStoredChats();
    const myChat = storedChats.find(c => c.visitorId === vid);
    if (myChat) {
      setCurrentChatIdState(myChat.id);
    }
    
    setLoading(false);
  }, []);

  // Poll for updates every second
  useEffect(() => {
    const interval = setInterval(() => {
      setChats(getStoredChats());
      setSettings(getStoredSettings());
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const setCurrentChatId = useCallback((id: string | null) => {
    setCurrentChatIdState(id);
  }, []);

  const isOnline = useCallback(() => {
    if (!settings.enabled) return false;
    if (!settings.workingHoursEnabled) return true;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [startHour, startMin] = settings.workingHoursStart.split(':').map(Number);
    const [endHour, endMin] = settings.workingHoursEnd.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    return currentTime >= startTime && currentTime <= endTime;
  }, [settings]);

  const createChat = useCallback((userName: string, userEmail?: string): Chat => {
    const currentChats = getStoredChats();
    const vid = getVisitorId();
    
    // Check if chat already exists for this visitor
    const existingChat = currentChats.find(c => c.visitorId === vid);
    if (existingChat) {
      setCurrentChatIdState(existingChat.id);
      return existingChat;
    }
    
    const newChat: Chat = {
      id: Date.now().toString(),
      visitorId: vid,
      userName,
      userEmail,
      messages: [],
      createdAt: new Date(),
      lastMessageAt: new Date(),
      status: 'active',
      unreadCount: 0,
    };
    
    const updated = [...currentChats, newChat];
    saveChats(updated);
    setChats(updated);
    setCurrentChatIdState(newChat.id);
    
    return newChat;
  }, []);

  const sendMessage = useCallback((chatId: string, text: string, sender: 'user' | 'admin') => {
    const currentChats = getStoredChats();
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      chatId,
      text,
      sender,
      timestamp: new Date(),
      read: sender === 'admin',
    };
    
    const updated = currentChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, message],
          lastMessageAt: new Date(),
          unreadCount: sender === 'user' ? chat.unreadCount + 1 : chat.unreadCount,
        };
      }
      return chat;
    });
    
    saveChats(updated);
    setChats(updated);
    
    return message;
  }, []);

  const markAsRead = useCallback((chatId: string) => {
    const currentChats = getStoredChats();
    
    const updated = currentChats.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          unreadCount: 0,
          messages: chat.messages.map(m => ({ ...m, read: true })),
        };
      }
      return chat;
    });
    
    saveChats(updated);
    setChats(updated);
  }, []);

  const closeChat = useCallback((chatId: string) => {
    const currentChats = getStoredChats();
    const updated = currentChats.map(chat => 
      chat.id === chatId ? { ...chat, status: 'closed' as const } : chat
    );
    saveChats(updated);
    setChats(updated);
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    const currentChats = getStoredChats();
    const updated = currentChats.filter(chat => chat.id !== chatId);
    saveChats(updated);
    setChats(updated);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<ChatSettings>) => {
    const updated = { ...getStoredSettings(), ...newSettings };
    saveSettings(updated);
    setSettings(updated);
  }, []);

  const getCurrentChat = useCallback(() => {
    return chats.find(c => c.id === currentChatId) || null;
  }, [chats, currentChatId]);

  const getMyChat = useCallback(() => {
    return chats.find(c => c.visitorId === visitorId) || null;
  }, [chats, visitorId]);

  const totalUnread = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);

  return {
    chats,
    settings,
    loading,
    isOnline,
    createChat,
    sendMessage,
    markAsRead,
    closeChat,
    deleteChat,
    updateSettings,
    currentChatId,
    setCurrentChatId,
    getCurrentChat,
    getMyChat,
    totalUnread,
    visitorId,
  };
}
