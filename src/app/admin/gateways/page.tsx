'use client';

import { useState, useEffect } from 'react';
import { useFoxPaysGateways, toggleGatewayEnabled } from '@/hooks/useFoxPaysGateways';
import { motion } from 'framer-motion';
import { Power, PowerOff, RefreshCw } from 'lucide-react';

export default function GatewaysPage() {
  const { gateways: allGateways, loading, error, refetch } = useFoxPaysGateways();
  const [disabledGateways, setDisabledGateways] = useState<string[]>([]);
  const [allGatewaysFromAPI, setAllGatewaysFromAPI] = useState<any[]>([]);

  // Load disabled gateways and all gateways from API
  useEffect(() => {
    const loadData = async () => {
      // Load disabled list from global settings
      const saved = localStorage.getItem('siteSettings');
      if (saved) {
        const settings = JSON.parse(saved);
        setDisabledGateways(settings.disabledFoxPaysGateways || []);
      }

      // Load all gateways from API (bypassing filter)
      try {
        const settings = JSON.parse(localStorage.getItem('siteSettings') || '{}');
        const response = await fetch('/api/foxpays/gateways', {
          headers: {
            'X-FoxPays-URL': settings.foxpaysApiUrl || '',
            'X-FoxPays-Token': settings.foxpaysAccessToken || '',
          },
        });
        const data = await response.json();
        if (data.success) {
          setAllGatewaysFromAPI(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load gateways:', err);
      }
    };

    loadData();
  }, []);

  const handleToggle = (gatewayCode: string) => {
    toggleGatewayEnabled(gatewayCode);
    
    // Update local state
    setDisabledGateways(prev => {
      const index = prev.indexOf(gatewayCode);
      if (index > -1) {
        return prev.filter(code => code !== gatewayCode);
      } else {
        return [...prev, gatewayCode];
      }
    });

    // Refresh gateways list
    setTimeout(() => refetch(), 100);
  };

  const isEnabled = (gatewayCode: string) => {
    return !disabledGateways.includes(gatewayCode);
  };

  if (loading && allGatewaysFromAPI.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Управление платежными шлюзами</h1>
        <button
          onClick={refetch}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Обновить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allGatewaysFromAPI.map((gateway, index) => {
          const enabled = isEnabled(gateway.code);
          
          return (
            <motion.div
              key={gateway.code}
              className={`p-4 rounded-xl border-2 transition-all ${
                enabled
                  ? 'bg-gray-800/50 border-green-500/30'
                  : 'bg-gray-900/50 border-gray-700 opacity-60'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{gateway.name}</h3>
                  <p className="text-gray-400 text-sm">{gateway.code}</p>
                </div>
                <button
                  onClick={() => handleToggle(gateway.code)}
                  className={`p-2 rounded-lg transition-colors ${
                    enabled
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {enabled ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Лимиты:</span>
                  <span className="text-white">
                    {parseInt(gateway.min_limit).toLocaleString()} - {parseInt(gateway.max_limit).toLocaleString()} {gateway.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Время:</span>
                  <span className="text-white">{gateway.reservation_time} мин</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Статус:</span>
                  <span className={enabled ? 'text-green-400' : 'text-red-400'}>
                    {enabled ? 'Активен' : 'Отключен'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {allGatewaysFromAPI.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400">Нет доступных платежных шлюзов</p>
        </div>
      )}
    </div>
  );
}
