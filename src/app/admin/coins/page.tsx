'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCoins } from '@/hooks/useCoins';
import CoinForm from '@/components/admin/CoinForm';
import { Plus, Edit2, Trash2, Coins, ToggleLeft, ToggleRight, Search } from 'lucide-react';
import { Coin } from '@/types';
import Image from 'next/image';

export default function AdminCoinsPage() {
  const { coins, loading, updateCoin, addCoin, deleteCoin, toggleActive, resetCoins } = useCoins();
  const [showForm, setShowForm] = useState(false);
  const [editingCoin, setEditingCoin] = useState<Coin | undefined>();
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [search, setSearch] = useState('');

  const filteredCoins = coins.filter(c => {
    const matchesFilter = filter === 'all' || (filter === 'active' ? c.isActive : !c.isActive);
    const matchesSearch = search === '' || 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.symbol.toLowerCase().includes(search.toLowerCase()) ||
      (c.network && c.network.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleSave = async (data: Partial<Coin>) => {
    if (editingCoin) {
      updateCoin(editingCoin.id, data);
    } else {
      addCoin(data as Omit<Coin, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowForm(false);
    setEditingCoin(undefined);
  };

  const handleEdit = (coin: Coin) => {
    setEditingCoin(coin);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить эту монету?')) {
      deleteCoin(id);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-2xl font-bold text-white">Монеты</h1>
          <p className="text-gray-500 text-sm">Всего: {coins.length} | Активных: {coins.filter(c => c.isActive).length}</p>
        </motion.div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="bg-dark-input border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 w-40"
            />
          </div>

          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-dark-input border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
          >
            <option value="all">Все ({coins.length})</option>
            <option value="active">Активные ({coins.filter(c => c.isActive).length})</option>
            <option value="inactive">Неактивные ({coins.filter(c => !c.isActive).length})</option>
          </select>

          <button
            onClick={() => { if(confirm('Сбросить все монеты к начальным?')) resetCoins(); }}
            className="px-3 py-2 text-sm text-gray-400 border border-gray-700 rounded-lg hover:bg-gray-800"
          >
            Сброс
          </button>

          <motion.button
            onClick={() => { setEditingCoin(undefined); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 btn-primary text-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            Добавить
          </motion.button>
        </div>
      </div>

      {/* Coins Table */}
      <motion.div
        className="card-dark overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-dark-bg/50 border-b border-gray-800 text-xs text-gray-500 font-medium">
          <div className="col-span-3">Монета</div>
          <div className="col-span-1">Символ</div>
          <div className="col-span-2">Сеть</div>
          <div className="col-span-1">Покупка</div>
          <div className="col-span-1">Продажа</div>
          <div className="col-span-2">Статус</div>
          <div className="col-span-2 text-right">Действия</div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : filteredCoins.length === 0 ? (
          <div className="p-8 text-center">
            <Coins className="w-10 h-10 text-gray-700 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Нет монет</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredCoins.map((coin, index) => (
              <motion.div
                key={coin.id}
                className="grid grid-cols-12 gap-2 px-4 py-2.5 items-center hover:bg-gray-800/30 transition-colors text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.02 }}
              >
                {/* Coin */}
                <div className="col-span-3 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {coin.logoUrl ? (
                      <Image src={coin.logoUrl} alt={coin.name} width={28} height={28} />
                    ) : (
                      <Coins className="w-4 h-4 text-orange-400" />
                    )}
                  </div>
                  <span className="text-white text-xs truncate">{coin.name}</span>
                </div>
                
                {/* Symbol */}
                <div className="col-span-1 text-gray-400 text-xs">{coin.symbol}</div>
                
                {/* Network */}
                <div className="col-span-2">
                  {coin.network ? (
                    <span className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px] text-gray-300">{coin.network}</span>
                  ) : (
                    <span className="text-gray-600 text-xs">—</span>
                  )}
                </div>
                
                {/* Buy Rate */}
                <div className="col-span-1 text-green-500 text-xs">${coin.buyRate}</div>
                
                {/* Sell Rate */}
                <div className="col-span-1 text-red-500 text-xs">${coin.sellRate}</div>
                
                {/* Status */}
                <div className="col-span-2">
                  <button
                    onClick={() => toggleActive(coin.id)}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                      coin.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                    }`}
                  >
                    {coin.isActive ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                    {coin.isActive ? 'Активна' : 'Выкл'}
                  </button>
                </div>
                
                {/* Actions */}
                <div className="col-span-2 flex items-center justify-end gap-1">
                  <button
                    onClick={() => handleEdit(coin)}
                    className="p-1.5 rounded hover:bg-gray-800 text-gray-500 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(coin.id)}
                    className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pagination info */}
      {filteredCoins.length > 0 && (
        <div className="mt-4 text-center text-gray-500 text-xs">
          Показано {filteredCoins.length} из {coins.length} монет
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <CoinForm
            coin={editingCoin}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingCoin(undefined); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
