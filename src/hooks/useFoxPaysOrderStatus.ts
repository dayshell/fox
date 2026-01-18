'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { FoxPaysOrderStatus, FoxPaysSubStatus, FoxPaysPaymentDetail } from '@/types/foxpays';

interface OrderStatusData {
  orderId: string;
  status: FoxPaysOrderStatus;
  subStatus: FoxPaysSubStatus;
  amount: string;
  currency: string;
  paymentGateway: string;
  paymentGatewayName: string;
  paymentDetail: FoxPaysPaymentDetail | null;
  expiresAt: number;
  finishedAt: number | null;
  createdAt: number;
  currentServerTime: number;
}

interface UseFoxPaysOrderStatusReturn {
  status: OrderStatusData | null;
  loading: boolean;
  error: string | null;
  isExpired: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  remainingTime: number;
  refetch: () => void;
  stopPolling: () => void;
}

const POLL_INTERVAL = 10000; // 10 seconds

function getFoxPaysSettings() {
  if (typeof window === 'undefined') return { apiUrl: '', accessToken: '' };
  
  try {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return {
        apiUrl: settings.foxpaysApiUrl || '',
        accessToken: settings.foxpaysAccessToken || '',
      };
    }
  } catch (e) {
    console.error('Failed to parse settings');
  }
  return { apiUrl: '', accessToken: '' };
}

export function useFoxPaysOrderStatus(
  orderId: string | null,
  enabled: boolean = true
): UseFoxPaysOrderStatusReturn {
  const [status, setStatus] = useState<OrderStatusData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!orderId) {
      console.log('[useFoxPaysOrderStatus] No orderId provided');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const settings = getFoxPaysSettings();
      console.log('[useFoxPaysOrderStatus] ===== FETCH START =====');
      console.log('[useFoxPaysOrderStatus] Fetching order:', orderId);
      console.log('[useFoxPaysOrderStatus] Settings:', { apiUrl: settings.apiUrl, hasToken: !!settings.accessToken });
      console.log('[useFoxPaysOrderStatus] Request URL:', `/api/foxpays/order/${orderId}`);
      
      const response = await fetch(`/api/foxpays/order/${orderId}`, {
        headers: {
          'X-FoxPays-URL': settings.apiUrl,
          'X-FoxPays-Token': settings.accessToken,
        },
      });
      const data = await response.json();

      console.log('[useFoxPaysOrderStatus] API Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Ошибка получения статуса');
      }

      console.log('[useFoxPaysOrderStatus] Order Data:', data.data);
      console.log('[useFoxPaysOrderStatus] Payment Detail:', data.data.paymentDetail);
      console.log('[useFoxPaysOrderStatus] ===== FETCH END =====');

      setStatus(data.data);
    } catch (err) {
      console.error('[useFoxPaysOrderStatus] Error:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Start polling when enabled and orderId is set
  useEffect(() => {
    if (!enabled || !orderId) {
      stopPolling();
      return;
    }

    // Initial fetch
    fetchStatus();

    // Start polling
    pollingRef.current = setInterval(fetchStatus, POLL_INTERVAL);

    return () => {
      stopPolling();
    };
  }, [enabled, orderId, fetchStatus, stopPolling]);

  // Update remaining time every second
  useEffect(() => {
    if (!status?.expiresAt) {
      setRemainingTime(0);
      return;
    }

    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, status.expiresAt - now);
      setRemainingTime(remaining);

      // Stop polling if expired
      if (remaining === 0) {
        stopPolling();
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [status?.expiresAt, stopPolling]);

  // Stop polling when order is completed or failed
  useEffect(() => {
    if (status?.status === 'success' || status?.status === 'fail') {
      stopPolling();
    }
  }, [status?.status, stopPolling]);

  const isExpired = remainingTime === 0 && status?.status === 'pending';
  const isCompleted = status?.status === 'success';
  const isFailed = status?.status === 'fail';

  return {
    status,
    loading,
    error,
    isExpired,
    isCompleted,
    isFailed,
    remainingTime,
    refetch: fetchStatus,
    stopPolling,
  };
}

// Helper to format remaining time
export function formatRemainingTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
