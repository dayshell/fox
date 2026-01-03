'use client';

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { Mail, Send } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { t } = useLanguage();
  const { settings } = useSettings();
  const pathname = usePathname();

  // Hide footer on admin pages (except login)
  if (pathname?.startsWith('/admin') && pathname !== '/admin/login') {
    return null;
  }

  return (
    <footer className="bg-dark-card/80 backdrop-blur-sm border-t border-gray-800 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center gap-2 mb-4">
              {settings.logoUrl ? (
                <Image 
                  src={settings.logoUrl} 
                  alt={settings.siteName} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🦊</span>
                </div>
              )}
              <span className="text-xl font-bold text-white">{settings.siteName}</span>
            </Link>
            <p className="text-gray-500 text-sm">
              {t('footer.description')}
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-4">{t('footer.navigation')}</h3>
            <nav className="space-y-2">
              <Link href="/" className="block text-gray-500 hover:text-orange-400 transition-colors">
                {t('nav.home')}
              </Link>
              <Link href="/reviews" className="block text-gray-500 hover:text-orange-400 transition-colors">
                {t('nav.reviews')}
              </Link>
              <Link href="/contacts" className="block text-gray-500 hover:text-orange-400 transition-colors">
                {t('nav.contacts')}
              </Link>
            </nav>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-white font-semibold mb-4">{t('footer.services')}</h3>
            <nav className="space-y-2">
              <span className="block text-gray-500">{t('footer.cryptoExchange')}</span>
              <span className="block text-gray-500">{t('footer.buyBitcoin')}</span>
              <span className="block text-gray-500">{t('footer.sellUsdt')}</span>
            </nav>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-4">{t('nav.contacts')}</h3>
            <div className="space-y-3 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-orange-400" />
                support@foxswap.top
              </div>
              <a 
                href="https://t.me/FoxSwap_Exchange" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-orange-400 transition-colors"
              >
                <Send className="w-4 h-4 text-orange-400" />
                @FoxSwap_Exchange
              </a>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-600 text-sm">
          © {new Date().getFullYear()} {settings.siteName}. {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
}
