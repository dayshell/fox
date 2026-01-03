'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';

// Mock data for demo
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'FX8A2B3C',
    fromCoinId: 'btc',
    fromCoinSymbol: 'BTC',
    fromCoinName: 'Bitcoin',
    toCoinId: 'eth',
    toCoinSymbol: 'ETH',
    toCoinName: 'Ethereum',
    amount: 0.5,
    receiveAmount: 8.5,
    rate: 17,
    customerWallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE',
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
  },
];

// Store orders in localStorage for persistence
const ORDERS_KEY = 'foxswap_orders';

function getStoredOrders(): Order[] {
  if (typeof window === 'undefined') return mockOrders;
  const stored = localStorage.getItem(ORDERS_KEY);
  if (stored) {
    const orders = JSON.parse(stored);
    return orders.map((o: any) => ({
      ...o,
      createdAt: new Date(o.createdAt),
      updatedAt: new Date(o.updatedAt),
    }));
  }
  localStorage.setItem(ORDERS_KEY, JSON.stringify(mockOrders));
  return mockOrders;
}

function saveOrders(orders: Order[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(() => {
    setOrders(getStoredOrders());
  }, []);

  useEffect(() => {
    refreshOrders();
    setLoading(false);

    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ORDERS_KEY) {
        refreshOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Poll for changes every 2 seconds (for same-tab updates)
    const interval = setInterval(refreshOrders, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [refreshOrders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, adminMessage?: string) => {
    const updatedOrders = orders.map(order => 
      order.id === orderId 
        ? { ...order, status, adminMessage, updatedAt: new Date() }
        : order
    );
    setOrders(updatedOrders);
    saveOrders(updatedOrders);
  };

  const getOrderByNumber = (orderNumber: string): Order | undefined => {
    return orders.find(o => o.orderNumber === orderNumber);
  };

  const clearHalfOrders = () => {
    const halfLength = Math.ceil(orders.length / 2);
    const remainingOrders = orders.slice(0, halfLength);
    setOrders(remainingOrders);
    saveOrders(remainingOrders);
  };

  const clearAllOrders = () => {
    setOrders([]);
    saveOrders([]);
  };

  const resetOrders = () => {
    localStorage.removeItem(ORDERS_KEY);
    setOrders(mockOrders);
    saveOrders(mockOrders);
  };

  return { orders, loading, createOrder, updateOrderStatus, getOrderByNumber, clearHalfOrders, clearAllOrders, resetOrders };
}
