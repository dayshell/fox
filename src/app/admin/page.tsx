'use client';

import { motion } from 'framer-motion';
import { Coins, MessageSquare, ShoppingCart, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useOrders } from '@/hooks/useOrders';
import { useCoins } from '@/hooks/useCoins';
import { useReviews } from '@/hooks/useReviews';
import { useAdmins } from '@/hooks/useAdmins';

export default function AdminDashboard() {
  const { orders } = useOrders();
  const { coins } = useCoins();
  const { reviews } = useReviews();
  const { isSuperAdmin } = useAdmins();

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'paid').length;
  const completedOrders = orders.filter(o => o.status === 'completed').length;

  // Stats based on role
  const stats = isSuperAdmin ? [
    { label: 'Новые заказы', value: pendingOrders.toString(), icon: Clock, href: '/admin/orders', color: 'from-orange-500 to-orange-700' },
    { label: 'Завершённые', value: completedOrders.toString(), icon: CheckCircle, href: '/admin/orders', color: 'from-green-500 to-green-700' },
    { label: 'Монеты', value: coins.length.toString(), icon: Coins, href: '/admin/coins', color: 'from-blue-500 to-blue-700' },
    { label: 'Отзывы', value: reviews.length.toString(), icon: MessageSquare, href: '/admin/reviews', color: 'from-purple-500 to-purple-700' },
  ] : [
    { label: 'Новые заказы', value: pendingOrders.toString(), icon: Clock, href: '/admin/orders', color: 'from-orange-500 to-orange-700' },
    { label: 'Завершённые', value: completedOrders.toString(), icon: CheckCircle, href: '/admin/orders', color: 'from-green-500 to-green-700' },
    { label: 'Отзывы', value: reviews.length.toString(), icon: MessageSquare, href: '/admin/reviews', color: 'from-purple-500 to-purple-700' },
  ];

  // Recent orders
  const recentOrders = orders.slice(0, 5);

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-500 mb-8">Добро пожаловать в панель управления</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              className="card-dark p-6 hover:border-orange-500/50 transition-all cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <motion.div
        className="card-dark p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Последние заказы</h2>
          <Link href="/admin/orders" className="text-orange-400 hover:text-orange-300 text-sm">
            Все заказы →
          </Link>
        </div>
        
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Нет заказов</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href="/admin/orders">
                <div className="flex items-center justify-between p-4 bg-dark-input rounded-xl hover:bg-gray-800/50 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-white font-medium">#{order.orderNumber}</span>
                    <span className="text-gray-400">
                      {order.amount} {order.fromCoinSymbol} → {order.receiveAmount} {order.toCoinSymbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                      order.status === 'paid' ? 'bg-blue-500/20 text-blue-400' :
                      order.status === 'processing' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {order.status === 'completed' ? 'Завершён' :
                       order.status === 'paid' ? 'Оплачен' :
                       order.status === 'processing' ? 'Обрабатывается' :
                       'Ожидает'}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {order.createdAt.toLocaleDateString('ru-RU')}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        className="card-dark p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Быстрые действия</h2>
        <div className={`grid grid-cols-1 ${isSuperAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
          <Link href="/admin/orders">
            <motion.button
              className="w-full py-4 rounded-xl bg-orange-600/20 text-orange-400 font-medium hover:bg-orange-600/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ShoppingCart className="w-5 h-5 inline mr-2" />
              Просмотреть заказы
            </motion.button>
          </Link>
          {isSuperAdmin && (
            <>
              <Link href="/admin/coins">
                <motion.button
                  className="w-full py-4 rounded-xl bg-blue-600/20 text-blue-400 font-medium hover:bg-blue-600/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + Добавить монету
                </motion.button>
              </Link>
              <Link href="/admin/payments">
                <motion.button
                  className="w-full py-4 rounded-xl bg-green-600/20 text-green-400 font-medium hover:bg-green-600/30 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  + Добавить реквизиты
                </motion.button>
              </Link>
            </>
          )}
          <Link href="/admin/reviews">
            <motion.button
              className="w-full py-4 rounded-xl bg-purple-600/20 text-purple-400 font-medium hover:bg-purple-600/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquare className="w-5 h-5 inline mr-2" />
              Управление отзывами
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
