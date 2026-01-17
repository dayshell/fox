'use client';

import { useState, useCallback } from 'react';
import { ExchangeOrder } from '@/types/foxpays';

interface CreateOrderParams {
  amount: number;
  currency: string;
  payment_gateway: string;
  coinId?: string;
  coinSymbol?: string;
  coinAmount?: number;
  userContact?: string;
}

interface UseFoxPaysOrderReturn {
  createOrder: (params: CreateOrderParams) => Promise<ExchangeOrder | null>;
  confirmPayment: (orderId: string) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

function getFoxPaysSettings() {
  if (typeof window === 'undefined') return { apiUrl: '', accessToken: '', merchantId: '' };
  
  try {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return {
        apiUrl: settings.foxpaysApiUrl || '',
        accessToken: settings.foxpaysAccessToken || '',
        merchantId: settings.foxpaysMerchantId || '',
      };
    }
  } catch (e) {
    console.error('Failed to parse settings');
  }
  return { apiUrl: '', accessToken: '', merchantId: '' };
}

export function useFoxPaysOrder(): UseFoxPaysOrderReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getHeaders = useCallback(() => {
    const settings = getFoxPaysSettings();
    return {
      'Content-Type': 'application/json',
      'X-FoxPays-URL': settings.apiUrl,
      'X-FoxPays-Token': settings.accessToken,
      'X-FoxPays-Merchant-ID': settings.merchantId,
    };
  }, []);

  const createOrder = useCallback(async (params: CreateOrderParams): Promise<ExchangeOrder | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/foxpays/order', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка создания заказа');
      }

      return data.data as ExchangeOrder;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [getHeaders]);

  const confirmPayment = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const settings = getFoxPaysSettings();
      const response = await fetch(`/api/foxpays/order/${orderId}/confirm`, {
        method: 'PATCH',
        headers: {
          'X-FoxPays-URL': settings.apiUrl,
          'X-FoxPays-Token': settings.accessToken,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка подтверждения оплаты');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const settings = getFoxPaysSettings();
      const response = await fetch(`/api/foxpays/order/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'X-FoxPays-URL': settings.apiUrl,
          'X-FoxPays-Token': settings.accessToken,
        },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Ошибка отмены заказа');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    createOrder,
    confirmPayment,
    cancelOrder,
    loading,
    error,
    clearError,
  };
}
