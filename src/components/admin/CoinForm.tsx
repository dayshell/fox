'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Coin } from '@/types';
import { X, Save, Loader2 } from 'lucide-react';

interface CoinFormProps {
  coin?: Coin;
  onSave: (coin: Partial<Coin>) => Promise<void>;
  onCancel: () => void;
}

export default function CoinForm({ coin, onSave, onCancel }: CoinFormProps) {
  const [formData, setFormData] = useState({
    name: coin?.name || '',
    symbol: coin?.symbol || '',
    network: coin?.network || '',
    logoUrl: coin?.logoUrl || '',
    walletAddress: coin?.walletAddress || '',
    buyRate: coin?.buyRate || 0,
    sellRate: coin?.sellRate || 0,
    isActive: coin?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

  const networks = ['Bitcoin', 'ERC20', 'TRC20', 'BEP20', 'Solana', 'Polygon', 'Arbitrum', 'Optimism', 'Avalanche C-Chain', 'TON', 'Cosmos', 'Polkadot', 'Cardano', 'XRP Ledger', 'Stellar', 'Litecoin', 'Dogecoin', 'Bitcoin Cash'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="card-dark p-6 w-full max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {coin ? 'Редактировать монету' : 'Добавить монету'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Название</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 input-dark"
              placeholder="Bitcoin"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Символ</label>
            <input
              type="text"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 input-dark"
              placeholder="BTC"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Сеть</label>
            <select
              value={formData.network}
              onChange={(e) => setFormData({ ...formData, network: e.target.value })}
              className="w-full px-4 py-3 input-dark"
            >
              <option value="">Выберите сеть (для крипто)</option>
              {networks.map(net => (
                <option key={net} value={net}>{net}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">URL логотипа</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-4 py-3 input-dark"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Адрес кошелька</label>
            <input
              type="text"
              value={formData.walletAddress}
              onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
              className="w-full px-4 py-3 input-dark font-mono text-sm"
              placeholder="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
            />
            <p className="text-xs text-gray-500 mt-1">Адрес для получения этой монеты</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Курс покупки ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.buyRate}
                onChange={(e) => setFormData({ ...formData, buyRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 input-dark"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Курс продажи ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.sellRate}
                onChange={(e) => setFormData({ ...formData, sellRate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 input-dark"
                required
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded bg-dark-input border-gray-700"
            />
            <span className="text-gray-300">Активна</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400 hover:bg-gray-800"
            >
              Отмена
            </button>
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 btn-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Сохранить</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
