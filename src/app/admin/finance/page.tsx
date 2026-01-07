'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useOrders } from '@/hooks/useOrders';
import { useCoins } from '@/hooks/useCoins';
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Calendar, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DailyExpense {
  id: string;
  amount: number;
  date: string;
  comment: string;
}

interface SiteSettings {
  buyCommission?: number;
  sellCommission?: number;
  dailyExpenses?: number;
}

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function isThisMonth(date: Date): boolean {
  const today = new Date();
  return date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getLast7Days(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric' }));
  }
  return days;
}

function getLast30Days(): string[] {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
  }
  return days;
}

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#eab308'];

export default function FinancePage() {
  const { orders, loading: ordersLoading } = useOrders();
  const { coins } = useCoins();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [settings, setSettings] = useState<SiteSettings>({});
  const [todayExpenses, setTodayExpenses] = useState<DailyExpense[]>([]);

  // Load settings and expenses
  useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to parse settings');
      }
    }

    const expensesData = localStorage.getItem('dailyExpenses');
    if (expensesData) {
      try {
        const allExpenses: DailyExpense[] = JSON.parse(expensesData);
        const today = new Date().toISOString().split('T')[0];
        setTodayExpenses(allExpenses.filter(e => e.date === today));
      } catch (e) {
        console.error('Failed to parse expenses');
      }
    }
  }, []);

  // Get average commission rate
  const avgCommission = useMemo(() => {
    const buy = settings.buyCommission ?? 2;
    const sell = settings.sellCommission ?? 2;
    return (buy + sell) / 2 / 100; // Convert to decimal
  }, [settings]);

  // Get today's extra expenses
  const todayExtraExpenses = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  // Daily fixed expenses
  const dailyFixedExpenses = settings.dailyExpenses ?? 0;

  // Calculate statistics
  const stats = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    // Today's stats
    const todayOrders = completedOrders.filter(o => isToday(new Date(o.createdAt)));
    const todayTurnover = todayOrders.reduce((sum, o) => sum + o.amount, 0);
    const todayGrossProfit = todayOrders.reduce((sum, o) => {
      return sum + (o.amount * avgCommission);
    }, 0);
    // Net profit = gross profit - daily expenses - today's extra expenses
    const todayNetProfit = todayGrossProfit - dailyFixedExpenses - todayExtraExpenses;

    // This month's stats
    const monthOrders = completedOrders.filter(o => isThisMonth(new Date(o.createdAt)));
    const monthTurnover = monthOrders.reduce((sum, o) => sum + o.amount, 0);
    const monthGrossProfit = monthOrders.reduce((sum, o) => sum + (o.amount * avgCommission), 0);
    // Calculate days in current month so far
    const today = new Date();
    const daysThisMonth = today.getDate();
    const monthExpenses = dailyFixedExpenses * daysThisMonth;
    // Get all expenses for this month
    const expensesData = localStorage.getItem('dailyExpenses');
    let monthExtraExpenses = 0;
    if (expensesData) {
      try {
        const allExpenses: DailyExpense[] = JSON.parse(expensesData);
        const thisMonth = today.toISOString().slice(0, 7); // YYYY-MM
        monthExtraExpenses = allExpenses
          .filter(e => e.date.startsWith(thisMonth))
          .reduce((sum, e) => sum + e.amount, 0);
      } catch (e) {}
    }
    const monthNetProfit = monthGrossProfit - monthExpenses - monthExtraExpenses;

    // All time stats
    const totalTurnover = completedOrders.reduce((sum, o) => sum + o.amount, 0);
    const totalGrossProfit = completedOrders.reduce((sum, o) => sum + (o.amount * avgCommission), 0);
    const totalOrders = completedOrders.length;

    return {
      todayTurnover,
      todayGrossProfit,
      todayNetProfit,
      todayOrders: todayOrders.length,
      monthTurnover,
      monthGrossProfit,
      monthNetProfit,
      monthOrders: monthOrders.length,
      totalTurnover,
      totalGrossProfit,
      totalOrders,
      dailyFixedExpenses,
      todayExtraExpenses,
      commissionPercent: avgCommission * 100,
    };
  }, [orders, avgCommission, dailyFixedExpenses, todayExtraExpenses]);


  // Chart data for last 7 days
  const weeklyChartData = useMemo(() => {
    const days = getLast7Days();
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    return days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });
      
      const turnover = dayOrders.reduce((sum, o) => sum + o.amount, 0);
      const profit = dayOrders.reduce((sum, o) => sum + (o.amount * avgCommission), 0);
      
      return {
        name: day,
        turnover,
        profit,
        orders: dayOrders.length,
      };
    });
  }, [orders, avgCommission]);

  // Chart data for last 30 days
  const monthlyChartData = useMemo(() => {
    const days = getLast30Days();
    const completedOrders = orders.filter(o => o.status === 'completed');
    
    return days.map((day, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - index));
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayOrders = completedOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });
      
      const turnover = dayOrders.reduce((sum, o) => sum + o.amount, 0);
      const profit = dayOrders.reduce((sum, o) => sum + (o.amount * avgCommission), 0);
      
      return {
        name: day,
        turnover,
        profit,
        orders: dayOrders.length,
      };
    });
  }, [orders, avgCommission]);

  // Coin distribution data
  const coinDistribution = useMemo(() => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    const distribution: Record<string, number> = {};
    
    completedOrders.forEach(o => {
      const key = o.fromCoinSymbol;
      distribution[key] = (distribution[key] || 0) + o.amount;
    });
    
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [orders]);

  const chartData = period === 'week' ? weeklyChartData : monthlyChartData;

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Учёт средств</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'week'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Неделя
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === 'month'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            Месяц
          </button>
        </div>
      </div>


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Turnover */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Сегодня</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Оборот за сегодня</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.todayTurnover)} ₽</p>
          <p className="text-xs text-gray-500 mt-2">{stats.todayOrders} заказов</p>
        </motion.div>

        {/* Today's Profit */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Сегодня</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Чистая прибыль</p>
          <p className={`text-2xl font-bold ${stats.todayNetProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.todayNetProfit >= 0 ? '+' : ''}{formatCurrency(stats.todayNetProfit)} ₽
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Валовая: +{formatCurrency(stats.todayGrossProfit)} ₽ ({stats.commissionPercent.toFixed(1)}%)
          </p>
        </motion.div>

        {/* Month's Turnover */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-400" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Месяц</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Оборот за месяц</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(stats.monthTurnover)} ₽</p>
          <p className="text-xs text-gray-500 mt-2">{stats.monthOrders} заказов</p>
        </motion.div>

        {/* Month's Profit */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">Месяц</span>
          </div>
          <p className="text-gray-400 text-sm mb-1">Чистая прибыль</p>
          <p className={`text-2xl font-bold ${stats.monthNetProfit >= 0 ? 'text-orange-400' : 'text-red-400'}`}>
            {stats.monthNetProfit >= 0 ? '+' : ''}{formatCurrency(stats.monthNetProfit)} ₽
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Валовая: +{formatCurrency(stats.monthGrossProfit)} ₽
          </p>
        </motion.div>
      </div>

      {/* Expenses Info */}
      {(stats.dailyFixedExpenses > 0 || stats.todayExtraExpenses > 0) && (
        <motion.div
          className="bg-dark-card rounded-xl p-4 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Minus className="w-4 h-4 text-red-400" />
              <span className="text-gray-400">Ежедневные расходы:</span>
              <span className="text-red-400 font-medium">{formatCurrency(stats.dailyFixedExpenses)} ₽</span>
            </div>
            {stats.todayExtraExpenses > 0 && (
              <div className="flex items-center gap-2">
                <Minus className="w-4 h-4 text-red-400" />
                <span className="text-gray-400">Расходы за сегодня:</span>
                <span className="text-red-400 font-medium">{formatCurrency(stats.todayExtraExpenses)} ₽</span>
              </div>
            )}
            <div className="ml-auto text-gray-500 text-xs">
              Настроить в разделе "Настройки"
            </div>
          </div>
        </motion.div>
      )}


      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Turnover Chart */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Оборот</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTurnover" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}₽`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [`${formatCurrency(Number(value) || 0)} ₽`, 'Оборот']}
                />
                <Area
                  type="monotone"
                  dataKey="turnover"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorTurnover)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Profit Chart */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Прибыль</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(value) => `${value}₽`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [`${formatCurrency(Number(value) || 0)} ₽`, 'Прибыль']}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorProfit)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>


      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Bar Chart */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Количество заказов</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [Number(value) || 0, 'Заказов']}
                />
                <Bar 
                  dataKey="orders" 
                  fill="#f97316" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Coin Distribution Pie Chart */}
        <motion.div
          className="bg-dark-card rounded-xl p-6 border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h3 className="text-lg font-semibold text-white mb-4">Распределение по валютам</h3>
          <div className="h-64">
            {coinDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coinDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {coinDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value, name) => [`${formatCurrency(Number(value) || 0)} ₽`, String(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                Нет данных
              </div>
            )}
          </div>
          {/* Legend */}
          {coinDistribution.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-4 justify-center">
              {coinDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-400">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        className="bg-dark-card rounded-xl p-6 border border-gray-800"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Общая статистика</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Всего заказов</p>
            <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Общий оборот</p>
            <p className="text-3xl font-bold text-blue-400">{formatCurrency(stats.totalTurnover)} ₽</p>
          </div>
          <div className="text-center p-4 bg-gray-800/50 rounded-xl">
            <p className="text-gray-400 text-sm mb-2">Валовая прибыль</p>
            <p className="text-3xl font-bold text-green-400">+{formatCurrency(stats.totalGrossProfit)} ₽</p>
            <p className="text-xs text-gray-500 mt-1">~{stats.commissionPercent.toFixed(1)}% от оборота</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
