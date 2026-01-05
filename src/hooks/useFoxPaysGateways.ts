'use client';

import { useState, useEffect, useCallback } from 'react';
import { FoxPaysPaymentGateway } from '@/types/foxpays';

interface UseFoxPaysGatewaysReturn {
  gateways: FoxPaysPaymentGateway[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  isConfigured: boolean;
}

function getFoxPaysSettings() {
  if (typeof window === 'undefined') return { apiUrl: '', accessToken: '', enabled: false };
  
  try {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return {
        apiUrl: settings.foxpaysApiUrl || '',
        accessToken: settings.foxpaysAccessToken || '',
        enabled: settings.foxpaysEnabled || false,
      };
    }
  } catch (e) {
    console.error('Failed to parse settings');
  }
  return { apiUrl: '', accessToken: '', enabled: false };
}

export function useFoxPaysGateways(): UseFoxPaysGatewaysReturn {
  const [gateways, setGateways] = useState<FoxPaysPaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  const fetchGateways = useCallback(async () => {
    const settings = getFoxPaysSettings();
    
    console.log('[FoxPays] Settings:', { 
      enabled: settings.enabled, 
      hasApiUrl: !!settings.apiUrl, 
      hasToken: !!settings.accessToken 
    });
    
    if (!settings.enabled || !settings.apiUrl || !settings.accessToken) {
      console.log('[FoxPays] Not configured or disabled');
      setIsConfigured(false);
      setGateways([]);
      setLoading(false);
      return;
    }

    setIsConfigured(true);

    try {
      setLoading(true);
      setError(null);

      console.log('[FoxPays] Fetching gateways...');
      const response = await fetch('/api/foxpays/gateways', {
        headers: {
          'X-FoxPays-URL': settings.apiUrl,
          'X-FoxPays-Token': settings.accessToken,
        },
      });
      const data = await response.json();
      console.log('[FoxPays] Response:', data);

      if (!data.success) {
        throw new Error(data.error || 'Ошибка загрузки платежных методов');
      }

      setGateways(data.data || []);
      console.log('[FoxPays] Gateways loaded:', data.data?.length || 0);
    } catch (err) {
      console.error('[FoxPays] Error:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setGateways([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  return {
    gateways,
    loading,
    error,
    refetch: fetchGateways,
    isConfigured,
  };
}

// Helper function to filter gateways by amount
export function filterGatewaysByAmount(
  gateways: FoxPaysPaymentGateway[],
  amount: number
): FoxPaysPaymentGateway[] {
  return gateways.filter(gateway => {
    const minLimit = parseFloat(gateway.min_limit);
    const maxLimit = parseFloat(gateway.max_limit);
    return amount >= minLimit && amount <= maxLimit;
  });
}

// Helper function to get gateway by code
export function getGatewayByCode(
  gateways: FoxPaysPaymentGateway[],
  code: string
): FoxPaysPaymentGateway | undefined {
  return gateways.find(gateway => gateway.code === code);
}
