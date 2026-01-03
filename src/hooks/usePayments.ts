'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaymentDetails } from '@/types';

const demoPayments: PaymentDetails[] = [
  {
    id: '1',
    type: 'bank',
    bankName: 'Сбербанк',
    accountNumber: '4276 **** **** 1234',
    holderName: 'Иванов Иван Иванович',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    type: 'bank',
    bankName: 'Тинькофф',
    accountNumber: '5536 **** **** 5678',
    holderName: 'Иванов Иван Иванович',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    type: 'crypto',
    coinId: 'btc',
    walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    type: 'crypto',
    coinId: 'eth',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD12',
    network: 'ERC20',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    type: 'crypto',
    coinId: 'usdt-trc20',
    walletAddress: 'TN3W4H6jPGcLqpNVtGPDADYFkSZTPu8cLr',
    network: 'TRC20',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const _k = 'fxs_pd';

function _g(): PaymentDetails[] {
  if (typeof window === 'undefined') return demoPayments;
  const d = localStorage.getItem(_k);
  if (d) {
    try {
      const p = JSON.parse(d);
      return p.map((x: any) => ({
        ...x,
        createdAt: new Date(x.createdAt),
        updatedAt: new Date(x.updatedAt),
      }));
    } catch {
      return demoPayments;
    }
  }
  localStorage.setItem(_k, JSON.stringify(demoPayments));
  return demoPayments;
}

function _s(p: PaymentDetails[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(_k, JSON.stringify(p));
}

export function usePayments() {
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setPayments(_g());
  }, []);

  useEffect(() => {
    refresh();
    setLoading(false);
    const i = setInterval(refresh, 2000);
    return () => clearInterval(i);
  }, [refresh]);

  const addPayment = useCallback((data: Omit<PaymentDetails, 'id' | 'createdAt' | 'updatedAt'>) => {
    const n: PaymentDetails = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
    const u = [...payments, n];
    setPayments(u);
    _s(u);
    return n;
  }, [payments]);

  const updatePayment = useCallback((id: string, data: Partial<PaymentDetails>) => {
    const u = payments.map(p => p.id === id ? { ...p, ...data, updatedAt: new Date() } : p);
    setPayments(u);
    _s(u);
  }, [payments]);

  const deletePayment = useCallback((id: string) => {
    const u = payments.filter(p => p.id !== id);
    setPayments(u);
    _s(u);
  }, [payments]);

  return { payments, loading, addPayment, updatePayment, deletePayment, refresh };
}
