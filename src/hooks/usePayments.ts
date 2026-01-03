'use client';

import { useState, useEffect } from 'react';
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

export function usePayments() {
  const [payments, setPayments] = useState<PaymentDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPayments(demoPayments);
      setLoading(false);
    }, 500);
  }, []);

  return { payments, loading };
}
