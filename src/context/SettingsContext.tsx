'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  siteName: string;
  logoUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  telegramBotToken: string;
  telegramChatId: string;
  telegramEnabled: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  sendTelegramNotification: (message: string) => Promise<boolean>;
}

const defaultSettings: Settings = {
  siteName: 'FoxSwap',
  logoUrl: '',
  metaTitle: 'FoxSwap - Обмен криптовалют',
  metaDescription: 'Быстрый и надёжный обмен криптовалют по лучшим курсам',
  metaKeywords: 'криптовалюта, обмен, биткоин, эфириум, USDT, обменник',
  telegramBotToken: '',
  telegramChatId: '',
  telegramEnabled: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(saved) });
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('siteSettings', JSON.stringify(updated));
  };

  const sendTelegramNotification = async (message: string): Promise<boolean> => {
    if (!settings.telegramEnabled || !settings.telegramBotToken || !settings.telegramChatId) {
      return false;
    }
    
    try {
      const response = await fetch(`https://api.telegram.org/bot${settings.telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: settings.telegramChatId,
          text: message,
          parse_mode: 'HTML',
        }),
      });
      return response.ok;
    } catch (error) {
      console.error('Telegram notification failed:', error);
      return false;
    }
  };

  if (!mounted) return null;

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, sendTelegramNotification }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
