'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Coins, CreditCard, MessageSquare, LayoutDashboard, LogOut, Settings, ShoppingCart, Volume2, VolumeX, Users, MessageCircle } from 'lucide-react';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { useAdmins } from '@/hooks/useAdmins';
import { useChat } from '@/hooks/useChat';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { soundEnabled, toggleSound, playSound } = useNotificationSound();
  const { currentAdmin, logout, isSuperAdmin } = useAdmins();
  const { totalUnread } = useChat();

  // Menu items based on role
  const menuItems: { href: string; icon: any; label: string; roles: string[]; badge?: number }[] = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', roles: ['superadmin', 'operator'] },
    { href: '/admin/orders', icon: ShoppingCart, label: 'Заказы', roles: ['superadmin', 'operator'] },
    { href: '/admin/chat', icon: MessageCircle, label: 'Чат', roles: ['superadmin', 'operator'], badge: totalUnread },
    { href: '/admin/coins', icon: Coins, label: 'Монеты', roles: ['superadmin'] },
    { href: '/admin/payments', icon: CreditCard, label: 'Реквизиты', roles: ['superadmin'] },
    { href: '/admin/reviews', icon: MessageSquare, label: 'Отзывы', roles: ['superadmin', 'operator'] },
    { href: '/admin/admins', icon: Users, label: 'Админы', roles: ['superadmin'] },
    { href: '/admin/settings', icon: Settings, label: 'Настройки', roles: ['superadmin'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(currentAdmin?.role || 'operator')
  );

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  const handleSoundToggle = () => {
    toggleSound();
    // Play test sound when enabling
    if (!soundEnabled) {
      setTimeout(() => playSound(), 100);
    }
  };

  return (
    <aside className="w-64 min-h-screen bg-dark-card border-r border-gray-800 p-6 flex flex-col">
      {/* Logo */}
      <Link href="/admin" className="flex items-center gap-2 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center">
          <span className="text-white font-bold text-xl">🦊</span>
        </div>
        <div>
          <span className="text-xl font-bold text-white block">Admin</span>
          {currentAdmin && (
            <span className="text-xs text-gray-500">
              {currentAdmin.role === 'superadmin' ? 'Главный админ' : 'Оператор'}
            </span>
          )}
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {filteredMenuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-orange-600/20 text-orange-400'
                    : 'text-gray-500 hover:bg-gray-800 hover:text-white'
                }`}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Sound Toggle - only for superadmin */}
      {isSuperAdmin && (
        <motion.button
          onClick={handleSoundToggle}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-2 ${
            soundEnabled 
              ? 'text-orange-400 bg-orange-500/10' 
              : 'text-gray-500 hover:bg-gray-800 hover:text-white'
          }`}
          whileHover={{ x: 5 }}
          whileTap={{ scale: 0.98 }}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          <span className="font-medium">{soundEnabled ? 'Звук вкл' : 'Звук выкл'}</span>
        </motion.button>
      )}

      {/* Logout */}
      <motion.button
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-red-500/10 hover:text-red-400 transition-all"
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.98 }}
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Выйти</span>
      </motion.button>
    </aside>
  );
}
