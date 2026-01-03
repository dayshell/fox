'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePayments } from '@/hooks/usePayments';
import { useCoins } from '@/hooks/useCoins';
import PaymentForm from '@/components/admin/PaymentForm';
import { Plus, Edit2, Trash2, CreditCard, Wallet } from 'lucide-react';
import { PaymentDetails } from '@/types';

export default function AdminPaymentsPage() {
  const { payments, loading } = usePayments();
  const { coins } = useCoins();
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentDetails | undefined>();

  const handleSave = async (data: Partial<PaymentDetails>) => {
    console.log('Saving payment:', data);
    setShowForm(false);
    setEditingPayment(undefined);
  };

  const handleEdit = (payment: PaymentDetails) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Удалить эти реквизиты?')) {
      console.log('Deleting payment:', id);
    }
  };

  const bankPayments = payments.filter(p => p.type === 'bank');
  const cryptoPayments = payments.filter(p => p.type === 'crypto');

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-white">Реквизиты</h1>
          <p className="text-gray-500">Управление платёжными реквизитами</p>
        </motion.div>

        <motion.button
          onClick={() => { setEditingPayment(undefined); setShowForm(true); }}
          className="flex items-center gap-2 px-6 py-3 btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-5 h-5" />
          Добавить
        </motion.button>
      </div>

      {/* Bank Payments */}
      <motion.div className="mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-orange-400" />
          Банковские реквизиты
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="h-20 bg-gray-800 rounded" />
              </div>
            ))
          ) : bankPayments.length === 0 ? (
            <p className="text-gray-600 col-span-2">Нет банковских реквизитов</p>
          ) : (
            bankPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                className="card-dark p-6 hover:border-orange-500/50 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white font-semibold">{payment.bankName}</p>
                    <p className="text-gray-400 font-mono mt-1">{payment.accountNumber}</p>
                    <p className="text-gray-600 text-sm mt-1">{payment.holderName}</p>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleEdit(payment)}
                      className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Crypto Wallets */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-yellow-500" />
          Криптокошельки
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            [...Array(2)].map((_, i) => (
              <div key={i} className="card-dark p-6 animate-pulse">
                <div className="h-20 bg-gray-800 rounded" />
              </div>
            ))
          ) : cryptoPayments.length === 0 ? (
            <p className="text-gray-600 col-span-2">Нет криптокошельков</p>
          ) : (
            cryptoPayments.map((payment, index) => (
              <motion.div
                key={payment.id}
                className="card-dark p-6 hover:border-orange-500/50 transition-all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold">{payment.network}</p>
                    <p className="text-gray-400 font-mono text-sm mt-1 truncate">{payment.walletAddress}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <motion.button
                      onClick={() => handleEdit(payment)}
                      className="p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(payment.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400"
                      whileHover={{ scale: 1.1 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <PaymentForm
            payment={editingPayment}
            coins={coins}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditingPayment(undefined); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
