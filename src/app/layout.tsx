import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { SettingsProvider } from '@/context/SettingsContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LavaBackground from '@/components/LavaBackground';
import DynamicMeta from '@/components/DynamicMeta';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'FoxSwap - Обмен криптовалют',
  description: 'Быстрый и надёжный обмен криптовалют по лучшим курсам',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <SettingsProvider>
          <LanguageProvider>
            <DynamicMeta />
            <LavaBackground />
            <Header />
            <main className="flex-1 pt-24 relative z-10">
              {children}
            </main>
            <Footer />
            <ChatWidget />
          </LanguageProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
