'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '@/types';
import ru from '@/messages/ru.json';
import en from '@/messages/en.json';
import uz from '@/messages/uz.json';
import tg from '@/messages/tg.json';
import ka from '@/messages/ka.json';
import de from '@/messages/de.json';
import fr from '@/messages/fr.json';
import it from '@/messages/it.json';
import es from '@/messages/es.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Messages = Record<string, any>;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const messages: Record<Language, Messages> = { ru, en, uz, tg, ka, de, fr, it, es };

const validLanguages: Language[] = ['ru', 'en', 'uz', 'tg', 'ka', 'de', 'fr', 'it', 'es'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ru');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('language') as Language;
    if (saved && validLanguages.includes(saved)) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const keys = key.split('.');
    let value: any = messages[language];
    for (const k of keys) {
      value = value?.[k];
    }
    let result = value || key;
    
    // Replace parameters like {amount}, {symbol}, etc.
    if (params && typeof result === 'string') {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      });
    }
    
    return result;
  };

  if (!mounted) return null;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
