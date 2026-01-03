'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { ChevronDown } from 'lucide-react';
import { Language } from '@/types';
import Image from 'next/image';

const languages: { code: Language; label: string; flagCode: string }[] = [
  { code: 'ru', label: 'RU', flagCode: 'ru' },
  { code: 'en', label: 'EN', flagCode: 'gb' },
  { code: 'uz', label: 'UZ', flagCode: 'uz' },
  { code: 'tg', label: 'TJ', flagCode: 'tj' },
  { code: 'ka', label: 'GE', flagCode: 'ge' },
  { code: 'de', label: 'DE', flagCode: 'de' },
  { code: 'fr', label: 'FR', flagCode: 'fr' },
  { code: 'it', label: 'IT', flagCode: 'it' },
  { code: 'es', label: 'ES', flagCode: 'es' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white transition-colors"
      >
        <Image 
          src={`https://flagcdn.com/w40/${currentLang.flagCode}.png`}
          alt={currentLang.label}
          width={20}
          height={15}
          className="rounded-sm"
        />
        {language.toUpperCase()}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full right-0 mt-1 bg-dark-card border border-gray-800 rounded-lg overflow-hidden shadow-xl z-50 max-h-80 overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                className={`flex items-center gap-2 w-full px-4 py-2 text-left hover:bg-orange-500/10 transition-colors ${
                  language === lang.code ? 'text-orange-400' : 'text-gray-400'
                }`}
              >
                <Image 
                  src={`https://flagcdn.com/w40/${lang.flagCode}.png`}
                  alt={lang.label}
                  width={20}
                  height={15}
                  className="rounded-sm"
                />
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
