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
  if (typeof window === 'undefined') return { apiUrl: '', accessToken: '', enabled: true };
  
  try {
    const saved = localStorage.getItem('siteSettings');
    if (saved) {
      const settings = JSON.parse(saved);
      return {
        apiUrl: settings.foxpaysApiUrl || '',
        accessToken: settings.foxpaysAccessToken || '',
        enabled: settings.foxpaysEnabled !== false, // enabled by default unless explicitly disabled
      };
    }
  } catch (e) {
    console.error('Failed to parse settings');
  }
  return { apiUrl: '', accessToken: '', enabled: true }; // enabled by default
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
    
    // Check if FoxPays is explicitly disabled in localStorage
    if (settings.enabled === false) {
      console.log('[FoxPays] Explicitly disabled in settings');
      setIsConfigured(false);
      setGateways([]);
      setLoading(false);
      return;
    }

    // If settings are in localStorage, use them
    const hasLocalSettings = settings.apiUrl && settings.accessToken;
    if (hasLocalSettings) {
      setIsConfigured(true);
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[FoxPays] Fetching gateways...');
      
      // Only include headers if settings are available from localStorage
      const headers: HeadersInit = {};
      if (settings.apiUrl && settings.accessToken) {
        headers['X-FoxPays-URL'] = settings.apiUrl;
        headers['X-FoxPays-Token'] = settings.accessToken;
      }
      
      const response = await fetch('/api/foxpays/gateways', {
        headers,
      });
      const data = await response.json();
      console.log('[FoxPays] Response:', data);

      if (!data.success) {
        // If not configured, don't show as error
        if (data.error?.includes('не настроен')) {
          console.log('[FoxPays] Not configured');
          setIsConfigured(false);
          setGateways([]);
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Ошибка загрузки платежных методов');
      }

      setIsConfigured(true);
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

// Helper function to filter gateways by amount and active status
export function filterGatewaysByAmount(
  gateways: FoxPaysPaymentGateway[],
  amount: number
): FoxPaysPaymentGateway[] {
  return gateways.filter(gateway => {
    const minLimit = parseFloat(gateway.min_limit);
    const maxLimit = parseFloat(gateway.max_limit);
    const isActive = gateway.is_active !== false; // Active by default if field is missing
    return amount >= minLimit && amount <= maxLimit && isActive;
  });
}

// Helper function to get gateway by code
export function getGatewayByCode(
  gateways: FoxPaysPaymentGateway[],
  code: string
): FoxPaysPaymentGateway | undefined {
  return gateways.find(gateway => gateway.code === code);
}
