'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useSettings } from '@/context/SettingsContext';
import { useOrders } from '@/hooks/useOrders';
import { useCoins } from '@/hooks/useCoins';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { migrateLocalStorage } from '@/lib/migrateLocalStorage';

export default function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { settings } = useSettings();
  const { orders } = useOrders();
  const { coins } = useCoins();
  const [isOpen, setIsOpen] = useState(false);

  // Run migration on mount
  useEffect(() => {
    migrateLocalStorage();
  }, []);

  // Hide header on admin pages
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // Get completed orders for the ticker
  const completedOrders = orders.filter(o => o.status === 'completed').slice(0, 10);

  // Get coin logo by symbol
  const getCoinLogo = (symbol: string) => {
    const coin = coins.find(c => c.symbol === symbol);
    return coin?.logoUrl || '';
  };

  // Format time ago
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
    if (diff < 1) return t('ticker.justNow');
    if (diff < 60) return `${diff} ${t('ticker.minAgo')}`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours} ${t('ticker.hoursAgo')}`;
    return `${Math.floor(hours / 24)} ${t('ticker.daysAgo')}`;
  };

  const navItems = [
    { href: '/', label: t('nav.home') },
    { href: '/reviews', label: t('nav.reviews') },
    { href: '/contacts', label: t('nav.contacts') },
  ];

  // Demo data for ticker when no completed orders
  const demoOrders = [
    { id: 'd1', fromSymbol: 'RUB', toSymbol: 'BTC', fromAmount: 15000, toAmount: 0.0023, time: `2 ${t('ticker.minAgo')}` },
    { id: 'd2', fromSymbol: 'USDT', toSymbol: 'ETH', fromAmount: 500, toAmount: 0.145, time: `5 ${t('ticker.minAgo')}` },
    { id: 'd3', fromSymbol: 'RUB', toSymbol: 'USDT', fromAmount: 50000, toAmount: 520, time: `8 ${t('ticker.minAgo')}` },
    { id: 'd4', fromSymbol: 'BTC', toSymbol: 'RUB', fromAmount: 0.01, toAmount: 67500, time: `12 ${t('ticker.minAgo')}` },
    { id: 'd5', fromSymbol: 'ETH', toSymbol: 'USDT', fromAmount: 1.5, toAmount: 5175, time: `15 ${t('ticker.minAgo')}` },
    { id: 'd6', fromSymbol: 'RUB', toSymbol: 'SOL', fromAmount: 30000, toAmount: 2.1, time: `18 ${t('ticker.minAgo')}` },
    { id: 'd7', fromSymbol: 'USDT', toSymbol: 'BTC', fromAmount: 1000, toAmount: 0.015, time: `22 ${t('ticker.minAgo')}` },
    { id: 'd8', fromSymbol: 'RUB', toSymbol: 'ETH', fromAmount: 100000, toAmount: 0.85, time: `25 ${t('ticker.minAgo')}` },
    { id: 'd9', fromSymbol: 'BNB', toSymbol: 'USDT', fromAmount: 2, toAmount: 1180, time: `28 ${t('ticker.minAgo')}` },
    { id: 'd10', fromSymbol: 'RUB', toSymbol: 'BNB', fromAmount: 45000, toAmount: 0.76, time: `32 ${t('ticker.minAgo')}` },
  ];

  return (
    <>
      {/* Top Bar - Recent Exchanges Ticker */}
      <div className="fixed top-0 left-0 right-0 z-50 ticker-lava text-white text-sm py-1.5 overflow-hidden">
        <div className="ticker-track">
          {/* First copy */}
          <div className="ticker-content">
            {completedOrders.length > 0 ? (
              <>
                {completedOrders.map((order, idx) => (
                  <div key={`a-${order.id}-${idx}`} className="ticker-item flex items-center gap-2 px-4">
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.fromCoinSymbol) && (
                        <img src={getCoinLogo(order.fromCoinSymbol)} alt={order.fromCoinSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.amount}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.fromCoinSymbol}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-orange-400" />
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.toCoinSymbol) && (
                        <img src={getCoinLogo(order.toCoinSymbol)} alt={order.toCoinSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.receiveAmount}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.toCoinSymbol}</span>
                    </div>
                    <span className="text-orange-400/70 text-xs whitespace-nowrap ml-1">
                      {formatTimeAgo(order.createdAt)}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {demoOrders.map((order, idx) => (
                  <div key={`a-${order.id}-${idx}`} className="ticker-item flex items-center gap-2 px-4">
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.fromSymbol) && (
                        <img src={getCoinLogo(order.fromSymbol)} alt={order.fromSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.fromAmount.toLocaleString()}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.fromSymbol}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-orange-400" />
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.toSymbol) && (
                        <img src={getCoinLogo(order.toSymbol)} alt={order.toSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.toAmount}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.toSymbol}</span>
                    </div>
                    <span className="text-orange-400/70 text-xs whitespace-nowrap ml-1">{order.time}</span>
                  </div>
                ))}
              </>
            )}
          </div>
          {/* Second copy (duplicate for seamless loop) */}
          <div className="ticker-content">
            {completedOrders.length > 0 ? (
              <>
                {completedOrders.map((order, idx) => (
                  <div key={`b-${order.id}-${idx}`} className="ticker-item flex items-center gap-2 px-4">
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.fromCoinSymbol) && (
                        <img src={getCoinLogo(order.fromCoinSymbol)} alt={order.fromCoinSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.amount}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.fromCoinSymbol}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-orange-400" />
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.toCoinSymbol) && (
                        <img src={getCoinLogo(order.toCoinSymbol)} alt={order.toCoinSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.receiveAmount}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.toCoinSymbol}</span>
                    </div>
                    <span className="text-orange-400/70 text-xs whitespace-nowrap ml-1">
                      {formatTimeAgo(order.createdAt)}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <>
                {demoOrders.map((order, idx) => (
                  <div key={`b-${order.id}-${idx}`} className="ticker-item flex items-center gap-2 px-4">
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.fromSymbol) && (
                        <img src={getCoinLogo(order.fromSymbol)} alt={order.fromSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.fromAmount.toLocaleString()}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.fromSymbol}</span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-orange-400" />
                    <div className="flex items-center gap-1.5">
                      {getCoinLogo(order.toSymbol) && (
                        <img src={getCoinLogo(order.toSymbol)} alt={order.toSymbol} className="w-4 h-4 rounded-full" />
                      )}
                      <span className="text-white font-medium whitespace-nowrap">{order.toAmount}</span>
                      <span className="text-white/70 whitespace-nowrap">{order.toSymbol}</span>
                    </div>
                    <span className="text-orange-400/70 text-xs whitespace-nowrap ml-1">{order.time}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <motion.header 
        className="fixed top-8 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-gray-800"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              {settings.logoUrl ? (
                <Image 
                  src={settings.logoUrl} 
                  alt={settings.siteName} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              ) : (
                <Image 
                  src="/logo.jpg" 
                  alt={settings.siteName} 
                  width={40} 
                  height={40} 
                  className="rounded-full"
                />
              )}
              <span className="text-xl font-bold text-white">{settings.siteName}</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              
              {/* Login and Register buttons hidden */}
              {/* 
              <Link href="/login" className="hidden md:block">
                <button className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                  {t('auth.login')}
                </button>
              </Link>
              
              <Link href="/register" className="hidden md:block">
                <button className="px-6 py-2 btn-outline">
                  {t('auth.register')}
                </button>
              </Link>
              */}

              {/* Mobile menu button */}
              <button
                className="md:hidden text-white"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X /> : <Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <motion.div
            className="md:hidden bg-dark-card border-t border-gray-800"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <nav className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block py-2 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </motion.header>
    </>
  );
}
