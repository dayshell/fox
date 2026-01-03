'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PaymentDetails, Coin } from '@/types';
import { X, Save, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  payment?: PaymentDetails;
  coins: Coin[];
  onSave: (payment: Partial<PaymentDetails>) => Promise<void>;
  onCancel: () => void;
}

export default function PaymentForm({ payment, coins, onSave, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    type: payment?.type || 'bank' as 'bank' | 'crypto',
    bankName: payment?.bankName || '',
    accountNumber: payment?.accountNumber || '',
    holderName: payment?.holderName || '',
    coinId: payment?.coinId || '',
    walletAddress: payment?.walletAddress || '',
    network: payment?.network || '',
    isActive: payment?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);

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
        className="card-dark p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {payment ? 'Редактировать реквизиты' : 'Добавить реквизиты'}
          </h2>
          <button onClick={onCancel} className="text-gray-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Тип</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'bank' })}
                className={`py-3 rounded-xl font-medium transition-all ${
                  formData.type === 'bank'
                    ? 'bg-orange-600 text-white'
                    : 'bg-dark-input text-gray-400 hover:bg-gray-800'
                }`}
              >
                Банк
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'crypto' })}
                className={`py-3 rounded-xl font-medium transition-all ${
                  formData.type === 'crypto'
                    ? 'bg-orange-600 text-white'
                    : 'bg-dark-input text-gray-400 hover:bg-gray-800'
                }`}
              >
                Криптокошелёк
              </button>
            </div>
          </div>

          {formData.type === 'bank' ? (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Название банка</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-4 py-3 input-dark"
                  placeholder="Сбербанк"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Номер карты/счёта</label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 input-dark"
                  placeholder="4276 **** **** 1234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Имя владельца</label>
                <input
                  type="text"
                  value={formData.holderName}
                  onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                  className="w-full px-4 py-3 input-dark"
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Криптовалюта</label>
                <select
                  value={formData.coinId}
                  onChange={(e) => setFormData({ ...formData, coinId: e.target.value })}
                  className="w-full px-4 py-3 input-dark"
                  required
                >
                  <option value="">Выберите монету</option>
                  {coins.map((coin) => (
                    <option key={coin.id} value={coin.id}>{coin.name} ({coin.symbol})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Адрес кошелька</label>
                <input
                  type="text"
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  className="w-full px-4 py-3 input-dark font-mono text-sm"
                  placeholder="0x..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Сеть</label>
                <input
                  type="text"
                  value={formData.network}
                  onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                  className="w-full px-4 py-3 input-dark"
                  placeholder="ERC20, TRC20, BEP20..."
                />
              </div>
            </>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded"
            />
            <span className="text-gray-300">Активны</span>
          </label>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onCancel} className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-400">
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
